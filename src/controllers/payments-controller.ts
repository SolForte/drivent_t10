import { Response } from 'express';
import httpStatus from 'http-status';
import paymentsService from '@/services/payments-service';
import { invalidQueryError } from '@/errors';
import { AuthenticatedRequest } from '@/middlewares';

async function newPayment(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const { userId } = req;
  const { ticketId, cardData } = req.body;
  const { issuer: cardIssuer } = cardData;
  const cardLastDigits = cardData.number.slice(-4);
  const payment = await paymentsService.newPayment(userId, { ticketId, cardIssuer, cardLastDigits });
  return res.status(httpStatus.OK).send(payment);
}

async function getPayment(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const { userId } = req;
  const { ticketId }: { ticketId?: string } = req.query;

  if (!ticketId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  const ticketIdQuery = parseInt(ticketId);
  if (ticketIdQuery <= 0 || isNaN(ticketIdQuery)) throw invalidQueryError('Invalid ticket!');

  const payment = await paymentsService.getPayment(userId, ticketIdQuery);
  if (!payment) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }

  return res.status(httpStatus.OK).send(payment);
}

export default {
  newPayment,
  getPayment,
};
