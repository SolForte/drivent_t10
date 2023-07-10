import { PaymentParams } from '@/protocols';
import { prisma } from '@/config';

async function createPayment(paymentData: PaymentParams) {
  return prisma.payment.create({
    data: paymentData,
  });
}

async function findPayment(ticketId: number) {
  return prisma.payment.findFirst({
    where: { ticketId },
  });
}

export default {
  createPayment,
  findPayment,
};
