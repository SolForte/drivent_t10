import { ApplicationError } from '@/protocols';

export function internalServerError(): ApplicationError {
  return {
    name: 'InternalServerError',
    message: 'Internal server error!',
  };
}
