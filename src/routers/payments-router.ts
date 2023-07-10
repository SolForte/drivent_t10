import { Router } from 'express';
import { paymentsSchema } from '@/schemas';
import paymentsController from '@/controllers/payments-controller';
import { authenticateToken, validateBody } from '@/middlewares';

const paymentsRouter = Router();

paymentsRouter
  .all('/*', authenticateToken)
  .get('/', paymentsController.getPayment)
  .post('/process', validateBody(paymentsSchema), paymentsController.newPayment);

export { paymentsRouter };
