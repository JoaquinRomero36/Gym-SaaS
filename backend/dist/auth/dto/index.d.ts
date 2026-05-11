export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    gym_id: string;
    name: string;
    email: string;
    password: string;
    coach_id?: string;
}
export declare class RefreshTokenDto {
    refresh_token: string;
}
