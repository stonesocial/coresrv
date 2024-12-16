interface IQuery {
    key?: string
    page: number
    limit: number
}

export class QueryModel {
    key?: string;
    page?: number; 
    limit?: number; 
    
    constructor({
        key = String(),
        page = 1, 
        limit = 20, 
    } : IQuery) {
        this.key = key;
        this.page = parseInt(page.toString());
        this.limit = parseInt(limit.toString());
    }
}