import Joi from 'joi';

export const ticketsSchema = Joi.object({
  ticketTypeId: Joi.number().positive().required(),
});
