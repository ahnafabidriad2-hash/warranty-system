import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { Categories } from '../categories/entities/categories.entity';
import { Users } from '../users/entities/users.entity';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Products } from './entities/products.entity';
import { ProductsService } from './products.service';

jest.mock('../users/entities/users.entity', () => ({
  Users: class Users {},
}));

describe('ProductsService ownership', () => {
  const productId = '88888888-8888-4888-8888-888888888888';
  const categoryId = '99999999-9999-4999-8999-999999999999';
  const sellerId = '77777777-7777-4777-8777-777777777777';
  const otherSellerId = '66666666-6666-4666-8666-666666666666';
  const seller: AuthenticatedUser = {
    id: sellerId,
    email: 'seller@example.com',
    role: Role.SELLER,
  };
  const admin: AuthenticatedUser = {
    id: otherSellerId,
    email: 'admin@example.com',
    role: Role.ADMIN,
  };

  let service: ProductsService;
  let productsRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let categoriesRepo: { findOneBy: jest.Mock };
  let usersRepo: { findOneBy: jest.Mock };

  beforeEach(() => {
    productsRepo = {
      create: jest.fn((values: Partial<Products>) => values as Products),
      findOne: jest.fn(),
      save: jest.fn((product: Products) => Promise.resolve(product)),
    };
    categoriesRepo = {
      findOneBy: jest.fn().mockResolvedValue({ id: categoryId }),
    };
    usersRepo = {
      findOneBy: jest
        .fn()
        .mockResolvedValue({ id: sellerId, role: Role.SELLER }),
    };
    service = new ProductsService(
      productsRepo as unknown as Repository<Products>,
      categoriesRepo as unknown as Repository<Categories>,
      usersRepo as unknown as Repository<Users>,
    );
  });

  it('uses the authenticated seller as the product owner', async () => {
    await service.create(
      {
        name: 'Phone',
        warrantyMonths: 12,
        categoryId,
      },
      seller,
    );

    expect(usersRepo.findOneBy).toHaveBeenCalledWith({ id: sellerId });
    expect(productsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ seller: { id: sellerId, role: Role.SELLER } }),
    );
  });

  it('prevents a seller from updating another seller’s product', async () => {
    productsRepo.findOne.mockResolvedValue({
      id: productId,
      seller: { id: otherSellerId },
    });

    await expect(
      service.update(productId, { name: 'Changed name' }, seller),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(productsRepo.save).not.toHaveBeenCalled();
  });

  it('prevents a seller from deleting another seller’s product', async () => {
    productsRepo.findOne.mockResolvedValue({
      id: productId,
      seller: { id: otherSellerId },
      isActive: true,
    });

    await expect(service.remove(productId, seller)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(productsRepo.save).not.toHaveBeenCalled();
  });

  it('prevents a seller from transferring an owned product to another seller', async () => {
    productsRepo.findOne.mockResolvedValue({
      id: productId,
      seller: { id: sellerId },
    });

    await expect(
      service.update(productId, { sellerId: otherSellerId }, seller),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(productsRepo.save).not.toHaveBeenCalled();
  });

  it('allows an admin to update another seller’s product', async () => {
    const product = {
      id: productId,
      seller: { id: otherSellerId },
      name: 'Original name',
    } as Products;
    productsRepo.findOne.mockResolvedValue(product);

    await expect(
      service.update(productId, { name: 'Updated name' }, admin),
    ).resolves.toMatchObject({ name: 'Updated name' });
    expect(productsRepo.save).toHaveBeenCalledWith(product);
  });
});
