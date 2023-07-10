import { Ticket, TicketType } from '@prisma/client';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { conflictError, notFoundError } from '@/errors';

async function getTicketTypes(): Promise<TicketType[]> {
  const ticketTypes = await ticketsRepository.findTicketTypes();
  if (!ticketTypes) {
    throw notFoundError();
  }
  return ticketTypes;
}

async function getTicket(userId: number): Promise<Ticket> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();
  return ticket;
}

async function createTicket(userId: number, ticketTypeId: number): Promise<Ticket> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket) throw conflictError('User already has a ticket!');

  return ticketsRepository.createTicket(enrollment.id, ticketTypeId);
}

export default {
  getTicketTypes,
  getTicket,
  createTicket,
};
