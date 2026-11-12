import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { WarrantiesModule } from './warranties/warranties.module';
import { ClaimsModule } from './claims/claims.module';
import { PartsModule } from './parts/parts.module';
import { RepairsModule } from './repairs/repairs.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT') ?? 3306),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        charset: 'utf8mb4',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UsersModule,
    CategoriesModule,
    ProductsModule,
    WarrantiesModule,
    ClaimsModule,
    PartsModule,
    RepairsModule,
    FeedbackModule,
  ],
})
export class AppModule {}
