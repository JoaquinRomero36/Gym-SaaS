import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto';
export interface AuthTokens {
    access_token: string;
    refresh_token: string;
}
export interface AuthResponse extends AuthTokens {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        gym_id: string;
    };
}
export declare class AuthService {
    private usersService;
    private jwtService;
    private config;
    constructor(usersService: UsersService, jwtService: JwtService, config: ConfigService);
    register(dto: RegisterDto, role?: string): Promise<AuthResponse>;
    login(email: string, password: string): Promise<AuthResponse>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
    }>;
    private buildResponse;
}
