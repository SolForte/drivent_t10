import { TicketType, Ticket, TicketStatus } from '@prisma/client';
import { CreateTicket } from '../../protocols';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { notFoundError } from '@/errors';

export async function getTicketTypes(): Promise<TicketType[]> {
  const types = await ticketsRepository.findTicketsType();
  if (!types) {
    throw notFoundError();
  }
  return types;
}

export async function getTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketsRepository.findTicketId(enrollment.id);
  if (!ticket) {
    throw notFoundError();
  }

  return ticket;
}

export async function createTicket(ticketTypeId: number, userId: number): Promise<Ticket> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticketData: CreateTicket = {
    ticketTypeId,
    enrollmentId: enrollment.id,
    status: TicketStatus.RESERVED,
  };

  await ticketsRepository.createTicket(ticketData);

  const tickets = await ticketsRepository.findTicketId(enrollment.id);
  return tickets;
}

const ticketsService = {
  getTicketTypes,
  getTicket,
  createTicket,
};

export default ticketsService;
