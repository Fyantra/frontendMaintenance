export interface Document{
    id : number;
    name : string;
    document_type : string;
    file : string | null;
    link : string | null;
    description?: string | null;
    created_at?: Date | string;
    file_url? : string | null;
    file_size? : number;
}