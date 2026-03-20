/**
 * BookTitle represents a unique book in the library
 * One BookTitle can have multiple BookCopy records (physical copies)
 */
export interface BookTitle {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publishedYear?: number;
  totalCopies: number;
  availableCopies: number;
  categoryId: number;
  categoryName: string;
  copies: BookCopy[];
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * BookTitleDto - minimal list version without copies detail
 */
export interface BookTitleList {
  id: number;
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  categoryId: number;
  categoryName: string;
}

/**
 * BookCopy represents a physical copy of a book
 */
export interface BookCopy {
  id: number;
  copyNumber: number;
  barcodeId?: string;
  status: 'Available' | 'Issued' | 'Reserved' | 'Damaged' | 'Lost';
  acquiredAt: Date;
}

/**
 * DTO for creating a new BookTitle with initial copies
 */
export interface CreateBookTitleDto {
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publishedYear?: number;
  totalCopies: number; // at least 1
  categoryId: number;
}

/**
 * DTO for updating BookTitle metadata
 */
export interface UpdateBookTitleDto {
  title: string;
  author: string;
  publisher?: string;
  publishedYear?: number;
  categoryId: number;
}

/**
 * DTO for updating copy count
 */
export interface UpdateBookCopyCountDto {
  newTotalCopies: number;
}
