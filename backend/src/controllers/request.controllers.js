import { z } from 'zod';
import { createRequest } from '../services/request.services.js'; 

const createRequestSchema = z.object({
    message: z.string().min(1,'Message is required'),
    customerName: z.string().min(1,'Customer name is required'),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().optional(),
    source: z.enum(['WEB','WHATSAPP','EMAIL','TELEGRAM','API']).default('WEB')
});

export const handleCreateRequest = async (req, res) => {
  const result = createRequestSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }

  const request = await createRequest(result.data);
  return res.status(201).json({ success: true, request });
};