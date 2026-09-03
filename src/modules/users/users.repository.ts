import { db } from '../../database/db.js';
import { User, Address } from '../../types/index.js';

export class UsersRepository {
  async getAllUsers(limit = 20, offset = 0): Promise<Omit<User, 'password_hash'>[]> {
    return db<User>('users')
      .select('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'created_at', 'updated_at')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }

  async countUsers(): Promise<number> {
    const result = await db('users').count<{ count: string | number }>('id as count').first();
    return Number(result?.count || 0);
  }

  async findById(id: string): Promise<User | null> {
    const user = await db<User>('users').where({ id }).first();
    return user || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    await db('users').where({ id }).update(updates);
    return this.findById(id);
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return db<Address>('addresses').where({ user_id: userId }).orderBy('is_default', 'desc');
  }

  async addAddress(address: Partial<Address>): Promise<Address> {
    if (address.is_default) {
      await db('addresses').where({ user_id: address.user_id }).update({ is_default: false });
    }
    await db('addresses').insert(address);
    const created = await db<Address>('addresses').where({ id: address.id }).first();
    return created!;
  }

  async deleteAddress(addressId: string, userId: string): Promise<boolean> {
    const deleted = await db('addresses').where({ id: addressId, user_id: userId }).del();
    return deleted > 0;
  }
}
