import { Controller, Get, Patch, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
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

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'coach', 'member')
  async markAsRead(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.notificationsService.markAsRead(id);
  }
}