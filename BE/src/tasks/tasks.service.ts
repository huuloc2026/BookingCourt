import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens() {
    this.logger.debug('Running cleanup task for expired tokens');

    try {
      // Delete expired refresh tokens
      const deletedTokens = await this.prismaService.refreshToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { isUsed: true }],
        },
      });

      // Delete expired sessions
      const deletedSessions = await this.prismaService.session.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { isActive: false }],
        },
      });

      this.logger.log(
        `Cleanup completed: ${deletedTokens.count} tokens, ${deletedSessions.count} sessions deleted`,
      );
    } catch (error) {
      this.logger.error('Error during cleanup task:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateSessionActivity() {
    this.logger.debug('Running session activity update task');

    try {
      // Mark sessions as inactive if they haven't been used in 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const updatedSessions = await this.prismaService.session.updateMany({
        where: {
          lastUsedAt: { lt: thirtyDaysAgo },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      this.logger.log(`Updated ${updatedSessions.count} inactive sessions`);
    } catch (error) {
      this.logger.error('Error during session activity update:', error);
    }
  }
}
