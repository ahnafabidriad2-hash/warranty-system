import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { WarrantiesController } from './warranties.controller';
import type { WarrantiesService } from './warranties.service';

jest.mock('../users/entities/users.entity', () => ({
  Users: class Users {},
}));

describe('WarrantiesController', () => {
  const customerId = '66666666-6666-4666-8666-666666666666';
  const pagination = { page: 2, limit: 5 };
  let controller: WarrantiesController;
  let warrantiesService: { findForCustomer: jest.Mock };

  beforeEach(() => {
    warrantiesService = { findForCustomer: jest.fn() };
    controller = new WarrantiesController(
      warrantiesService as unknown as WarrantiesService,
    );
  });

  it('uses the authenticated customer id and preserves pagination', () => {
    const user = {
      id: customerId,
      email: 'customer@example.com',
      role: Role.CUSTOMER,
    };

    void controller.findForCustomer(user, pagination);

    expect(warrantiesService.findForCustomer).toHaveBeenCalledWith(
      customerId,
      pagination,
    );
  });

  it('requires JWT authentication and the customer role', () => {
    const handler = Object.getOwnPropertyDescriptor(
      WarrantiesController.prototype,
      'findForCustomer',
    )?.value as object;
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      WarrantiesController,
    ) as unknown[];

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual([Role.CUSTOMER]);
  });
});
