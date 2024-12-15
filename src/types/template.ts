export interface Template {
    id: number;
    name: string;
    description?: string;
    content: string;
    category_id?: string;
    category?: {
      id: string;
      name: string;
    };
    created_at: string;
    updated_at?: string;
    requires_signature?: boolean;
    required_signatures?: string[];
  }
  
  export interface Category {
    id: string;
    name: string;
  }