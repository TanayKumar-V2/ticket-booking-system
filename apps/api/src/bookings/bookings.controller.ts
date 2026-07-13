import { Controller, Post, Body, UseGuards, Request, UsePipes, UseInterceptors, Get } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { holdSeatsSchema, confirmBookingSchema } from './dto/booking.dto';
import type { HoldSeatsDto, ConfirmBookingDto } from './dto/booking.dto';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';
import { ApiBearerAuth, ApiTags, ApiHeader } from '@nestjs/swagger';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  @ApiBearerAuth()
  async getMyBookings(@Request() req: any) {
    return this.bookingsService.getMyBookings(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('hold')
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(holdSeatsSchema))
  async holdSeats(@Request() req: any, @Body() body: HoldSeatsDto) {
    return this.bookingsService.holdSeats(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-idempotency-key', required: false })
  @UseInterceptors(IdempotencyInterceptor)
  @UsePipes(new ZodValidationPipe(confirmBookingSchema))
  async confirmBooking(@Request() req: any, @Body() body: ConfirmBookingDto) {
    const idempotencyKey = req.headers['x-idempotency-key'];
    return this.bookingsService.confirmBooking(req.user.id, body, idempotencyKey);
  }
}
