import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: process.env.JWT_SECRET || 'segredo-super-secreto',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(
      payload.sub
    );

    if (!user) {
      throw new UnauthorizedException('Usuario nao encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}