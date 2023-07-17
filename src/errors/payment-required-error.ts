import { ApplicationError } from '@/protocols';

export function paymentRequiredError(): ApplicationError {
  return {
    name: 'PaymentRequiredError',
    message: 'Your ticket status is not "paid".',
  };
}
