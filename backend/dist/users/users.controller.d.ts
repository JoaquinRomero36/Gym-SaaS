import { TenantService } from '../common/services/tenant.service';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './user.entity';
export declare class UsersController {
    private readonly service;
    private readonly tenantService;
    constructor(service: UsersService, tenantService: TenantService);
    create(dto: CreateUserDto): Promise<User>;
    findAll(coachId?: string, role?: string): Promise<User[]>;
    findOne(id: string): Promise<User>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
}
