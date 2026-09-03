import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from './users.repository.js';
import { Address } from '../../types/index.js';

export class UsersService {
  constructor(private usersRepo = new UsersRepository()) {}

  async getUsers(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.usersRepo.getAllUsers(limit, offset),
      this.usersRepo.countUsers(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAddresses(userId: string) {
    return this.usersRepo.getAddresses(userId);
  }

  async addAddress(userId: string, data: Omit<Address, 'id' | 'user_id' | 'created_at'>) {
    return this.usersRepo.addAddress({
      id: 'addr-' + uuidv4(),
      user_id: userId,
      ...data,
    });
  }

  async deleteAddress(addressId: string, userId: string) {
    return this.usersRepo.deleteAddress(addressId, userId);
  }
}
