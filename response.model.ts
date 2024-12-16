export interface IResponse<T> {
    statusCode: number;
    message?: string;
    hash?: string;
    data?: T;
    count?: number;
    offset?: number;
    limit?: number;
}

export class ResponseModel<T> {
    public statusCode: number;
    public message?: string;
    public hash?: string;
    public data: T;
    public count?: number;
    public offset?: number;
    public limit?: number;

    constructor({
        statusCode,
        message = 'success',
        hash,
        data,
        count,
        offset,
        limit,
    } : IResponse<T>) {
        this.statusCode = statusCode;
        this.message = message;
        this.hash = hash;
        this.data = data;
        this.count = count;
        this.offset = offset;
        this.limit = limit;
    }
}