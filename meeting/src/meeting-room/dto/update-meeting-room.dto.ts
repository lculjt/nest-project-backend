import { PartialType } from '@nestjs/mapped-types';
import { CreateMeetingRoom } from './create-meeting-room.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateMeetingRoom extends PartialType(CreateMeetingRoom) {

    @IsNotEmpty({
        message: 'id 不能为空'
    })
    id: number;
}