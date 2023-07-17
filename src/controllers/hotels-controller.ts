import { Response } from 'express';
import httpStatus from 'http-status';
import hotelsService from '../services/hotels-service/intex';
import { AuthenticatedRequest } from '@/middlewares';

export async function getHotelsList(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const hotels = await hotelsService.getHotels(userId);
    res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if (error.message === 'NotFound') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    } else if (error.message === 'PaymentRequired') {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    } else if (error.message === 'BadRequest') {
      res.sendStatus(httpStatus.BAD_REQUEST);
    } else {
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotelId = Number(req.params.hotelId);
  try {
    const result = await hotelsService.getHotelById(hotelId, userId);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    if (error.message === 'NotFound') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    } else if (error.message === 'PaymentRequired') {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    } else if (error.message === 'BadRequest') {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    } else {
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
