import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';

export async function getTypes() {
  const types = await ticketsRepository.findTicketsType();
  return types;
}

export async function getTicket(userId: number) {
  const user = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!user) {
    return 404;
  }

  const tickets = await ticketsRepository.findTicketId(userId);
  if (!tickets) {
    return 404;
  }

  return tickets;
}

export async function createTicket(ticketTypeId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    return 404;
  }

  if (!ticketTypeId) {
    return 400;
  }

  return await ticketsRepository.createTicket(ticketTypeId, enrollment.id);
}

const ticketService = {
  getTypes,
  getTicket,
  createTicket,
};

export default ticketService;
