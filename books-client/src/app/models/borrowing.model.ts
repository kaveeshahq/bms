export interface Borrowing {
  id: number;
  bookId: number;
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

export interface IssueBorrowingDto {
  bookId: number;
  memberId: number;
  dueDays: number;
}