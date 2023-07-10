import { Ticket, TicketStatus, TicketType } from '@prisma/client';
import { CreateTicket } from '@/protocols';
import { prisma } from '@/config';

//GET /tickets/type
async function findTicketsType(): Promise<TicketType[]> {
  return prisma.ticketType.findMany();
}

//GET /tickets
async function findTicketId(enrollmentId: number): Promise<
  Ticket & {
    TicketType: TicketType;
  }
> {
  return prisma.ticket.findFirst({
    where: { enrollmentId },
    include: {
      TicketType: true,
    },
  });
}

//POST /tickets
async function createTicket(ticket: CreateTicket) {
  return prisma.ticket.create({
    data: ticket,
  });
}

async function findTicketByType(id: number) {
  return await prisma.ticketType.findUnique({
    where: {
      id,
    },
  });
}

async function updateTicketStatus(ticketId: number) {
  return prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: TicketStatus.PAID,
    },
  });
}

const ticketsRepository = { findTicketsType, findTicketId, createTicket, findTicketByType, updateTicketStatus };

export default ticketsRepository;
