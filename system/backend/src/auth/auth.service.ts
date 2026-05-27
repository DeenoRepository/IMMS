import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(username: string, role: string) {
    const payload = { 
      username, 
      role, 
      sub: `usr-${role}-${Date.now()}` 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: payload.sub,
        name: username,
        role: role,
      }
    };
  }
}
