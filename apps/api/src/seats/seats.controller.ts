import { Controller, Get, Post, Body, Param, UseGuards, Request, UsePipes } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createSeatsSchema } from './dto/seat.dto';
import type { CreateSeatsDto } from './dto/seat.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('seats')
@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get('event/:eventId')
  async getEventSeats(@Param('eventId') eventId: string) {
    return this.seatsService.getEventSeats(eventId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @Post()
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(createSeatsSchema))
  async createSeats(@Request() req: any, @Body() body: CreateSeatsDto) {
    return this.seatsService.createBulk(req.user.id, req.user.role, body);
  }
}
