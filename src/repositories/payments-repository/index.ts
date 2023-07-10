import { Payment } from '@prisma/client';
import { prisma } from '@/config';

async function findPayment(id: number) {
  return await prisma.payment.findFirst({
    where: {
      ticketId: id,
    },
  });
}

async function createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) {
  return prisma.payment.create({
    data: payment,
  });
}

const paymentsRepository = {
  findPayment,
  createPayment,
};

export default paymentsRepository;
