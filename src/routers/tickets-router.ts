import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getTicketTypes, getUserTicket, createTicket } from '@/controllers/tickets-controller';
import { ticketsSchema } from '@/schemas';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', getTicketTypes)
  .get('/', getUserTicket)
  .post('/', validateBody(ticketsSchema), createTicket);

export { ticketsRouter };
