export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publishedYear?: number;
  status: string;
  categoryId: number;
  categoryName: string;
}

export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publishedYear?: number;
  categoryId: number;
}

export interface UpdateBookDto {
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publishedYear?: number;
  categoryId: number;
}