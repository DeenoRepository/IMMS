import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; role: string }) {
    return this.authService.login(body.username, body.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  getAdminData(@Request() req: any) {
    return {
      message: 'Access granted: Welcome, Administrator!',
      adminUser: req.user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('mechanic', 'chief_mechanic', 'admin')
  @Get('mechanic-work')
  getMechanicData(@Request() req: any) {
    return {
      message: 'Access granted: Mechanic workbench data.',
      user: req.user,
    };
  }
}
