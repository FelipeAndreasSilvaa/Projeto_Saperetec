import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import request from 'supertest';

import { PrismaClient } from '@prisma/client';

import { AppModule } from '../src/app.module';

describe('Work Orders (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let techId: string;

  const prisma = new PrismaClient();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'supervisor-a@fieldops.eval',
        password: 'password123',
      });

    token = login.body.accessToken;

    const technician = await prisma.user.findFirst({
      where: {
        role: 'technician',
      },
    });

    if (!technician) {
      throw new Error(
        'Nenhum técnico encontrado no banco de testes.',
      );
    }

    techId = technician.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('should create a work order', async () => {
    const response = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Teste E2E',
        description: 'Criando uma ordem de serviço',
        priority: 'medium',
        teamId: 'team-alpha',
        checklistItems: [
          {
            label: 'Levar ferramentas',
          },
        ],
      });

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('open');
    expect(response.body.version).toBe(1);
  });

  it('should change status from open to in_progress', async () => {
    const create = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'OS para iniciar',
        description: 'Teste de transição',
        priority: 'medium',
        teamId: 'team-alpha',
        checklistItems: [
          {
            label: 'Levar ferramentas',
          },
        ],
      });

    const workOrderId = create.body.id;

    const response = await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'in_progress',
        assigneeId: techId,
        version: 1,
      });


    expect(response.status).toBe(200);
    expect(response.body.status).toBe('in_progress');
    expect(response.body.version).toBe(2);
  });

  it('should not allow open to in_progress without assigneeId', async () => {
    const create = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'OS sem técnico',
        description: 'Teste de validação',
        priority: 'medium',
        teamId: 'team-alpha',
        checklistItems: [
          {
            label: 'Levar ferramentas',
          },
        ],
      });
  
    const workOrderId = create.body.id;
  
    const response = await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'in_progress',
        version: 1,
      });
  
    expect(response.status).toBe(400);
  
    expect(response.body.code).toBe(
      'FLX_VALIDATION_ERROR',
    );
  
    expect(response.body.message).toContain(
      'assigneeId',
    );
  });

  it('should not allow open to in_progress without assigneeId', async () => {
  const create = await request(app.getHttpServer())
    .post('/work-orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'OS sem técnico',
      description: 'Teste de validação',
      priority: 'medium',
      teamId: 'team-alpha',
      checklistItems: [
        {
          label: 'Levar ferramentas',
        },
      ],
    });

  const workOrderId = create.body.id;

  const response = await request(app.getHttpServer())
    .patch(`/work-orders/${workOrderId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      status: 'in_progress',
      version: 1,
    });

  expect(response.status).toBe(400);

  expect(response.body.code).toBe(
    'FLX_VALIDATION_ERROR',
  );

  expect(response.body.message).toContain(
    'assigneeId',
  );
});

it('should not allow invalid status transition', async () => {
    const create = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'OS transição inválida',
        description: 'Teste de regra de negócio',
        priority: 'medium',
        teamId: 'team-alpha',
        checklistItems: [
          {
            label: 'Levar ferramentas',
          },
        ],
      });
  
    const workOrderId = create.body.id;
  
    const response = await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'done',
        resolutionNotes: 'Equipamento reparado.',
        version: 1,
      });
  
    expect(response.status).toBe(400);
  
    expect(response.body.code).toBe(
      'FLX_INVALID_STATUS_TRANSITION',
    );
  });

  it('should return 409 for stale version', async () => {
    const create = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'OS concorrência',
        description: 'Teste de versionamento',
        priority: 'medium',
        teamId: 'team-alpha',
        checklistItems: [
          {
            label: 'Levar ferramentas',
          },
        ],
      });
  
    const workOrderId = create.body.id;
  
    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'in_progress',
        assigneeId: techId,
        version: 1,
      });
  
    const response = await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'done',
        resolutionNotes: 'Equipamento reparado com sucesso.',
        version: 1,
      });
  
    expect(response.status).toBe(409);
  
    expect(response.body.code).toBe(
      'FLX_CONCURRENT_UPDATE',
    );
  });

  it('should return work order history', async () => {
    const create = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'OS histórico',
        description: 'Teste de auditoria',
        priority: 'medium',
        teamId: 'team-alpha',
        checklistItems: [
          {
            label: 'Levar ferramentas',
          },
        ],
      });
  
    const workOrderId = create.body.id;
  
    await request(app.getHttpServer())
      .patch(`/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'in_progress',
        assigneeId: techId,
        version: 1,
      });
  
    const history = await request(app.getHttpServer())
      .get(`/work-orders/${workOrderId}/history`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(history.status).toBe(200);
  
    expect(Array.isArray(history.body)).toBe(true);
  
    expect(history.body.length).toBeGreaterThan(0);
  
    expect(history.body[0].fromStatus).toBe('open');
  
    expect(history.body[0].toStatus).toBe('in_progress');
  });
  
});