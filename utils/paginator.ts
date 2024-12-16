import { QueryModel } from "../query.model";

export function paginator(docs: any, query?: QueryModel) : any[] {
    if (query.page != -1 && query.limit != -1) {
        const start = (query.page - 1) * query.limit;
        const end = start + query.limit;
        
        if (docs && docs instanceof Array && docs.length > 0) {
            return (docs.length >= end 
                ? docs.slice(start, end) 
                : docs.slice(start, docs.length)).map((e: any) => e.value);
        }

        return [];
    }

    return docs.map((e: any) => e.value);
}