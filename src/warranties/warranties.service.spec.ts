import { BadRequestException, ConflictException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
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
    expiryDate: '2027-11-15',
    productId,
    customerId,
    sellerId,
  };

  let service: WarrantiesService;
  let warrantiesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
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
      save: jest.fn(),
    };
    productsRepo = {
      findOneBy: jest.fn().mockResolvedValue({ id: productId, isActive: true }),
    };
    usersRepo = {
      findOneBy: jest
        .fn()
        .mockImplementation((criteria: { id: string }) =>
          Promise.resolve({ id: criteria.id }),
        ),
    };

    service = new WarrantiesService(
      warrantiesRepo as unknown as Repository<Warranties>,
      productsRepo as unknown as Repository<Products>,
      usersRepo as unknown as Repository<Users>,
    );
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
