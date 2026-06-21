import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as argon2 from 'argon2';

import { Role, User } from '@prisma/client';

import { UsersService } from '../users/users.service';

import { CreateAuthDto } from './dto/create-auth.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService){}

  async register(data: RegisterDto){
    const existsUser = await this.usersService.findByEmail(data.email)

    if(existsUser) throw new UnauthorizedException('Email já existe!')

    const requiresTeam =
    data.role === Role.technician ||
    data.role === Role.supervisor;

    if(requiresTeam && !data.teamId) throw new BadRequestException("TimeId é necessario apra o supervisor e técnico")
    
    const passwordHash = await argon2.hash(data.password)

    const user = await this.usersService.create({
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
        teamId: data.teamId,
    })

    return this.generateToken(user);
  }

  async validateUser(email: string, password: string,): Promise<User> {
    const user = await this.usersService.findByEmail(email)

    if(!user) throw new UnauthorizedException("Credenciais inválidas")

    const verifyPassword = await argon2.verify(user.passwordHash, password)

    if(!verifyPassword) throw new UnauthorizedException("Credenciais inválidas")

    return user

  }

  private async generateToken(user: User) {
    const payload = {
      sub: user.id,
      role: user.role,
      teamId: user.teamId,
    };
  
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async login(dto: CreateAuthDto) {
    const user = await this.validateUser(
      dto.email,
      dto.password,
    );
  
    return this.generateToken(user);
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
  
    if (!user) {
      throw new UnauthorizedException();
    }
  
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
    };
  }
}   
