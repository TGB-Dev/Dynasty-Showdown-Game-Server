import { Request } from 'express';
import { User } from '../../schemas/user.schema';

export interface AuthRequest extends Request {
  user: User;
}
