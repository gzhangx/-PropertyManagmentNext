import { matchItems, loadPageSheetDataRaw} from '../../../../components/page/imports2/utils'
import {
    IDbRowMatchData,
    IDbSaveData,
    IPageInfo,
    ISheetRowData,
    ROWDataType
} from "../../../../components/page/imports2/types";
import assert from 'assert';
import * as api from '../../../../components/api';

describe('HelperTests', function(){
    function getFakeSheetRowData(ref: string, ref2?: string) : ISheetRowData {
        const ret: ISheetRowData = {
            dataType: 'Sheet',
            needUpdate: true,
            displayData: null,
            importSheetData: {
                ref,
            },
            invalid: '',
            matched: null,
            matchToKey: null,
            matcherName: '',
        };
        if (ref2) {
            ret.importSheetData.ref2 = ref2;
        }
        return ret;
    }
    function getFakeDbRowData(ref: string, ref2?: string) : IDbRowMatchData {
        const ret: IDbRowMatchData = {
            dataType: 'DB',
            dbItemData: {
                ref,
            },
            matchedToKey: '',
        };
        if (ref2) {
            ret.dbItemData.ref2 = ref2;
        }
        return ret;
    }

    it('should matchItem ', function() {
        const sheetData: ISheetRowData[] =[
            getFakeSheetRowData('1'),
            getFakeSheetRowData('1'),
        ];
        const dbData: IDbRowMatchData[] = [
            getFakeDbRowData('1'),
            getFakeDbRowData('2'),
        ];

        const matchRes = matchItems(sheetData, dbData, {
            name:'fake',
            getRowKey: (data: IDbSaveData, src) => {
                return data.ref as string;
            }
        });
        assert.equal(matchRes, true);
        assert.deepEqual(sheetData.map(d=>{
            return {
                matched: d.matched?.ref,
                matchedToKey: d.matchToKey,
                matcherName: d.matcherName,
                needUpdate: d.needUpdate,
            }
        }), [{
            matched: '1',
            matchedToKey: '1',
            matcherName: 'fake',
            needUpdate: false,
        },{
            matched: undefined,
            matchedToKey:null,
            matcherName: '',
            needUpdate: true,
        }])
    });


    it('should matchItem 2 steps', function() {
        const sheetData: ISheetRowData[] =[
            getFakeSheetRowData('1', '1'),
            getFakeSheetRowData('1', '2'),
        ];
        const dbData: IDbRowMatchData[] = [
            getFakeDbRowData('1', '1'),
            getFakeDbRowData('2', '2'),
        ];

        const matchRes1 = matchItems(sheetData, dbData, {
            name:'fake',
            getRowKey: (data: IDbSaveData, src) => {
                return (data.ref+'_'+data.ref2) as string;
            }
        });
        assert.equal(matchRes1, true);
        assert.deepEqual(sheetData.map(d=>{
            return {
                matched: d.matched?.ref,
                matchedToKey: d.matchToKey,
                matcherName: d.matcherName,
                needUpdate: d.needUpdate,
            }
        }), [{
            matched: '1',
            matchedToKey: '1_1',
            matcherName: 'fake',
            needUpdate: false,
        },{
            matched: undefined,
            matchedToKey:null,
            matcherName: '',
            needUpdate: true,
        }]);

        const matchRes2 = matchItems(sheetData, dbData, {
            name:'fake',
            getRowKey: (data: IDbSaveData, src) => {
                return data.ref as string;
            }
        });

        assert.deepEqual(sheetData.map(d=>{
            return {
                matched: d.matched?.ref,
                matchedToKey: d.matchToKey,
                matcherName: d.matcherName,
                needUpdate: d.needUpdate,
            }
        }), [{
            matched: '1',
            matchedToKey: '1_1',
            matcherName: 'fake',
            needUpdate: false,
        },{
            matched: undefined,
            matchedToKey:null,
            matcherName: '',
            needUpdate: true,
        }]);

        //PaymentRowCompare: IRowComparer
    });

    it('should load data for real', async function(){
        const curPage = {
            "pageName": "PaymentRecord",
            "range": "A1:F",
            "fieldMap": [
                "receivedDate",
                "receivedAmount",
                "address",
                "paymentTypeID",
                "notes",
                "paymentProcessor"
            ],
            "displayColumnInfo": [
                {
                    "field": "receivedDate",
                    "name": "receivedDate"
                },
                {
                    "field": "receivedAmount",
                    "name": "receivedAmount"
                },
                {
                    "field": "address",
                    "name": "address"
                },
                {
                    "field": "paymentTypeID",
                    "name": "paymentTypeID"
                },
                {
                    "field": "notes",
                    "name": "notes"
                },
                {
                    "field": "paymentProcessor",
                    "name": "paymentProcessor"
                }
            ],
            "dbItemIdField": "paymentID",
            "sheetMustExistField": "receivedDate",
            "rowComparers": [
                {
                    "name": "Payment Row Comparer"
                },
                {
                    "name": "Payment Row Comparer No Notes"
                }
            ],
            "dbInserter": {
                "name": "Payment inserter"
            }
        };
        const sheetId = process.env.SHEETID;

        const res = await api.doPost('auth/login', {
            username: process.env.USERNAME,
            password: process.env.PASSWORD,
        })
        api.setFakeLocalStorage('login.token', res.token);
        //console.log(res);
        console.log('getPayment records');
        const dbRecords = await api.getPaymentRecords().then(r => r as any as IDbSaveData[]);
        //console.log(dbRecords);

        console.log('loadPageSheetDataRaw loadPageSheetDataRaw');
        const pageDataDetails = await loadPageSheetDataRaw(sheetId, curPage as IPageInfo);

    })
})