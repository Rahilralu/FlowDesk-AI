import prisma from '../config/psql.js';
import { requestQueue } from '../queues/requestQueue.js';

export const createRequest = async (data) => {
  const request = await prisma.customerRequest.create({
    data: {
      message: data.message,
      customerName: data.customerName,
      customerEmail: data.customerEmail ?? null,
      customerPhone: data.customerPhone ?? null,
      source: data.source ?? 'WEB',
      status: 'NEW',
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

  await requestQueue.add('classify', { requestId: request.id });
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
  return request;
};