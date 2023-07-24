import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: 3,
      hotelId: hotelId,
    },
  });
}

export async function generateRoom(hotelId: number, capacity: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity,
      hotelId: hotelId,
    },
  });
}
