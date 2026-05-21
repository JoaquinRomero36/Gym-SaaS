import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TenantService } from '../common/services/tenant.service';
import { RegisterDto } from './dto';
import { User } from '../users/user.entity';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse extends AuthTokens {
  user: { id: string; email: string; name: string; role: string; gymId: string };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private tenantService: TenantService,
  ) {}

  async register(dto: RegisterDto, role = 'member'): Promise<AuthResponse> {
    const user = await this.usersService.create(dto);
    return this.buildResponse(user, role);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'active') throw new UnauthorizedException('Account is not active');

    const valid = await this.usersService.validatePassword(user, password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.buildResponse(user, user.role);
  }

  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const gymId = payload.gymId as string;

      const user = await this.tenantService.runInTenantContext(gymId, () => {
        return this.usersService.findOne(payload.sub);
      });

      const access_token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: payload.role as string,
        gymId: user.gym_id,
      });
      return { access_token };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private buildResponse(user: User, role: string): AuthResponse {
    const payload = { sub: user.id, email: user.email, role, gymId: user.gym_id };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        gymId: user.gym_id,
      },
    };
  }
}
