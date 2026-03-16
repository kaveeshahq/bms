export interface Member {
  id: number;
  memberId: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  registeredAt: string;
  isActive: boolean;
}

export interface CreateMemberDto {
  memberId: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
}

export interface UpdateMemberDto {
  memberId: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  isActive: boolean;
}