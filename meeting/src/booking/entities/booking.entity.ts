import { MeetingRoom } from "src/meeting-room/entities/meeting-room.entity";
import { User } from "src/user/entities/user.entity";
import { dateTransformer } from "src/utils/timeTransfer";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: 'bookings'
})
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: '会议开始时间',
        transformer: dateTransformer,
    })
    startTime: Date;

    @Column({
        comment: '会议结束时间',
        transformer: dateTransformer,
    })
    endTime: Date;

    @Column({
        length: 20,
        comment: '状态（申请中、审批通过、审批驳回、已解除）',
        default: '申请中'
    })
    status: string;

    @Column({
        length: 100,
        comment: '备注',
        default: ''
    })
    note: string;

    @ManyToOne(() => MeetingRoom)
    room: MeetingRoom;

    @ManyToOne(() => User)
    user: User;

    @CreateDateColumn({
        transformer: dateTransformer,
    })
    createTime: Date;

    @UpdateDateColumn({
        transformer: dateTransformer,
    })
    updateTime: Date;
}