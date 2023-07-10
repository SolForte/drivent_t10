import { Router } from 'express';
import { getTicketsType, getTickets, postTickets } from '../controllers/tickets-controller';
import { authenticateToken } from '@/middlewares';

const ticketsRouter = Router();

ticketsRouter.all('/*', authenticateToken).get('/types', getTicketsType).get('/', getTickets).post('/', postTickets);

export { ticketsRouter };
