import { UserRole } from "@prisma/client";

export interface LoginResponseDto {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}
