import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UserAuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    if (typeof this.prismaService.user?.findUnique !== "function") {
      return null;
    }

    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async createUser(payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    if (typeof this.prismaService.user?.create !== "function") {
      throw new Error("User repository is not available.");
    }

    return this.prismaService.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      },
    });
  }
}
