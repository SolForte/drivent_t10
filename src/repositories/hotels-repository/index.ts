import { prisma } from '@/config';

async function findMany() {
  return prisma.hotel.findMany();
}

async function findUnique(id: number) {
  return prisma.hotel.findUnique({
    where: { id },
    include: { Rooms: true },
  });
}

const hotelsRepository = {
  findMany,
  findUnique,
};

export default hotelsRepository;
