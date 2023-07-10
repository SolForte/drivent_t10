import httpStatus from 'http-status';
import { PaymentBody } from '@/protocols';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import paymentsRepository from '@/repositories/payments-repository';

async function getPayment(ticketId: number, userId: number) {
  const ticketByTicketId = await ticketsRepository.findTicketId(ticketId);
  if (!ticketByTicketId) {
    return httpStatus.NOT_FOUND;
  }

  const user = await enrollmentRepository.findWithAddressByUserId(ticketByTicketId.enrollmentId);
  if (user.userId !== userId) {
    return httpStatus.UNAUTHORIZED;
  }

  const payment = await paymentsRepository.findPayment(ticketId);
  if (!payment) {
    return httpStatus.NOT_FOUND;
  }

  return payment;
}

async function createPayment(body: PaymentBody, userId: number) {
  const ticket = await ticketsRepository.findTicketId(body.ticketId);
  if (!ticket) return httpStatus.NOT_FOUND;

  const user = await enrollmentRepository.findWithAddressByUserId(ticket.enrollmentId);
  if (user.userId !== userId) return httpStatus.UNAUTHORIZED;

  const type = await ticketsRepository.findTicketByType(ticket.ticketTypeId);

  await ticketsRepository.updateTicketStatus(body.ticketId);

  const payment = {
    ticketId: body.ticketId,
    cardIssuer: body.cardData.issuer,
    value: type.price,
    cardLastDigits: body.cardData.number.toString().slice(-4),
  };

  await paymentsRepository.createPayment(payment);

  const result = await paymentsRepository.findPayment(body.ticketId);
  return result;
}

const paymentsService = {
  getPayment,
  createPayment,
};

export default paymentsService;
