import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthPayload {
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

const sanitizeUser = (user: User) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
});

const signToken = (user: User): string =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );

export const register = async (input: RegisterInput): Promise<AuthPayload> => {
  const existing = await User.findOne({ where: { email: input.email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const hashed = await argon2.hash(input.password);

  const user = await User.create({
    email: input.email,
    password: hashed,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role ?? 'user',
  });

  return { token: signToken(user), user: sanitizeUser(user) };
};

export const login = async (input: LoginInput): Promise<AuthPayload> => {
  const user = await User.findOne({ where: { email: input.email } });
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const valid = await argon2.verify(user.password, input.password);
  if (!valid) {
    throw new AppError('Invalid email or password.', 401);
  }

  return { token: signToken(user), user: sanitizeUser(user) };
};

export const getById = async (id: number): Promise<User> => {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found.', 404);
  return user;
};
