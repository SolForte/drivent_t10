import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import ticketsController from '@/controllers/tickets-controller';
import { ticketsSchema } from '@/schemas';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', ticketsController.getTicketTypes)
  .get('/', ticketsController.getUserTicket)
  .post('/', validateBody(ticketsSchema), ticketsController.createTicket);

export { ticketsRouter };
