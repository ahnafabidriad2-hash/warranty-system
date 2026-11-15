import { BadRequestException, ConflictException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { Products } from '../products/entities/products.entity';
import { Users } from '../users/entities/users.entity';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { Warranties } from './entities/warranties.entity';
import { WarrantiesService } from './warranties.service';

jest.mock('../users/entities/users.entity', () => ({
  Users: class Users {},
}));

describe('WarrantiesService', () => {
  const productId = '88888888-8888-4888-8888-888888888888';
  const customerId = '66666666-6666-4666-8666-666666666666';
  const sellerId = '77777777-7777-4777-8777-777777777777';
  const dto: CreateWarrantyDto = {
    serialNumber: 'SN-2026-001',
    purchaseDate: '2026-11-15',
    productId,
    customerId,
    sellerId,
  };

  let service: WarrantiesService;
  let warrantiesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    save: jest.Mock;
  };
  let productsRepo: {
    findOneBy: jest.Mock;
  };
  let usersRepo: {
    findOneBy: jest.Mock;
  };

  beforeEach(() => {
    warrantiesRepo = {
      create: jest.fn((values: Partial<Warranties>) => values as Warranties),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
    };
    productsRepo = {
      findOneBy: jest.fn().mockResolvedValue({
        id: productId,
        isActive: true,
        warrantyMonths: 12,
      }),
    };
    usersRepo = {
      findOneBy: jest.fn().mockImplementation((criteria: { id: string }) =>
        Promise.resolve({
          id: criteria.id,
          role: criteria.id === sellerId ? Role.SELLER : Role.CUSTOMER,
        }),
      ),
    };

    service = new WarrantiesService(
      warrantiesRepo as unknown as Repository<Warranties>,
      productsRepo as unknown as Repository<Products>,
      usersRepo as unknown as Repository<Users>,
    );
  });

  it('calculates the expiry date from the product coverage period', async () => {
    productsRepo.findOneBy.mockResolvedValue({
      id: productId,
      isActive: true,
      warrantyMonths: 1,
    });
    warrantiesRepo.save.mockImplementation((warranty: Warranties) =>
      Promise.resolve(warranty),
    );

    const created = await service.create({
      ...dto,
      purchaseDate: '2024-01-31',
    });

    expect(created.expiryDate).toBe('2024-02-29');
  });

  it('rejects registration for an inactive product', async () => {
    productsRepo.findOneBy.mockResolvedValue({
      id: productId,
      isActive: false,
    });

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(warrantiesRepo.save).not.toHaveBeenCalled();
  });

  it('rejects a user who is not a seller as the registering seller', async () => {
    await expect(
      service.create({ ...dto, sellerId: customerId }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(warrantiesRepo.save).not.toHaveBeenCalled();
  });

  it('lists only active warranties belonging to the selected customer', async () => {
    warrantiesRepo.findAndCount.mockResolvedValue([[], 0]);

    await service.findForCustomer(customerId, { page: 2, limit: 5 });

    expect(warrantiesRepo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customer: { id: customerId }, isActive: true },
        skip: 5,
        take: 5,
      }),
    );
  });

  it('reports inactive warranties as invalid', async () => {
    warrantiesRepo.findOne.mockResolvedValue({
      id: '99999999-9999-4999-8999-999999999999',
      expiryDate: '2999-12-31',
      isActive: false,
    });

    await expect(
      service.checkValidity('99999999-9999-4999-8999-999999999999'),
    ).resolves.toEqual({ isValid: false, expiryDate: '2999-12-31' });
  });

  it('treats the expiry date as inclusive when checking validity', async () => {
    const today = new Date().toISOString().slice(0, 10);
    warrantiesRepo.findOne.mockResolvedValue({
      id: '99999999-9999-4999-8999-999999999999',
      expiryDate: today,
      isActive: true,
    });

    await expect(
      service.checkValidity('99999999-9999-4999-8999-999999999999'),
    ).resolves.toEqual({ isValid: true, expiryDate: today });
  });

  it('translates duplicate product and serial numbers into a conflict', async () => {
    const duplicateError = Object.assign(new Error('duplicate'), {
      code: 'ER_DUP_ENTRY',
    });
    warrantiesRepo.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], duplicateError),
    );

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('soft-deletes a warranty and keeps repeated deletes idempotent', async () => {
    const warranty = {
      id: '99999999-9999-4999-8999-999999999999',
      isActive: true,
    } as Warranties;
    warrantiesRepo.findOne.mockResolvedValue(warranty);
    warrantiesRepo.save.mockImplementation((value: Warranties) =>
      Promise.resolve(value),
    );

    const removed = await service.remove(warranty.id);
    expect(removed.isActive).toBe(false);
    expect(warrantiesRepo.save).toHaveBeenCalledTimes(1);

    warrantiesRepo.findOne.mockResolvedValue(removed);
    const repeatedRemoval = await service.remove(warranty.id);
    expect(repeatedRemoval).toBe(removed);
    expect(warrantiesRepo.save).toHaveBeenCalledTimes(1);
  });
});
