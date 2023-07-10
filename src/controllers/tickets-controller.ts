import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '../middlewares';
import ticketsService from '@/services/tickets-service';

async function getTicketTypes(_req: Request, res: Response): Promise<Response> {
  const ticketTypes = await ticketsService.getTicketTypes();
  return res.status(httpStatus.OK).send(ticketTypes);
}

async function createTicket(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const { ticketTypeId }: { ticketTypeId: number } = req.body;
  const { userId } = req;
  const ticket = await ticketsService.createTicket(userId, ticketTypeId);
  return res.status(httpStatus.CREATED).send(ticket);
}

async function getUserTicket(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const { userId } = req;
  const ticket = await ticketsService.getTicket(userId);
  if (!ticket) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
  return res.status(httpStatus.OK).send(ticket);
}

export default {
  getTicketTypes,
  createTicket,
  getUserTicket,
};
