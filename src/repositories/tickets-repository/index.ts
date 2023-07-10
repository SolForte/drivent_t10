import { prisma } from '@/config';

const INITIAL_TICKET_STATUS = 'RESERVED';
const FINAL_TICKET_STATUS = 'PAID';

//GET /tickets/type
async function findTicketsType() {
  return prisma.ticketType.findMany();
}

//GET /tickets
async function findTicketId(enrollmentId: number) {
  return await prisma.ticket.findFirst({
    where: { enrollmentId },
    include: {
      TicketType: true,
    },
  });
}

//POST /tickets
async function createTicket(ticketTypeId: number, enrollmentId: number) {
  return prisma.ticket.create({
    data: {
      ticketTypeId: ticketTypeId,
      status: INITIAL_TICKET_STATUS,
      enrollmentId: enrollmentId,
    },
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
    where: { id: ticketId },
    data: { status: FINAL_TICKET_STATUS },
  });
}

const ticketsRepository = { findTicketsType, findTicketId, createTicket, findTicketByType, updateTicketStatus };

export default ticketsRepository;
