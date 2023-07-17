import enrollmentsService from '../enrollments-service';
import { notFoundError } from '../../errors';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import ticketService from '@/services/tickets-service';

async function checkUserData(userId: number) {
  const enrollment = await enrollmentsService.getOneWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketService.getTicketByUserId(userId);
  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.status !== 'PAID') {
    throw Error('PaymentRequired');
  }
  const ticketsTypes = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (ticketsTypes.TicketType.includesHotel === false || ticketsTypes.TicketType.isRemote === true) {
    throw Error('PaymentRequired');
  }
}

async function getHotels(userId: number) {
  await checkUserData(userId);
  const hotels = await hotelsRepository.findMany();
  if (!hotels || hotels.length === 0) {
    throw notFoundError();
  }
  return hotels;
}

async function getHotelById(hotelId: number, userId: number) {
  if (!hotelId) {
    throw Error('BadRequest');
  }

  await checkUserData(userId);

  const hotels = await hotelsRepository.findUnique(hotelId);
  if (!hotels) {
    throw notFoundError();
  }

  return hotels;
}

const hotelsService = {
  getHotels,
  getHotelById,
};

export default hotelsService;
