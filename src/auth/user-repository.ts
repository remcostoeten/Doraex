import { executeQuery } from '../db';
import { env } from '../config/env';
import type { TAuthUser } from '../../frontend-svelte/src/lib/types';

type TUserRecord = TAuthUser & {
  password_hash: string;
};

type TCreateUserData = {
  email: string;
  name: string;
  password_hash: string;
  role?: 'user' | 'admin';
};

class UserRepository {
  private readonly systemDbId: string;

  constructor() {
    this.systemDbId = env.DEFAULT_CONNECTION_ID;
  }

  async findByEmail(email: string): Promise<TUserRecord | null> {
    try {
      const query = `
        SELECT id, name, email, password_hash, role, created_at, updated_at, is_active
        FROM auth_users 
        WHERE email = ? AND is_active = 1
      `;
      
      const result = await executeQuery(this.systemDbId, query.replace('?', `'${email}'`));
      
      if (!result || result.length === 0) {
        return null;
      }

      const user = result[0];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        password_hash: user.password_hash,
        role: user.role || 'user',
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async findById(id: string): Promise<TUserRecord | null> {
    try {
      const query = `
        SELECT id, name, email, password_hash, role, created_at, updated_at, is_active
        FROM auth_users 
        WHERE id = ? AND is_active = 1
      `;
      
      const result = await executeQuery(this.systemDbId, query.replace('?', `'${id}'`));
      
      if (!result || result.length === 0) {
        return null;
      }

      const user = result[0];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        password_hash: user.password_hash,
        role: user.role || 'user',
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async create(userData: TCreateUserData): Promise<TUserRecord> {
    try {
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const role = userData.role || 'user';

      const query = `
        INSERT INTO auth_users (id, name, email, password_hash, role, created_at, updated_at)
        VALUES ('${id}', '${userData.name}', '${userData.email}', '${userData.password_hash}', '${role}', '${now}', '${now}')
      `;

      await executeQuery(this.systemDbId, query);

      // Return the created user
      const newUser: TUserRecord = {
        id,
        name: userData.name,
        email: userData.email,
        password_hash: userData.password_hash,
        role,
        created_at: now,
        updated_at: now
      };

      console.log('✅ User created:', { ...newUser, password_hash: '[REDACTED]' });
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async update(id: string, updates: Partial<Pick<TUserRecord, 'name' | 'email' | 'role'>>): Promise<TUserRecord | null> {
    try {
      const now = new Date().toISOString();
      const setParts: string[] = [];
      
      if (updates.name) setParts.push(`name = '${updates.name}'`);
      if (updates.email) setParts.push(`email = '${updates.email}'`);
      if (updates.role) setParts.push(`role = '${updates.role}'`);
      
      setParts.push(`updated_at = '${now}'`);

      const query = `
        UPDATE auth_users 
        SET ${setParts.join(', ')}
        WHERE id = '${id}' AND is_active = 1
      `;

      await executeQuery(this.systemDbId, query);
      
      // Return the updated user
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async deactivate(id: string): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const query = `
        UPDATE auth_users 
        SET is_active = 0, updated_at = '${now}'
        WHERE id = '${id}'
      `;

      await executeQuery(this.systemDbId, query);
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      return false;
    }
  }

  async changePassword(id: string, newPasswordHash: string): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const query = `
        UPDATE auth_users 
        SET password_hash = '${newPasswordHash}', updated_at = '${now}'
        WHERE id = '${id}' AND is_active = 1
      `;

      await executeQuery(this.systemDbId, query);
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  }

  async updatePassword(id: string, newPasswordHash: string): Promise<boolean> {
    return this.changePassword(id, newPasswordHash);
  }

  async listUsers(limit: number = 50, offset: number = 0): Promise<TAuthUser[]> {
    try {
      const query = `
        SELECT id, name, email, role, created_at, updated_at
        FROM auth_users 
        WHERE is_active = 1
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const result = await executeQuery(this.systemDbId, query);
      
      return result.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
    } catch (error) {
      console.error('Error listing users:', error);
      return [];
    }
  }
}

export { UserRepository };
export type { TUserRecord, TCreateUserData };
