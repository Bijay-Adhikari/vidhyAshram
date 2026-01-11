import { SetMetadata } from '@nestjs/common';

// This creates a custom decorator called @Roles('ADMIN', 'TEACHER')
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);