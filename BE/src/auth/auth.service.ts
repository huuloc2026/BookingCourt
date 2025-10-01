import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../config/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

type User = {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  password: string | null;
  avatar: string | null;
  role: string;
  provider: string;
  providerId: string | null;
  isActive: boolean;
  isVerified: boolean;
  verificationToken: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        username: registerDto.username,
      },
    });

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto, req: any) {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Create session for this device
    const session = await this.createSession(user.id, req);

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken, session.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async createSession(userId: string, req: any) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const session = await this.prismaService.session.create({
      data: {
        userId,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
        deviceId: req.headers['x-device-id'] || null,
        expiresAt,
      },
    });

    return session;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const storedToken = await this.prismaService.refreshToken.findFirst({
        where: {
          userId: payload.sub,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Verify the token hash
      const isValidToken = await bcrypt.compare(
        refreshToken,
        storedToken.tokenHash,
      );
      if (!isValidToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Mark old token as used
      await this.prismaService.refreshToken.update({
        where: { id: storedToken.id },
        data: { isUsed: true },
      });

      // Generate new tokens
      const tokens = await this.generateTokens(storedToken.user);
      await this.storeRefreshToken(
        storedToken.user.id,
        tokens.refreshToken,
        storedToken.sessionId,
      );

      return {
        user: this.sanitizeUser(storedToken.user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      await this.prismaService.refreshToken.updateMany({
        where: {
          userId: payload.sub,
          isUsed: false,
        },
        data: { isUsed: true },
      });
    } catch (error) {
      // Token might be invalid, still try to clean up
      await this.prismaService.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }
  }

  async validateOAuthUser(profile: any): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { email: profile.email },
    });

    if (user) {
      return user;
    }

    return await this.prismaService.user.create({
      data: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar,
        provider: profile.provider,
        providerId: profile.providerId,
        isVerified: true,
      },
    });
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(
    userId: string,
    refreshToken: string,
    sessionId?: string,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Hash the refresh token before storing
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        tokenHash,
        userId,
        sessionId,
        expiresAt,
      },
    });
  }

  async getUserSessions(userId: string) {
    return this.prismaService.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  async terminateSession(sessionId: string, userId: string) {
    await this.prismaService.session.update({
      where: { id: sessionId, userId },
      data: { isActive: false },
    });

    // Mark all refresh tokens for this session as used
    await this.prismaService.refreshToken.updateMany({
      where: { sessionId },
      data: { isUsed: true },
    });
  }

  async terminateAllSessions(userId: string) {
    await this.prismaService.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    // Mark all refresh tokens for this user as used
    await this.prismaService.refreshToken.updateMany({
      where: { userId },
      data: { isUsed: true },
    });
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
