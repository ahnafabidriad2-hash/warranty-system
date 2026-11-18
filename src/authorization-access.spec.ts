import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtStrategy } from './auth/jwt.strategy';
import { RolesGuard } from './auth/guards/roles.guard';
import { Role } from './common/enums/role.enum';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { WarrantiesController } from './warranties/warranties.controller';
import { WarrantiesService } from './warranties/warranties.service';
import type { AuthenticatedUser } from './common/decorators/current-user.decorator';

jest.mock('./users/entities/users.entity', () => ({
  Users: class Users {},
}));

describe('Products and warranties route authorization', () => {
  const secret = 'authorization-test-secret';
  const customerId = '66666666-6666-4666-8666-666666666666';
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let productsService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    replace: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let warrantiesService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findForCustomer: jest.Mock;
    checkValidity: jest.Mock;
    findOne: jest.Mock;
    replace: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  async function token(role: Role, id = customerId) {
    const user: AuthenticatedUser = {
      id,
      email: `${role.toLowerCase()}@example.com`,
      role,
    };
    return jwtService.signAsync({ sub: user.id, email: user.email, role });
  }

  beforeAll(async () => {
    productsService = {
      create: jest.fn().mockResolvedValue({}),
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOne: jest.fn().mockResolvedValue({}),
      replace: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
    };
    warrantiesService = {
      create: jest.fn().mockResolvedValue({}),
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findForCustomer: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      checkValidity: jest.fn().mockResolvedValue({ isValid: true }),
      findOne: jest.fn().mockResolvedValue({}),
      replace: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret })],
      controllers: [ProductsController, WarrantiesController],
      providers: [
        JwtStrategy,
        RolesGuard,
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => secret },
        },
        { provide: ProductsService, useValue: productsService },
        { provide: WarrantiesService, useValue: warrantiesService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    jwtService = moduleRef.get(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 401 for a protected product write without a token', async () => {
    await request(app.getHttpServer()).post('/products').expect(401);
  });

  it('returns 403 when a customer attempts a seller/admin product write', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${await token(Role.CUSTOMER)}`)
      .expect(403);
  });

  it('keeps the product catalogue public', async () => {
    await request(app.getHttpServer()).get('/products').expect(200);
    await request(app.getHttpServer())
      .get('/products/88888888-8888-4888-8888-888888888888')
      .expect(200);
  });

  it('passes the authenticated seller to product creation', async () => {
    const sellerId = '77777777-7777-4777-8777-777777777777';
    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${await token(Role.SELLER, sellerId)}`)
      .send({ name: 'Phone', warrantyMonths: 12, categoryId: customerId })
      .expect(201);

    expect(productsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Phone' }),
      expect.objectContaining({ id: sellerId, role: Role.SELLER }),
    );
  });

  it('returns 401 and 403 for the customer warranty list as appropriate', async () => {
    await request(app.getHttpServer()).get('/warranties/customer').expect(401);
    await request(app.getHttpServer())
      .get('/warranties/customer')
      .set('Authorization', `Bearer ${await token(Role.SELLER)}`)
      .expect(403);
  });

  it('returns 403 when a customer attempts a seller/admin warranty write', async () => {
    await request(app.getHttpServer())
      .post('/warranties')
      .set('Authorization', `Bearer ${await token(Role.CUSTOMER)}`)
      .expect(403);
  });

  it('uses the authenticated customer id for warranty listing', async () => {
    await request(app.getHttpServer())
      .get('/warranties/customer?page=2&limit=5')
      .set('Authorization', `Bearer ${await token(Role.CUSTOMER)}`)
      .expect(200);

    expect(warrantiesService.findForCustomer).toHaveBeenCalledWith(
      customerId,
      expect.objectContaining({ page: 2, limit: 5 }),
    );
  });

  it('requires an admin to read the unfiltered warranty list', async () => {
    await request(app.getHttpServer())
      .get('/warranties')
      .set('Authorization', `Bearer ${await token(Role.SELLER)}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/warranties')
      .set('Authorization', `Bearer ${await token(Role.ADMIN)}`)
      .expect(200);
  });
});
