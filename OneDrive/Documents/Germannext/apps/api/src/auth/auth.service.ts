import { Injectable, BadRequestException, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { UserRole } from '@educaro/shared';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

export interface RegisterDto {
  email: string;
  password?: string;
  role?: UserRole;
  consent?: boolean;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface SendOtpDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  code: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email || !dto.email.includes('@')) {
      throw new BadRequestException('A valid email address is required');
    }

    if (!dto.consent) {
      throw new BadRequestException('Consent to process application data is required (PRD Section 7 A5).');
    }

    const email = dto.email.trim().toLowerCase();
    const existing = await this.db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new ConflictException('An account with this email already exists.');
    }

    const userId = crypto.randomUUID();
    const role = dto.role || UserRole.APPLICANT;
    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : null;
    const consentAt = new Date().toISOString();

    await this.db.query(
      `INSERT INTO users (id, email, password_hash, role, consent_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [userId, email, passwordHash, role, consentAt]
    );

    // If applicant, also create applicant profile row
    if (role === UserRole.APPLICANT) {
      const applicantId = crypto.randomUUID();
      await this.db.query(
        `INSERT INTO applicants (id, user_id, email, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [applicantId, userId, email]
      );
    }

    const tokens = this.generateTokens(userId, email, role);
    return {
      user: { id: userId, email, role, consentAt },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const res = await this.db.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (res.rows.length === 0) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const user = res.rows[0];
    if (user.password_hash) {
      if (!dto.password) {
        throw new BadRequestException('Password is required for this account.');
      }
      const match = await bcrypt.compare(dto.password, user.password_hash);
      if (!match) {
        throw new UnauthorizedException('Invalid email or password.');
      }
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async sendOtp(dto: SendOtpDto) {
    const email = dto.email.trim().toLowerCase();
    let res = await this.db.query('SELECT id, email, role FROM users WHERE email = $1', [email]);

    let userId: string;
    let role = UserRole.APPLICANT;

    if (res.rows.length === 0) {
      // Auto-register user with OTP
      userId = crypto.randomUUID();
      await this.db.query(
        `INSERT INTO users (id, email, role, consent_at, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [userId, email, role]
      );
      await this.db.query(
        `INSERT INTO applicants (id, user_id, email, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [crypto.randomUUID(), userId, email]
      );
    } else {
      userId = res.rows[0].id;
      role = res.rows[0].role;
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    await this.db.query(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3',
      [otpCode, expiresAt, userId]
    );

    // BUILD_GUIDE: console mailer for OTP
    console.log('\n======================================================');
    console.log(` 📧 [CONSOLE MAILER] Email OTP to: ${email}`);
    console.log(` 🔑 Your Educaro One-Time Login Code is: [ ${otpCode} ]`);
    console.log(` ⏰ Valid for 10 minutes`);
    console.log('======================================================\n');

    return {
      success: true,
      message: `OTP sent to ${email} (check server console in development)`,
      debugOtp: otpCode,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.trim().toLowerCase();
    const res = await this.db.query(
      'SELECT id, email, role, otp_code, otp_expires_at FROM users WHERE email = $1',
      [email]
    );

    if (res.rows.length === 0) {
      throw new BadRequestException('User not found.');
    }

    const user = res.rows[0];
    if (!user.otp_code || user.otp_code !== dto.code.trim()) {
      throw new BadRequestException('Invalid OTP code.');
    }

    if (new Date(user.otp_expires_at) < new Date()) {
      throw new BadRequestException('OTP code has expired. Please request a new one.');
    }

    // Clear OTP and mark verified
    await this.db.query(
      'UPDATE users SET otp_code = NULL, otp_expires_at = NULL, email_verified = TRUE WHERE id = $1',
      [user.id]
    );

    const tokens = this.generateTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }
}
