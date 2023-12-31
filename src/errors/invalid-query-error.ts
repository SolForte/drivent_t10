import { ApplicationError } from '@/protocols';

export function invalidQueryError(message: string): ApplicationError {
  return {
    name: 'InvalidQuery',
    message,
  };
}
