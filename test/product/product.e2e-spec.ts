import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { ValidationPipe } from 'src/common';
import { CryptService } from 'src/common/services';
import { AccessTokenDto, AuthModule, AuthService } from 'src/features/auth';
import { DbTestHandler } from '../db-test-handler';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let dbTestHandler: DbTestHandler;
  let buyerAuth: AccessTokenDto;
  let buyerAuth2: AccessTokenDto;
  let sellerAuth2: AccessTokenDto;
  let sellerAuth: AccessTokenDto;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
      providers: [DbTestHandler],
    })
      .overrideProvider(CryptService)
      .useValue({
        hash: jest.fn().mockImplementation((pass) => pass),
        compareHash: jest
          .fn()
          .mockImplementation((pure, hashed) => pure === hashed),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dbTestHandler = moduleFixture.get(DbTestHandler);
    await dbTestHandler.reloadFixtures();

    const authService = moduleFixture.get(AuthService);
    sellerAuth = await authService.login(
      { username: 'seller_1', password: 'seller_1' },
      '192.168.0.1',
    );

    sellerAuth2 = await authService.login(
      { username: 'seller_2', password: 'seller_2' },
      '192.168.0.2',
    );

    buyerAuth = await authService.login(
      { username: 'buyer_1', password: 'buyer_1' },
      '192.168.0.3',
    );

    buyerAuth2 = await authService.login(
      { username: 'buyer_2', password: 'buyer_2' },
      '192.168.0.4',
    );
  });

  afterAll(async () => {
    await dbTestHandler.closeDb();
    await app.close();
  });

  describe('/products (GET)', () => {
    describe('when requesting for products', () => {
      it('then products query response should be returned', async () => {
        const { body, statusCode } = await request(app.getHttpServer()).get(
          '/products?page=1&pageSize=3',
        );

        expect(body).toMatchObject({
          page: 1,
          pageSize: 3,
        });
        expect(body.items).toHaveLength(3);
        expect(statusCode).toBe(HttpStatus.OK);
      });

      it('and page < 0, then it should receive 400 response', async () => {
        return request(app.getHttpServer())
          .get('/products?page=0&pageSize=10')
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('and search query is set, then it should retrieve products containing specified search query in name and status 200', async () => {
        const { body, statusCode } = await request(app.getHttpServer()).get(
          '/products?page=1&pageSize=10&searchQuery=Chips 1',
        );

        expect(body.items).toHaveLength(1);
        expect(body.items[0]).toMatchObject({
          productName: 'Chips 1',
        });
        expect(statusCode).toBe(HttpStatus.OK);
      });
    });
  });

  describe('/products/:id (GET)', () => {
    describe('when requesting for product', () => {
      it('and product exists, then it should retrieve it and receive 200 response', async () => {
        const { body, statusCode } = await request(app.getHttpServer()).get(
          '/products/1',
        );

        expect(body).toMatchObject({
          id: 1,
          productName: 'Chips',
          amountAvailable: 500,
          cost: 10,
          sellerId: 1,
        });
        expect(statusCode).toBe(HttpStatus.OK);
      });

      it('and product doesnt exist, then it should receive 404 response', () => {
        return request(app.getHttpServer())
          .get('/products/1000')
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe('/products/:id (PUT)', () => {
    describe('when updating product', () => {
      it('and access token is not set, then it should return authorization error (401)', () => {
        return request(app.getHttpServer())
          .put('/products/1')
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('and invalid access token is set, then it should return authorization error (401)', () => {
        return request(app.getHttpServer())
          .put('/products/1')
          .auth('INVALID_AUTH_TOKEN', { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('and user is in BUYER role, then it should return forbidden error (403)', () => {
        return request(app.getHttpServer())
          .put('/products/1')
          .send({ amountAvailable: 20 })
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);
      });

      it('and user is in SELLER role, then it should return OK status code', () => {
        return request(app.getHttpServer())
          .put('/products/1')
          .send({ amountAvailable: 20 })
          .auth(sellerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);
      });

      it('and user is not creator of updating product, then it should return forbidden error (403)', () => {
        return request(app.getHttpServer())
          .put('/products/2')
          .send({ amountAvailable: 20 })
          .auth(sellerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);
      });

      it('then it should be able to retrieve it', async () => {
        await request(app.getHttpServer())
          .put('/products/1')
          .send({ amountAvailable: 50, productName: 'Test Name' })
          .auth(sellerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        const { body } = await request(app.getHttpServer())
          .get('/products/1')
          .auth(sellerAuth.accessToken, { type: 'bearer' });

        return expect(body).toMatchObject({
          id: 1,
          amountAvailable: 50,
          productName: 'Test Name',
        });
      });
    });
  });

  describe('/products/:id (DELETE)', () => {
    describe('when deleting product', () => {
      it('and access token is not set, then it should return authorization error (401)', () => {
        return request(app.getHttpServer())
          .delete('/products/1')
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('and invalid access token is set, then it should return authorization error (401)', () => {
        return request(app.getHttpServer())
          .delete('/products/1')
          .auth('INVALID_AUTH_TOKEN', { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('and user is in BUYER role, then it should return forbidden error (403)', () => {
        return request(app.getHttpServer())
          .delete('/products/1')
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);
      });

      it('and user is in SELLER role, then it should return OK status code', () => {
        return request(app.getHttpServer())
          .delete('/products/1')
          .auth(sellerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);
      });

      it('and user is not the creator of the deleting product, then it should return forbidden error (403)', () => {
        return request(app.getHttpServer())
          .delete('/products/2')
          .auth(sellerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);
      });

      it('then it shouldnt be able to retrieve product after', async () => {
        await request(app.getHttpServer())
          .delete('/products/1')
          .auth(sellerAuth.accessToken, { type: 'bearer' });

        await request(app.getHttpServer())
          .get('/products/1')
          .auth(sellerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe('/products (POST)', () => {
    describe('when creating product', () => {
      it('and access token is not set, then it should return authorization error (401)', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({ amountAvailable: 3, productName: 'Chips', cost: 10 })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('and invalid access token is set, then it should return authorization error (401)', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({ amountAvailable: 3, productName: 'Chips', cost: 10 })
          .auth('INVALID_AUTH_TOKEN', { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('and user is in BUYER role, then it should return forbidden error (403)', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({ amountAvailable: 3, productName: 'Chips', cost: 10 })
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);
      });

      it('and user is in SELLER role, then it should return CREATED status code', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({ amountAvailable: 3, productName: 'Chips', cost: 10 })
          .auth(sellerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.CREATED);
      });

      it('then it should be able to retrieve it after creation', async () => {
        const { body: createBody } = await request(app.getHttpServer())
          .post('/products')
          .send({ amountAvailable: 3, productName: 'Chips', cost: 10 })
          .auth(sellerAuth.accessToken, { type: 'bearer' });

        const { body: getBody, statusCode } = await request(app.getHttpServer())
          .get(`/products/${createBody.id}`)
          .auth(sellerAuth.accessToken, { type: 'bearer' });

        expect(statusCode).toBe(HttpStatus.OK);
        return expect(getBody).toMatchObject({
          id: createBody.id,
          amountAvailable: 3,
          productName: 'Chips',
          cost: 10,
        });
      });
    });
  });

  afterAll(async () => {
    await dbTestHandler.closeDb();
    await app.close();
  });
});
