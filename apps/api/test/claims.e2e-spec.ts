import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Claims API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.aIExtractionLog.deleteMany();
    await prisma.claimDocument.deleteMany();
    await prisma.claimDetails.deleteMany();
    await prisma.claimant.deleteMany();
    await prisma.claim.deleteMany();
    await app.close();
  });

  let claimId: string;

  it('POST /claims - should create a draft claim', async () => {
    const res = await request(app.getHttpServer())
      .post('/claims')
      .send({
        type: 'AUTO',
        description: 'Car accident on highway 101',
        createdBy: 'agent-test-001',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.claimNumber).toMatch(/^CLM-/);
    expect(res.body.status).toBe('DRAFT');
    claimId = res.body.id;
  });

  it('GET /claims/:id - should return the claim', async () => {
    const res = await request(app.getHttpServer())
      .get(`/claims/${claimId}`)
      .expect(200);

    expect(res.body.id).toBe(claimId);
    expect(res.body.description).toBe('Car accident on highway 101');
  });

  it('PATCH /claims/:id/claimant - should save claimant info', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/claims/${claimId}/claimant`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-0100',
        address: '123 Main St',
        policyNumber: 'POL-12345',
      })
      .expect(200);

    expect(res.body.firstName).toBe('John');
    expect(res.body.claimId).toBe(claimId);
  });

  it('PATCH /claims/:id/details - should save claim details', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/claims/${claimId}/details`)
      .send({
        detailType: 'AUTO',
        data: {
          vehicleMake: 'Toyota',
          vehicleModel: 'Camry',
          vehicleYear: '2024',
          licensePlate: 'ABC123',
        },
      })
      .expect(200);

    expect(res.body.detailType).toBe('AUTO');
  });

  it('POST /claims/:id/submit - should submit the claim', async () => {
    const res = await request(app.getHttpServer())
      .post(`/claims/${claimId}/submit`)
      .expect(201);

    expect(res.body.status).toBe('SUBMITTED');
  });

  it('GET /claims - should list claims', async () => {
    const res = await request(app.getHttpServer())
      .get('/claims')
      .expect(200);

    expect(res.body.claims.length).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
  });
});
