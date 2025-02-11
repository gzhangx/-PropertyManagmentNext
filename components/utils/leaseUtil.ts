import { orderBy } from 'lodash';
import * as api from '../api'
import moment from 'moment';
import { ILeaseInfo } from '../reportTypes';
export async function getLeaseUtilForHouse(houseID: string) {
    const allLeases = orderBy(await api.getLeases({
        whereArray: [{
            field: 'houseID',
            op: '=',
            val: houseID,
        }]
    }), r => r.startDate, 'desc');


    function findLeaseForDate(date: string | Date | moment.Moment): ILeaseInfo {
        const pd = moment(date);
        for (const l of allLeases) {
            if (moment(l.startDate).isBefore(pd)) {
                return l;
            }
        }
        return null;
    }
    async function matchAllTransactions() {
        const unleasedPayments = await api.getPaymnents({
            whereArray: [
                {
                    field: 'leaseID',
                    op: 'isNULL',
                    val: null,
                },
                {
                    field: 'houseID',
                    op: '=',
                    val: houseID,
                }
            ]
        });
    
        unleasedPayments.forEach(p => {
            const l = findLeaseForDate(p.receivedDate);
            if (l) {
                p.leaseID = l.leaseID;
            }
        });
        return unleasedPayments;
    }


    //Same as IPayment but only needed items
    type IPaymentForLease = {
        receivedAmount: number;
        houseID: string;
        receivedDate: string;
    }
    function calculateLeaseBalances(l: ILeaseInfo, payments: IPaymentForLease[], monthlyDueDate: number, today: string | Date | moment.Moment) {
        interface IPaymentOfMonth {
            paid: number;
            shouldAccumatled: number;
            accumulated: number;
            month: string;
            balance: number;
        }
        interface ILeaseInfoWithPmtInfo {
            totalPayments: number;
            totalBalance: number;
            payments: IPaymentForLease[];
            monthlyInfo: IPaymentOfMonth[];
        }

        const monthlyInfo: IPaymentOfMonth[] = [];
        const now = moment(today);
        const dueDate = now.startOf('month').add(monthlyDueDate, 'days');
        let curMon = moment(l.startDate);
        let shouldAccumatled = 0;
        const lastDueMonth = now.isAfter(dueDate) ? now : now.add(-1, 'month').startOf('month');
        const monthInfoLookup: { [mon: string]: IPaymentOfMonth } = {};
        const YYYYMMFormat = 'YYYY-MM';
        const firstMonthStr = curMon.format(YYYYMMFormat);
        const finalMonthStr = lastDueMonth.format(YYYYMMFormat);
        while (curMon.isSameOrBefore(lastDueMonth)) {
            const month = curMon.format(YYYYMMFormat);
            shouldAccumatled += l.monthlyRent;
            const info: IPaymentOfMonth = {
                month,
                accumulated: 0,
                shouldAccumatled,
                paid: 0,
                balance: 0,
            }
            monthInfoLookup[month] = info;
            monthlyInfo.push(info);
            curMon = curMon.add(1, 'month');
        }
        const lps = orderBy(payments.filter(p => p.houseID === l.houseID).map(p => {
            return {
                ...p,
                receivedDate: moment(p.receivedDate).format('YYYY-MM-DD'),
            }
        }), p => p.receivedDate, 'asc');
        const result: ILeaseInfoWithPmtInfo = lps.reduce((acc, pmt) => {
            const paymentMonth = pmt.receivedDate.substring(0, 7);
            if (paymentMonth < finalMonthStr) {
                acc.totalPayments = acc.totalPayments + pmt.receivedAmount;
                acc.payments.push(pmt);
                console.log(`lookuping up with ${pmt.receivedDate.substring(0, 7)}`)
                const info = monthInfoLookup[paymentMonth] || monthInfoLookup[firstMonthStr];
                info.paid += pmt.receivedAmount;
                info.accumulated = acc.totalPayments;
                info.balance = info.shouldAccumatled - info.accumulated;
                acc.totalBalance = info.shouldAccumatled - info.accumulated;
            }
            return acc;
        }, {
            totalPayments: 0,
            totalBalance: 0,
            payments: [],
            monthlyInfo,
        });
        return result;
    }

    return {
        allLeases,
        findLeaseForDate,
        matchAllTransactions,
        calculateLeaseBalances,
        loadLeasePayments: (lease: ILeaseInfo) => {
            return api.getPaymnents({
                whereArray: [
                    {
                        field: 'leaseID',
                        op: '=',
                        val: lease.leaseID,
                    }
                ]
            });
        }
    }
}