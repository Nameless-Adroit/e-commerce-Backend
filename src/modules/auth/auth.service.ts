import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from './auth.repository.js';
import { RegisterInput, LoginInput } from './auth.dto.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateToken } from '../../utils/jwt.js';

export class AuthService {
  constructor(private authRepo = new AuthRepository()) {}

  async register(input: RegisterInput) {
    const existing = await this.authRepo.findByEmail(input.email);
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const hashedPassword = await hashPassword(input.password);
    const userId = `u-${uuidv4()}`;

    const user = await this.authRepo.createUser({
      id: userId,
      email: input.email.toLowerCase(),
      password_hash: hashedPassword,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone || undefined,
      role: 'CUSTOMER',
      is_active: true,
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async login(input: LoginInput) {
    const user = await this.authRepo.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      throw new Error('Your account has been deactivated');
    }

    const isValid = await comparePassword(input.password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: string) {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
