import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRepository } from './user-repository';
import type { TAuthUser, TAuthTokens } from '../../frontend-svelte/src/lib/types';

type TUserCredentials = {
  email: string;
  password: string;
  name?: string;
};

type TLoginResult = {
  success: boolean;
  user?: TAuthUser;
  tokens?: TAuthTokens;
  error?: string;
};

type TRegisterResult = {
  success: boolean;
  user?: TAuthUser;
  tokens?: TAuthTokens;
  error?: string;
};

type TTokenPayload = {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
};

class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;
  private readonly bcryptRounds: number;
  private readonly userRepository: UserRepository;

  constructor() {
    this.jwtSecret = env.JWT_SECRET;
    this.jwtRefreshSecret = env.JWT_REFRESH_SECRET;
    this.jwtExpiresIn = env.JWT_EXPIRES_IN;
    this.jwtRefreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN;
    this.bcryptRounds = env.BCRYPT_ROUNDS;
    this.userRepository = new UserRepository();
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateTokens(user: TAuthUser): TAuthTokens {
    const accessPayload: TTokenPayload = {
      userId: user.id,
      email: user.email,
      type: 'access'
    };

    const refreshPayload: TTokenPayload = {
      userId: user.id,
      email: user.email,
      type: 'refresh'
    };

    const accessToken = jwt.sign(accessPayload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'db-explorer',
      audience: 'db-explorer-users'
    });

    const refreshToken = jwt.sign(refreshPayload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn,
      issuer: 'db-explorer',
      audience: 'db-explorer-users'
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.parseExpirationTime(this.jwtExpiresIn)
    };
  }

  verifyAccessToken(token: string): TTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'db-explorer',
        audience: 'db-explorer-users'
      }) as TTokenPayload;
      
      if (decoded.type !== 'access') {
        return null;
      }
      
      return decoded;
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): TTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtRefreshSecret, {
        issuer: 'db-explorer',
        audience: 'db-explorer-users'
      }) as TTokenPayload;
      
      if (decoded.type !== 'refresh') {
        return null;
      }
      
      return decoded;
    } catch {
      return null;
    }
  }

  private parseExpirationTime(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default to 1 hour
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  }

  async login(credentials: TUserCredentials): Promise<TLoginResult> {
    try {
      const user = await this.userRepository.findByEmail(credentials.email);
      
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      const isValidPassword = await this.verifyPassword(credentials.password, user.password_hash);
      
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      const tokens = this.generateTokens(user);
      
      // Remove password hash from user object before returning
      const { password_hash, ...userWithoutPassword } = user;
      
      return {
        success: true,
        user: userWithoutPassword,
        tokens
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  async register(credentials: TUserCredentials): Promise<TRegisterResult> {
    try {
      if (!credentials.name) {
        return { success: false, error: 'Name is required' };
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(credentials.email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      const hashedPassword = await this.hashPassword(credentials.password);
      
      // Create user in database
      const newUser = await this.userRepository.create({
        email: credentials.email,
        name: credentials.name,
        password_hash: hashedPassword
      });

      const tokens = this.generateTokens(newUser);
      
      // Remove password hash from user object before returning
      const { password_hash, ...userWithoutPassword } = newUser;
      
      return {
        success: true,
        user: userWithoutPassword,
        tokens
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

}

export { AuthService };
export type { TUserCredentials, TLoginResult, TRegisterResult, TTokenPayload };
