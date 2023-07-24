import { TicketStatus } from '@prisma/client';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { internalServerError, notFoundError } from '@/errors';
import ticketsRepository from '@/repositories/tickets-repository';
import bookingRepository from '@/repositories/booking-repository';
import { ForbiddenError } from '@/errors/forbidden-error';
import roomRepository from '@/repositories/room-repository';

async function getBookings(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking) {
    throw notFoundError();
  }
  return {
    id: booking.id,
    Room: booking.Room,
  };
}

async function createBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (
    !ticket ||
    ticket.status === TicketStatus.RESERVED ||
    !ticket.TicketType.includesHotel ||
    ticket.TicketType.isRemote
  ) {
    throw ForbiddenError();
  }

  const room = await roomRepository.findRoomById(roomId);
  const bookingCount = await bookingRepository.countBookingByRoomId(roomId);
  if (!room) {
    throw notFoundError();
  }
  if (room.capacity === bookingCount) {
    throw ForbiddenError();
  }
  const booking = await bookingRepository.createBooking(userId, roomId);
  return booking.id;
}

async function changeRoom(userId: number, bookingId: number, roomId: number) {
  if (!bookingId) {
    throw ForbiddenError();
  }
  const userBooking = await bookingRepository.findBookingByUserId(userId);
  if (!userBooking) {
    throw ForbiddenError();
  }
  const room = await roomRepository.findRoomById(roomId);
  if (!room) {
    throw notFoundError();
  }
  const bookingCount = await bookingRepository.countBookingByRoomId(roomId);
  if (room.capacity === bookingCount) {
    throw ForbiddenError();
  }
  const checkBooking = await bookingRepository.findBookingByBookingId(bookingId);
  if (!checkBooking) {
    throw notFoundError();
  }
  const updateBooking = await bookingRepository.updateBooking(userBooking.id, room.id);
  if (userBooking.id !== updateBooking.id || !updateBooking) {
    throw internalServerError();
  }

  return { bookingId: updateBooking.id };
}

const bookingService = {
  getBookings,
  createBooking,
  changeRoom,
};

export default bookingService;
