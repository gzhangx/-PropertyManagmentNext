import { IMainSideBarSection } from './page/sidebar'
import { HouseList } from '../components/page/reports/houseList'
import { RentpaymentInfo } from '../components/page/reports/rentpaymentInfo'
import { CashFlowReport } from '../components/page/reports/cashflow'
import { ExpenseByWorkerReport } from '../components/page/reports/expenseByWorkerReport'
import { OwnerList } from '../components/page/reports/ownerList'

import { MaintenanceRecords } from '../components/page/reports/maintenanceList'

import YearlyMaintenanceReport from '../pages/reports/yearlyMaintenanceReport';

import * as dev2 from '../pages/util/dev2'

import { LeaseReport } from './page/reports/lease'
import MonthlyComp from '../pages/reports/MonthlyComp'

import type { JSX } from "react";
import { TableNames } from './types'

type LocalPageInfo = {
    name: string;
    page: JSX.Element;
    table?: TableNames;
}

const inputPages: LocalPageInfo[] = [
    {
        name: 'House Info',
        page: <HouseList />,
        table: 'houseInfo',
    },
    {
        name: 'Payments',
        page: <RentpaymentInfo />,
        table: 'rentPaymentInfo',
    },
    {
        name: 'MaintenanceRecords',
        page: <MaintenanceRecords />,
        table: 'maintenanceRecords',
    },
    {
        name: 'Owners',
        page: <OwnerList />,
        table: 'ownerInfo'
    }
];

const allSections = [
    {
        name: 'PM Reports',
        pages: [
            {
                name: 'Cash Flow',
                page: <CashFlowReport />,
            },
            {
                name: 'Lease Report',
                page: <LeaseReport/>,
            },
            {
                name: 'Comp Report',
                page: <MonthlyComp/>,
            },
            {
                name: '1099 Report',
                page: <ExpenseByWorkerReport />,
            },
            {
                name: 'Yearly 1099 Report',
                page: <YearlyMaintenanceReport/>,
            },
            {
                name: 'Develop 2',
                page: <dev2.DevelopPage />,
                selected: true,
            },
        ]
    },
    {
        name: 'PM Inputs',
        pages: inputPages,
    },
]


const { sections, sideBarContentLookup } = allSections.reduce((acc, sec) => {
    const name = sec.name;
    const getPgName = (p: {name: string}) => `${name}:${p.name}`.replace(/ /g, '');
    const section = {
        name,
        displayName: name,
        pages: sec.pages.map(p => ({ name: getPgName(p), displayName: p.name, selected: p.selected })),
    }
    acc.sectionsByName[name] = section;
    acc.sections.push(section);
    acc.sideBarContentLookup = sec.pages.reduce((acc, p) => {
        const pname = getPgName(p);
        acc.set(pname, p);
        //acc[pname] = p;
        return acc;
    }, acc.sideBarContentLookup);
    return acc;
}, {
    sections: [] as IMainSideBarSection[],
    sideBarContentLookup: new Map<string, LocalPageInfo>(),
    sectionsByName: {} as {[name:string]:IMainSideBarSection},
});

export {
    sections,
    sideBarContentLookup,
};