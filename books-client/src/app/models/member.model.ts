export interface Member {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  registeredAt: string;
  isActive: boolean;
}

export interface CreateMemberDto {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
}

export interface UpdateMemberDto {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  isActive: boolean;
}