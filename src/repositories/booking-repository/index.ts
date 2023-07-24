import { prisma } from '@/config';

async function countBookingByRoomId(roomId: number) {
  return prisma.booking.count({
    where: { roomId },
  });
}

async function findBookingByBookingId(bookingId: number) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
  });
}

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    include: { Room: true },
  });
}

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
      updatedAt: new Date(),
    },
  });
}

async function updateBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { roomId: roomId },
  });
}

const bookingRepository = {
  countBookingByRoomId,
  findBookingByBookingId,
  findBookingByUserId,
  createBooking,
  updateBooking,
};

export default bookingRepository;
