import { Response } from 'express';
import httpStatus from 'http-status';
import hotelsService from '../services/hotels-service/intex';
import { AuthenticatedRequest } from '@/middlewares';

function handleErrors(error: string, res: Response) {
  if (error === 'NotFound') {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
  if (error === 'PaymentRequired') {
    return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
  }
  return res.sendStatus(httpStatus.BAD_REQUEST);
}

export async function getHotelsList(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const hotels = await hotelsService.getHotels(userId);
    res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    handleErrors(error.message, res);
  }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotelId = Number(req.params.hotelId);
  try {
    const result = await hotelsService.getHotelById(hotelId, userId);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    handleErrors(error.message, res);
  }
}
