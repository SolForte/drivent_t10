import { prisma } from '@/config';

const INITIAL_TICKET_STATUS = 'RESERVED';

//GET /tickets/type
async function findTicketsType() {
  return prisma.ticketType.findMany();
}

//GET /tickets
async function findTicketId(userId: number) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId: userId,
      },
    },
    include: {
      TicketType: true,
    },
  });
  return ticket;
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

const ticketsRepository = { findTicketsType, findTicketId, createTicket };

export default ticketsRepository;
