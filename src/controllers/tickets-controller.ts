import { Response } from 'express';
import httpStatus from 'http-status';
import ticketsService from '@/services/tickets-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function getTicketsType(_req: AuthenticatedRequest, res: Response): Promise<Response> {
  try {
    const types = await ticketsService.getTicketTypes();
    return res.status(httpStatus.OK).send(types);
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getTickets(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const userId = Number(req);
  if (!userId) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
  try {
    const ticket = await ticketsService.getTicket(userId);
    return res.status(httpStatus.OK).send(ticket);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    } else {
      return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export async function postTickets(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const { ticketTypeId } = req.body as { ticketTypeId: number };
  const userId = Number(req);
  if (!ticketTypeId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
  try {
    const create = await ticketsService.createTicket(ticketTypeId, userId);
    return res.status(httpStatus.CREATED).send(create);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === 'BadRequestError') {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
