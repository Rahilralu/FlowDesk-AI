import prisma from '../config/psql.js';
import { requestQueue } from '../queues/requestQueue.js';
import { createHash } from 'crypto';

export const createRequest = async (data) => {
  const idempotencyKey = createHash('sha256')
    .update(`${data.customerEmail ?? data.customerName}-${data.message}`)
    .digest('hex');

  const existing = await prisma.customerRequest.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    await prisma.customerRequest.update({
      where: { id: existing.id },
      data: { updatedAt: new Date() },
    });
    return { request: existing, duplicate: true };
  }

  const request = await prisma.customerRequest.create({
    data: {
      message: data.message,
      customerName: data.customerName,
      customerEmail: data.customerEmail ?? null,
      customerPhone: data.customerPhone ?? null,
      source: data.source ?? 'WEB',
      status: 'NEW',
      idempotencyKey,
    },
  });

  await prisma.requestEvent.create({
    data: {
      requestId: request.id,
      eventType: 'REQUEST_CREATED',
      newValue: 'NEW',
      metadata: JSON.stringify({ source: request.source }),
    },
  });

  await requestQueue.add('classify', { requestId: request.id }, {
    delay: 500,
  });

  await prisma.customerRequest.update({
    where: { id: request.id },
    data: { status: 'QUEUED' },
  });

  await prisma.requestEvent.create({
    data: {
      requestId: request.id,
      eventType: 'STATUS_CHANGED',
      oldValue: 'NEW',
      newValue: 'QUEUED',
      metadata: JSON.stringify({ trigger: 'enqueued' }),
    },
  });

  return { request, duplicate: false };
};

export const getRequests = async (filters) => {
  const { status, priority, category, page = 1, limit = 10 } = filters;

  const where = {};
  if (status) where.status = status;
  if (priority) where.prioritySnapshot = priority;
  if (category) where.categorySnapshot = category;

  const [requests, total] = await Promise.all([
    prisma.customerRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      include: { aiClassification: true},
    }),
    prisma.customerRequest.count({ where }),
  ]);

  return { requests,total,page: Number(page),totalPages: Math.ceil(total / limit) };
};

export const getRequestById = async (id) => {
  const request = await prisma.customerRequest.findUnique({ where: { id },include: { aiClassification: true, requestEvents: { orderBy: { createdAt: 'asc' }, }, internalNotes: { orderBy: { createdAt: 'asc' }}}});
  if (!request) throw new Error('Request not found');
  return request;
};

export const updateRequestStatus = async (id, status) => {
  const request = await prisma.customerRequest.findUnique({ where: { id } });
  if (!request) throw new Error('Request not found');
  const updated = await prisma.customerRequest.update({ where: { id }, data: { status },});
  await prisma.requestEvent.create({
    data: {
      requestId: id,
      eventType: 'STATUS_CHANGED',
      oldValue: request.status,
      newValue: status,
      metadata: JSON.stringify({ trigger: 'admin_update' }),
    },
  });
  return updated;
};

export const addNote = async (id, body) => {
  const request = await prisma.customerRequest.findUnique({ where: { id } });
  if (!request) throw new Error('Request not found');
  const note = await prisma.internalNote.create({
    data: {
      requestId: id,
      body,
    },
  });
  await prisma.requestEvent.create({
    data: {
      requestId: id,
      eventType: 'NOTE_ADDED',
      newValue: body,
    },
  });
  return note;
};