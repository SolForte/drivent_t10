import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { notFoundError } from '@/errors';

export async function getTypes() {
  const types = await ticketsRepository.findTicketsType();
  return types;
}

export async function getTicket(userId: number) {
  const user = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!user) {
    throw notFoundError();
  }

  const tickets = await ticketsRepository.findTicketId(user.id);
  if (!tickets) {
    throw notFoundError();
  }

  return tickets;
}

export async function createTicket(ticketTypeId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  if (!ticketTypeId) {
    throw notFoundError();
  }

  return await ticketsRepository.createTicket(ticketTypeId, enrollment.id);
}

const ticketService = {
  getTypes,
  getTicket,
  createTicket,
};

export default ticketService;
