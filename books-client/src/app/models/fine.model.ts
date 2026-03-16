export interface Fine {
  id: number;
  borrowingId: number;
  bookTitle: string;
  memberName: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
}