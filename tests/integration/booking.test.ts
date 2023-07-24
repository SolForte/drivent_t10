import httpStatus from 'http-status';
import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import {
  createEnrollmentWithAddress,
  createHotel,
  createRoomWithHotelId,
  generateRoom,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createUser,
  generateBooking,
  createPayment,
  createTicketType,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';
import bookingService from '@/services/booking-service';
import { notFoundError, ForbiddenError } from '@/errors';

beforeAll(async () => {
  await init();
});
beforeEach(async () => {
  await cleanDb();
});

const SAMPLE_USER_ID = 1;
const SAMPLE_ROOM_ID = 1;
const MOCK_INVALID_PARAMETER = 1;
const NOTFOUND_MOCK_PARAMETER = 10;
const INVALID_STRING_PARAMETER = 'test';

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = MOCK_INVALID_PARAMETER;
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 404 if user has no booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 200 if user has a booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await generateBooking(user.id, room.id);
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toMatchObject({
      id: booking.id,
      Room: {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        hotelId: room.hotelId,
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString(),
      },
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = MOCK_INVALID_PARAMETER;
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 403 when ticket type is remote', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    await createPayment(ticket.id, ticketType.price);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 if ticket type is remote', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const body = { roomId: room.id };
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 when ticket type doesnt includes a hotel', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    await createPayment(ticket.id, ticketType.price);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 if ticket status is not paid', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketType(isRemote, includesHotel);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it('should respond with status 404 if user has no enrollment', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const body = { roomId: SAMPLE_ROOM_ID };
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 200 and user booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const body = { roomId: room.id };
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({
      bookingId: expect.any(Number),
    });
  });

  it('should respond with status 404 if room doesnt exist', async () => {
    const user = await createUser();
    try {
      await bookingService.createBooking(user.id, SAMPLE_ROOM_ID);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toEqual(notFoundError());
    }
  });

  it('should respond with status code 403 if there is no capacity left in the room (room is full)', async () => {
    const user = await createUser();
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    try {
      const response = await bookingService.createBooking(user.id, room.id);
      expect(response).toEqual({
        bookingId: expect.any(Number),
      });
    } catch (error) {
      expect(error).toEqual(ForbiddenError());
    }
  });
});

describe('PUT /booking/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking');
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = MOCK_INVALID_PARAMETER;
    const response = await server.put('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.put('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 403 if user has no booking', async () => {
    const token = await generateValidToken();
    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it('should respond with status 404', async () => {
    try {
      const response = await bookingService.createBooking(SAMPLE_USER_ID, SAMPLE_ROOM_ID);
      expect(response).toEqual(1);
    } catch (error) {
      expect(error).toEqual(notFoundError());
    }
  });

  it('should respond with status 403 if user has no booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const roomTwo = await createRoomWithHotelId(hotel.id);
    const response = await server
      .put(`/booking/${MOCK_INVALID_PARAMETER}`)
      .send({ roomId: roomTwo.id })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 if room has no capacity left (room is full)', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const roomTwo = await generateRoom(hotel.id, 0);
    const booking = await generateBooking(user.id, room.id);
    const response = await server
      .put(`/booking/${booking.id}`)
      .send({ roomId: roomTwo.id })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 403 if room has no capacity left (room is full)', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const includesHotel = true;
    const ticketType = await createTicketType(undefined, includesHotel);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    await createPayment(ticket.id, ticketType.price);
    const hotel = await createHotel();
    const room = await generateRoom(hotel.id, 1);
    const newRoom = await generateRoom(hotel.id, 0);
    const booking = await generateBooking(user.id, room.id);
    const response = await server
      .put(`/booking/${booking.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ roomId: newRoom.id });
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it('should respond with status 404 when room doesnt exist', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const includesHotel = true;
    const ticketType = await createTicketType(undefined, includesHotel);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    await createPayment(ticket.id, ticketType.price);
    const hotel = await createHotel();
    const room = await generateRoom(hotel.id, SAMPLE_ROOM_ID);
    const booking = await generateBooking(user.id, room.id);
    const response = await server
      .put(`/booking/${booking.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ roomId: NOTFOUND_MOCK_PARAMETER });
    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  it('should respond with status 404 if room doesnt exist', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await generateBooking(user.id, room.id);
    const response = await server
      .put(`/booking/${booking.id}`)
      .send({ roomId: NOTFOUND_MOCK_PARAMETER })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 403 if booking isnt given', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const roomTwo = await createRoomWithHotelId(hotel.id);
    const response = await server
      .put(`/booking/${INVALID_STRING_PARAMETER}`)
      .send({ roomId: roomTwo.id })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should respond with status 200 and bookingId', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const roomTwo = await createRoomWithHotelId(hotel.id);
    const booking = await generateBooking(user.id, room.id);
    const response = await server
      .put(`/booking/${booking.id}`)
      .send({ roomId: roomTwo.id })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({
      bookingId: expect.any(Number),
    });
  });
});
