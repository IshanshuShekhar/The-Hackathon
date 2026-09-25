import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly db: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          return req?.cookies?.access_token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'educaro-super-secret-key-impactx26',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const res = await this.db.query('SELECT id, email, role FROM users WHERE id = $1', [payload.sub]);
    if (res.rows.length === 0) {
      throw new UnauthorizedException('User session no longer valid');
    }
    return {
      id: res.rows[0].id,
      email: res.rows[0].email,
      role: res.rows[0].role,
    };
  }
}
