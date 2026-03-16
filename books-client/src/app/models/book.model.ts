export interface Book {
  id: number;
  bookId: string;
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
  bookId: string;
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publishedYear?: number;
  categoryId: number;
}

export interface UpdateBookDto {
  bookId: string;
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publishedYear?: number;
  categoryId: number;
}