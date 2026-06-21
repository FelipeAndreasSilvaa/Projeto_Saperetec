import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt.auth.guard';
import { AuthenticatedUser } from './dto/technician-response.dto';
import { UsersService } from './users.service';

// ISSO DAQUI FOI IMPLEMENTADO
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ISSO DAQUI FOI IMPLEMENTADO
  @Get('technicians')
  findTechnicians(@Request() request: { user: AuthenticatedUser }) {
    return this.usersService.findTechnicians(request.user);
  }
}
