import { notFoundError, unauthorizedError } from '@/errors';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import paymentsRepository from '@/repositories/payments-repository';

async function verifyTicket(userId: number, ticketId: number) {
  const ticket = await ticketsRepository.findTicketById(ticketId);
  if (!ticket) throw notFoundError();

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (ticket.enrollmentId !== enrollment.id) throw unauthorizedError();
  return ticket;
}

async function newPayment(userId: number, body: { ticketId: number; cardIssuer: string; cardLastDigits: string }) {
  const { ticketId } = body;
  const ticket = await verifyTicket(userId, ticketId);
  const payment = await paymentsRepository.createPayment({ ...body, value: ticket.TicketType.price });
  await ticketsRepository.updateTicketById(ticketId);
  return payment;
}

async function getPayment(userId: number, ticketId: number) {
  await verifyTicket(userId, ticketId);
  const payment = paymentsRepository.findPayment(ticketId);
  if (!payment) {
    throw notFoundError();
  }
  return payment;
}

export default {
  newPayment,
  getPayment,
};
