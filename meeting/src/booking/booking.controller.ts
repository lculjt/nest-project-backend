import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('booking')
@RequireLogin()
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Get('list')
  async getBookingList(
    @Query('pageNo', new DefaultValuePipe(1), ParseIntPipe) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(5), ParseIntPipe) pageSize: number,
    @Query('username') username?: string,
    @Query('roomName') roomName?: string,
    @Query('location') location?: string,
    @Query('bookingStartTime') startTime?: string,
    @Query('bookingEndTime') endTime?: string,
  ) {
    return this.bookingService.getBookingList(pageNo, pageSize, username, roomName, location, startTime, endTime);
  }

  @Post('add')
  async addBooking(@Body() body: CreateBookingDto, @UserInfo('userId') userId: number) {
    return this.bookingService.addBooking(body, userId);
  }

  @Get("apply/:id")
  async apply(@Param('id') id: number) {
    return this.bookingService.apply(id);
  }

  @Get("reject/:id")
  async reject(@Param('id') id: number) {
    return this.bookingService.reject(id);
  }

  @Get("unbind/:id")
  async unbind(@Param('id') id: number) {
    return this.bookingService.unbind(id);
  }

  @Get('urge/:id')
  async urge(@Param('id') id: number) {
    return this.bookingService.urge(id);
  }
}
