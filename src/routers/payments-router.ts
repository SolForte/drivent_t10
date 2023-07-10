import { Router } from 'express';
import { paymentsSchema } from '@/schemas';
import { getPayment, newPayment } from '@/controllers/payments-controller';
import { authenticateToken, validateBody } from '@/middlewares';

const paymentsRouter = Router();

paymentsRouter
  .all('/*', authenticateToken)
  .get('/', getPayment)
  .post('/process', validateBody(paymentsSchema), newPayment);

export { paymentsRouter };
