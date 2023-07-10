import { Router } from 'express';
import { getTicketStatus, createPayment } from '../controllers/payments-controller';
import { authenticateToken } from '@/middlewares';

const paymentsRouter = Router();

paymentsRouter.all('/*', authenticateToken).get('/', getTicketStatus).post('/', createPayment);

export { paymentsRouter };
