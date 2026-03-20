export interface Borrowing {
  id: number;
  bookCopyId: number;
  bookTitleId: number;
  copyNumber: number;
  bookTitle: string;
  bookISBN: string;
  memberId: number;
  memberName: string;
  memberEmail: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  fineAmount?: number;
  finePaid?: boolean;
}

/**
 * For issuing a book - accepts BookTitleId, optionally CopyNumber
 * If CopyNumber is not specified, auto-selects first available copy
 */
export interface IssueBorrowingDto {
  bookTitleId: number;
  memberId: number;
  copyNumber?: number; // Optional: if not specified, auto-select first available
  dueDays: number;
}