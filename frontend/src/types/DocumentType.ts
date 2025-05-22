export interface Document {
    id: number;
    name: string;
    document_type: 'file' | 'link';
    file: string | null;
    link: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
    file_name?: string;
    file_url?: string;
    file_size?: number;
    download_url?: string;
  }