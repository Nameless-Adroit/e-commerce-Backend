import { db } from '../../database/db.js';
import { User } from '../../types/index.js';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await db<User>('users').where({ email: email.toLowerCase() }).first();
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await db<User>('users').where({ id }).first();
    return user || null;
  }

  async createUser(user: Partial<User>): Promise<User> {
    await db('users').insert(user);
    const created = await this.findById(user.id!);
    return created!;
  }
}
