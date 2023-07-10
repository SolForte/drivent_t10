import httpStatus from 'http-status';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import { PaymentBody } from '@/protocols';
import paymentsService from '@/services/payments-service';

export async function getTicketStatus(req: AuthenticatedRequest, res: Response) {
  const userId = Number(req);
  const ticketId = Number(req.query.ticketId);

  if (!ticketId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const ticket = await paymentsService.getPayment(ticketId, userId);

    return res.status(httpStatus.OK).send(ticket);
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function createPayment(req: AuthenticatedRequest, res: Response) {
  const body = req.body as PaymentBody;
  const userId = Number(req);

  if (!body.cardData || !body.ticketId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const ticket = await paymentsService.createPayment(body, userId);
    return res.status(httpStatus.OK).send(ticket);
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
