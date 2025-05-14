import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { RequireLogin } from 'src/custom.decorator';
import { CreateMeetingRoom } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoom } from './dto/update-meeting-room.dto';

@Controller('meeting-room')
@RequireLogin()
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) { }
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), ParseIntPipe) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(5), ParseIntPipe) pageSize: number,
    @Query('name') name: string,
    @Query('capacity') capacity: number,
    @Query('equipment') equipment: string
  ) {
    return await this.meetingRoomService.find(pageNo, pageSize, name, capacity, equipment);
  }

  @Post('create')
  async create(@Body() meetingRoomDto: CreateMeetingRoom) {
    return await this.meetingRoomService.create(meetingRoomDto);
  }

  @Put('update')
  async update(@Body() meetingRoomDto: UpdateMeetingRoom) {
    return await this.meetingRoomService.update(meetingRoomDto);
  }

  @Get(':id')
  async find(@Param('id') id: number) {
    return await this.meetingRoomService.findById(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.meetingRoomService.delete(id);
  }
}
