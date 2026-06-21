import { Role } from '@prisma/client';

// ISSO DAQUI FOI IMPLEMENTADO
export interface AuthenticatedUser {
  id: string;
  role: Role;
  teamId: string | null;
}

// ISSO DAQUI FOI IMPLEMENTADO
export class TechnicianResponseDto {
  id: string;
  name: string;
  teamId: string | null;
}
