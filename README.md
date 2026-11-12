# Warranty Management System (CSC4161)

Backend only: NestJS, TypeORM, MySQL. Test everything in Swagger.

## Setup
1. Install Node 20+ and MySQL 8, and make sure MySQL is running.
2. Create an empty database: `CREATE DATABASE warranty_db CHARACTER SET utf8mb4;`
3. Run `npm install`.
4. Copy `.env.example` to `.env` and put your own MySQL password in it.
5. Run `npm run start:dev`.
6. The 9 tables are created automatically in `warranty_db`.

## Roles
ADMIN, SELLER, TECHNICIAN, CUSTOMER (see `src/common/enums/role.enum.ts`).

## Team rules
- One branch per member, merge into `main` through a pull request.
- Edit only your own module folders.
- Never commit `.env` or `node_modules`.
- See the Team Workflow document for the full plan.