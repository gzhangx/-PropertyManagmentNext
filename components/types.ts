import React from "react";

//export type TYPEDBTables = 'ownerInfo' | 'rentPaymentInfo' | 'houseInfo';

export type SortOps = '' | 'asc' | 'desc';
export interface ISqlOrderDef {
    name: string;
    op: SortOps;
    shortDesc: string;
}

export interface IPageFilter {
    id: string;
    table: string;
    field: string;
    op: '>' | '>=' | '=' | '<' | '<=' | '!=' | '<>' | 'in';
    val: string;
};

export interface IPagePropsByTable {
    pagePropsTableInfo: {
        [tableName: string]: {
            sorts: ISqlOrderDef[];
            filters: IPageFilter[];
        };
    };
    reloadCount: number;
};

export interface IPageState {
    pageProps: IPagePropsByTable;
    setPageProps: React.Dispatch<React.SetStateAction<IPagePropsByTable>>;
}

export interface ILoginResponse {
    error?: string;
    token: string;
    name: string;
    id: number;
    ownerPCodes: number[];
}

//copied from api
export type PossibleDbTypes = (string | number | null | Date);
export interface IDBFieldDef {
    field: string; //actual field
    name?: string; //name
    desc?: string;
    type?: '' | undefined | 'int' | 'string' | 'date' | 'datetime'| 'decimal' | 'uuid';
    size?: string;
    required?: boolean;
    isId?: boolean;
    def?: string;
    unique?: boolean;
    ident?: boolean;
    dontUpdate?: boolean;
    isOwnerSecurityField?: boolean;
    isOwnerSecurityParentField?: boolean;
    //key?: 'UNI' | 'PRI' | null;    
    foreignKey?: {
        table: string;
        field: string;
    };
}

export interface IGetModelReturn {
    fields: IDBFieldDef[];
    fieldMap: {
        [key: string]: IDBFieldDef;
    };
}