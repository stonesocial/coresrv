export function strIncludes(source: any, element: string) : boolean {
    return (source ?? '').toLowerCase().includes(element.toLowerCase());
}