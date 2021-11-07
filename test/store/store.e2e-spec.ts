import { HttpStatus, INestApplication } from '@nestjs/common';
import { DbTestHandler } from '../db-test-handler';
import { AccessTokenDto, AuthModule, AuthService } from 'src/features/auth';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { CryptService } from 'src/common/services';
import { ValidationPipe } from 'src/common';
import * as request from 'supertest';

describe('StoreController (e2e)', () => {
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

  describe('/deposit (POST)', () => {
    describe('when requesting deposit', () => {
      it('and access token is not set, then it should return authorization error (401)', () => {
        return request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 10 })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('and invalid access token is set, then it should return authorization error (401)', () => {
        return request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 10 })
          .auth('INVALID_AUTH_TOKEN', { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('and user is in SELLER role, then it should return forbidden error (403)', () => {
        return request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 10 })
          .auth(sellerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);
      });

      it('and user is in BUYER role, then it should return CREATED status code', () => {
        return request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 10 })
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.CREATED);
      });

      it('then users deposit should be updated by requested amount', async () => {
        await request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 20 })
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.CREATED);

        const { body } = await request(app.getHttpServer())
          .get('/users')
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        expect(body).toMatchObject({
          deposit: 20,
        });

        await request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 5 })
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.CREATED);

        const { body: body2 } = await request(app.getHttpServer())
          .get('/users')
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        expect(body2).toMatchObject({
          deposit: 25,
        });
      });

      it('and amount is not one of [5, 10, 20, 50, 10] values, then return bad request (400)', async () => {
        for (const value of [0, 1, 3, 11, 21, 26, 41, 404, 506]) {
          await request(app.getHttpServer())
            .post('/deposit')
            .send({ value: value })
            .auth(buyerAuth.accessToken, { type: 'bearer' })
            .expect(HttpStatus.BAD_REQUEST);
        }
      });
    });
  });

  describe('/buy (POST)', () => {
    describe('when requesting purchase', () => {
      it('and access token is not set, then it should return authorization error (401)', () => {
        return request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 1, amount: 1 })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('and invalid access token is set, then it should return authorization error (401)', () => {
        return request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 1, amount: 1 })
          .auth('INVALID_AUTH_TOKEN', { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('and user is in SELLER role, then it should return forbidden error (403)', () => {
        return request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 1, amount: 1 })
          .auth(sellerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);
      });

      it('and user is in BUYER role, then it should return CREATED status code', async () => {
        await request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 10 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        return request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 1, amount: 1 })
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.CREATED);
      });

      it('then it should return result and CREATED status code', async () => {
        await request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 10 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        const { body, statusCode } = await request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 1, amount: 1 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        expect(statusCode).toBe(HttpStatus.CREATED);
        expect(body).toMatchObject({
          totalSpent: 10,
          product: 'Chips',
          coinChange: [],
        });

        await request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 100 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        const { body: body2 } = await request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 1, amount: 6 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        expect(body2).toMatchObject({
          totalSpent: 60,
          product: 'Chips',
          coinChange: [20, 20],
        });
      });

      it('and user doesnt have enough in deposit, then it should return bad request', async () => {
        await request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 0 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        await request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 1, amount: 1 })
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);

        await request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 20 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        await request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 1, amount: 5 })
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('and user there are not enough products in machine, then it should return bad request', async () => {
        await request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 100 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        await request(app.getHttpServer())
          .put('/products/2')
          .send({ amountAvailable: 2 })
          .auth(sellerAuth2.accessToken, { type: 'bearer' });

        const { body, statusCode } = await request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 2, amount: 3 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it('and purchase product doesnt exist, then it should return not found', async () => {
        await request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 100 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        await request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 1005, amount: 3 })
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.NOT_FOUND);
      });

      it('then it should reduce products amount available by requested amount', async () => {
        await request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 100 })
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
          .put('/products/1')
          .send({ amountAvailable: 10 })
          .auth(sellerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        await request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 1, amount: 3 })
          .auth(buyerAuth.accessToken, { type: 'bearer' })
          .expect(HttpStatus.CREATED);

        const { body } = await request(app.getHttpServer()).get('/products/1');

        expect(body).toMatchObject({
          amountAvailable: 7,
        });
      });

      it('then it should set users deposit to 0', async () => {
        await request(app.getHttpServer())
          .post('/deposit')
          .send({ value: 1000 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        await request(app.getHttpServer())
          .post('/buy')
          .send({ productId: 1, amount: 3 })
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        const { body } = await request(app.getHttpServer())
          .get('/users')
          .auth(buyerAuth.accessToken, { type: 'bearer' });

        expect(body).toMatchObject({
          deposit: 0,
        });
      });
    });
  });
});
