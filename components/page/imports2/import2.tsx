import React, { useState, useEffect, useReducer } from 'react';
import { googleSheetRead, getOwners, sqlAdd, getHouseInfo, getPaymentRecords, getTenants } from '../../api'
import { EditTextDropdown } from '../../generic/EditTextDropdown'
import { IOwnerInfo, IHouseInfo, IPayment, IIncomeExpensesContextValue } from '../../reportTypes';
import { keyBy, mapValues, omit } from 'lodash'
import { InforDialog, GetInfoDialogHelper } from '../../generic/basedialog';
import moment from 'moment';
import { useRouter } from 'next/router'

import { BaseDialog } from '../../generic/basedialog'
import { ALLFieldNames, IPaymentWithArg, IPageInfo, IPageStates, IStringDict, IPageParms, ISheetRowData } from './types'
import { genericPageLoader, getDisplayHeaders } from './helpers'
import { getPageDefs } from './pageDefs'

import { useIncomeExpensesContext } from '../../states/PaymentExpenseState'
import { IRootPageState, useRootPageContext } from '../../states/RootState'

function getSheetId(rootCtx: IRootPageState, mainCtx: IIncomeExpensesContextValue) : string {
    const loginUserId = rootCtx.userInfo.id;
    const owner = mainCtx.allOwners.find(o => o.ownerID === loginUserId);    
    let sheetId = '';
    if (owner) {        
        sheetId = owner.googleSheetId;
    }
    const firstSelectedOwner = mainCtx.selectedOwners.find(o => o.googleSheetId)
    if (firstSelectedOwner) {
        sheetId = firstSelectedOwner.googleSheetId;
    }
    return sheetId;
}


export function ImportPage() {
    const [dlgContent, setDlgContent] = useState<JSX.Element>(null);
    const router = useRouter();
    const [reloads, setReloads] = useState({
        reloadUsers: 0,        
    })
    //const [progressStr, setProgressStr] = useState('');
    const errorDlg = GetInfoDialogHelper();
    const progressDlg = GetInfoDialogHelper();

    const [curPageState, dispatchCurPageState] = useReducer((state: IPageStates, act: (state: IPageStates) => IPageStates) => act(state) as IPageStates, {
        stateReloaded: 0,
        housesByAddress: {},
        //paymentsByDateEct: {},
        
    } as IPageStates);

    const rootCtx = useRootPageContext();
    const mainCtx = useIncomeExpensesContext();
    const sheetId = getSheetId(rootCtx, mainCtx);
    const selectedOwners = mainCtx.selectedOwners;

    //rootCtx.userInfo.
    //let sheetId = mainCtx.allOwners
    const refreshOwners = () => {
        return getOwners().then(own => {
            dispatchCurPageState(state => {
                return {
                    ...state,
                    existingOwnersById: keyBy(own, 'ownerID'),
                    existingOwnersByName: keyBy(own, 'ownerName'),
                    stateReloaded: state.stateReloaded + 1,
                };
            });
        }).catch(err => {
            errorDlg.setDialogText(err.error || err.message);            
        });
    }

    const refreshTenants = () => {
        return getTenants(selectedOwners).then(tenants => {
            dispatchCurPageState(state => {
                return {
                    ...state, 
                    tenants,
                    tenantByName: keyBy(tenants,t=>t.fullName),
                    stateReloaded: state.stateReloaded+1,
                };
            });            
        });
    }

    useEffect(() => {
        refreshOwners();
        refreshTenants();
    }, [reloads.reloadUsers,selectedOwners]);


    

    const pagePrms: IPageParms = {
        dispatchCurPageState,
        refreshOwners,
        refreshTenants,
        setDlgContent,
        setErrorStr: errorDlg.setDialogText,
        showProgress: msg => progressDlg.setDialogText(msg),
    };
    useEffect(() => {
        if (!curPageState.curPage) return;
        genericPageLoader(pagePrms, sheetId, curPageState).catch(err => {
            const errStr = err.error || err.message;
            console.log('genericPageLoaderError',err)
            errorDlg.setDialogAction(errStr, () => {
                if (errStr && errStr.indexOf('authorization') >= 0) {
                    router.push('/Login')
                }
            })
        })
    }, [sheetId, curPageState.selectedOwners, curPageState.stateReloaded, curPageState.curPage, curPageState.existingOwnersByName, curPageState.payments])
        

    const pages = getPageDefs();
    console.log(`curPageState.stateReloaded=${curPageState.stateReloaded}`);

    
    errorDlg.getDialog.bind(errorDlg);
    progressDlg.getDialog.bind(progressDlg);
    errorDlg.getDialog()
    
    return <div className="container-fluid">
        <BaseDialog children={dlgContent} show={dlgContent != null} />        
        {
            errorDlg.getDialog()
        }
        {
            progressDlg.getDialog()
        }
        <div className="d-sm-flex align-items-center justify-content-between mb-4">        
            <div className="col-xl-6 col-md-6 mb-6">
                <div className="card shadow h-100 py-2 border-left-primary">
                    <div className="card-body">
                        <div className="row no-gutters align-items-center">
                            <div className="col">
                                <div className="text-xs font-weight-bold text-uppercase mb-1 text-primary">Developer Options</div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                    <EditTextDropdown items={pages.map(p => {
                                        return {
                                            label: p.pageName,
                                            value: p,
                                            selected: p.pageName === 'House Info'
                                        }
                                    })
                                    }
                                        onSelectionChanged={sel => {
                                            if (sel) {
                                                dispatchCurPageState(state => {
                                                    return {
                                                        ...state,
                                                        curPage: sel.value,
                                                    }
                                                })
                                            }
                                        }}
                                    ></EditTextDropdown>
                                </div>
                            </div>
                            <div className="col">
                                <button className='btn btn-primary' onClick={() => {
                                    setReloads({
                                        ...reloads,
                                        reloadUsers: ++reloads.reloadUsers,
                                    });
                                }}>Reload Users</button>
                            </div>
                            <div className="col-auto">
                                <i className="fas fa-calendar fa-2x text-gray-300 fa - calendar"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>            
        </div>

        <div className="row">
            <table className='table'>
                <thead>
                    <tr>
                        {
                            getDisplayHeaders(pagePrms, curPageState)
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        curPageState.pageDetails && curPageState.pageDetails.dataRows.map((p, ind) => {
                            let dspCi = curPageState.curPage.displayColumnInfo;                            
                            let sheetRow: ISheetRowData = null;
                            if (curPageState.curPage.dbLoader) {
                                if (p.dataType === 'Sheet') {
                                    sheetRow = p as ISheetRowData;                                    
                                }
                            }                            
                            return <tr key={ind}>{
                                dspCi.map((dc, ck) => {                                    
                                    const customDsp = curPageState.curPage.displayItem ? curPageState.curPage.displayItem(pagePrms, curPageState, sheetRow, dc.field) : null;
                                    return <td key={ck}>{
                                        customDsp || p.displayData[dc.field]
                                    }</td>
                                })
                            }</tr>
                        })
                    }
                </tbody>
            </table>
            
        </div>
    </div>
}


function displayHeader(pagePrms: IPageParms, colName:string, colKey: number) {

}