import { IsNumber } from "class-validator";

import { IsNotEmpty } from "class-validator";

export class CreateBookingDto {
    @IsNotEmpty({ message: '会议室名称不能为空' })
    @IsNumber()
    meetingRoomId: number;

    @IsNotEmpty({ message: '开始时间不能为空' })
    startTime: number;

    @IsNotEmpty({ message: '结束时间不能为空' })
    endTime: number;

    note: string;
}
