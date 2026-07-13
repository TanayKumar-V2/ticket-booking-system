import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UsePipes } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createEventSchema, updateEventSchema } from './dto/event.dto';
import type { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Request() req: any) {
    // If we want public access, we shouldn't use JwtAuthGuard here globally
    // We will extract user role from token if present, otherwise undefined
    // For simplicity, let's assume it's public but admin sees all
    const user = req.user;
    return this.eventsService.findAll(user?.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @Get('my-events')
  @ApiBearerAuth()
  async findMyEvents(@Request() req: any) {
    return this.eventsService.findOrganizerEvents(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @Post()
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(createEventSchema))
  async create(@Request() req: any, @Body() body: CreateEventDto) {
    return this.eventsService.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @Put(':id')
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(updateEventSchema))
  async update(@Param('id') id: string, @Request() req: any, @Body() body: UpdateEventDto) {
    return this.eventsService.update(id, req.user.id, req.user.role, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @Delete(':id')
  @ApiBearerAuth()
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.delete(id, req.user.id, req.user.role);
  }
}
