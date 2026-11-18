import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

//Guard ar decorator er key alada hole guard role khuje pabe na, shob route shobar jonno khola (danger).
export const ROLES_KEY = 'roles'; // eki key use korle guard ar decorator ek shathe kaj korbe.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);// Admin and admin different , aikhane bhul dhora porbe