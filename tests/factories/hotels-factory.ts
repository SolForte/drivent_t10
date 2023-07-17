import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  const hotelData = {
    name: faker.company.companyName(),
    image: faker.image.business(),
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  const result = await prisma.hotel.create({
    data: hotelData,
  });

  return result;
}
