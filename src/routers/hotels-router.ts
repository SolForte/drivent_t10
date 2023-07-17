import { Router } from 'express';
import { getHotelById, getHotelsList } from '../controllers';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('/', getHotelsList).get('/:hotelId', getHotelById);

export { hotelsRouter };
