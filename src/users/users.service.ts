import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role, User } from '@prisma/client';
import { AuthenticatedUser, TechnicianResponseDto } from './dto/technician-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  // ISSO DAQUI FOI IMPLEMENTADO
  async findTechnicians(user: AuthenticatedUser): Promise<TechnicianResponseDto[]> {
    let where: Prisma.UserWhereInput;

    switch (user.role) {
      case Role.admin:
        where = { role: Role.technician };
        break;
      case Role.supervisor:
        if (!user.teamId) {
          return [];
        }

        where = {
          role: Role.technician,
          teamId: user.teamId,
        };
        break;
      case Role.technician:
        where = {
          id: user.id,
          role: Role.technician,
        };
        break;
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        teamId: true,
      },
    });
  }
}
