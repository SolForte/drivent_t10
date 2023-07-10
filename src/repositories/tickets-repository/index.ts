import { Ticket, TicketStatus, TicketType } from '@prisma/client';
import { prisma } from '@/config';

async function findTicketTypes(): Promise<TicketType[]> {
  return prisma.ticketType.findMany();
}

async function findTicketByEnrollmentId(enrollmentId: number): Promise<
  Ticket & {
    TicketType: TicketType;
  }
> {
  return prisma.ticket.findFirst({
    where: { enrollmentId },
    include: { TicketType: true },
  });
}

async function createTicket(enrollmentId: number, ticketTypeId: number) {
  return prisma.ticket.create({
    data: { enrollmentId, ticketTypeId, status: TicketStatus.RESERVED },
    include: { TicketType: true },
  });
}
async function findTicketById(ticketId: number) {
  return prisma.ticket.findFirst({
    where: { id: ticketId },
    include: { TicketType: true },
  });
}

async function updateTicketById(ticketId: number) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { status: TicketStatus.PAID },
  });
}

export default {
  findTicketTypes,
  createTicket,
  findTicketByEnrollmentId,
  findTicketById,
  updateTicketById,
};
