#Vending Machine

## Description

Vending machine is backend REST API application which allows users with "seller" role to add, update or remove products, while users with "buyer" role can deposit coins into machine and make purchases. Vending machine accepts only 5, 10, 20, 50 and 100 cent coins.

API also provides CRUD endpoints for users and products.

Application is built and scaffolded using [Nest](https://nestjs.com/) framework. It uses modern JavaScript, is built with [TypeScript](https://www.typescriptlang.org) (preserves compatibility with pure JavaScript)

## Installation

```bash
$ npm install
```

## Setup

### Database

Database is [PosgreSQL](https://www.postgresql.org) which can setup manually or using [Docker](https://www.docker.com). Configuration for database is in .env.development (development) and .env (production) files.

In order to use docker, run `docker-compose --env-file ../.env.development up` inside `src/tools` folder.

### Run application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## REST API

Short REST API description of all available routes. Full description can be accessed after running the application using auto-generated [Swagger-UI](http://localhost:3000/docs/).

### Authentication

Application is using JWT authentication, providing short lived (10 minutes - configurable) access tokens and long lived refresh tokens (30 days - configurable). Protected API routes can be accessed using valid JWT as a bearer token. Access token can be requested using valid username/password or using valid refresh token (which returns new access and refresh token). 

`POST /auth/login` - Request access and refresh token using valid username/password.

`POST /auth/refresh-token` - Request access and refresh token using valid refresh token.

`POST /auth/logout` - Logout user.

`POST /auth/logout/all` - Logout user from all active sessions on their account (if any).

### Users

`GET /users` - Get currently logged in user (self).

`POST /users` - Register new user.

`PUT /users` - Update currently logged in user (self).

`DELETE /users` - Delete currently logged in user (self).

### Products

`GET /products` - Query products using paging parameters (page and page size) with optional search query parameter. Everyone can access this endpoint.

`GET /products/:id` - Get product by id. Everyone can access this endpoint.

`POST /products` - Create new product. Seller role can access this endpoint.

`PUT /products/:id` - Update product with specified id. Seller role who created product with specified id can access this endpoint.

`DELETE /products/:id` - Delete product with specified id. Seller role who created product with specified id can access this endpoint.

### Store

`POST /deposit` - Deposit cent coints into vending machine account. Buyer role can access this endpoint.

`POST /buy` - Buy products using deposit balance. Buyer role can access this endpoint.

`PUT /reset` - Reset users deposit to 0. Buyer role can access this endpoint.

## Stay in touch

- Author - Željko Huber <huber.zelja@gmail.com>
- NestJS Website - [https://nestjs.com](https://nestjs.com/)
