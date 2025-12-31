import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        full_name: dto.full_name,
        phone: dto.phone,
        role: 'customer',
      },
      select: {
        user_id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        created_at: true,
      },
    });

    const token = this.generateToken(user.user_id, user.email, user.role);

    return {
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token,
        user,
      },
    };
  }

  async login(dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const token = this.generateToken(user.user_id, user.email, user.role);

    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
        },
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.getUserById(payload.sub);
      return { success: true, valid: true, user };
    } catch (error) {
      return { success: false, valid: false, error: 'Token không hợp lệ' };
    }
  }

  async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        is_active: true,
      },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User không hợp lệ');
    }

    return user;
  }

  private generateToken(userId: number, email: string, role: string): string {
    return this.jwtService.sign({ 
      sub: userId, 
      email, 
      role 
    });
  }
}