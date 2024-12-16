interface IDbParam {
    address: string;
    indexBy?: string;
    sync: boolean;
    type?: string;
}

export class DbParam {
    address: string;
    indexBy?: string = 'id';
    sync: boolean = true;
    type?: string = 'documents';
    
    constructor({address, indexBy, sync, type} : IDbParam) {
        this.address = address;
        this.indexBy = indexBy;
        this.sync = sync;
        this.type = type;
    }
}