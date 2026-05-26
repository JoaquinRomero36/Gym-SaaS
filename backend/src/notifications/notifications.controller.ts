import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantService } from '../common/services/tenant.service';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly tenantService: TenantService,
  ) {}

  @Get('user/:userId')
  @Roles('admin', 'coach', 'member')
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<Notification[]> {
    return this.notificationsService.findByUser(userId);
  }
}