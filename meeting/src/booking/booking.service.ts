import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Booking } from './entities/booking.entity';
import { Between, EntityManager, LessThanOrEqual, Like, MoreThanOrEqual } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class BookingService {

    @InjectEntityManager()
    private entityManager: EntityManager;

    @Inject(RedisService)
    private redisService: RedisService;

    @Inject(EmailService)
    private emailService: EmailService;


    async initData() {
        const user1 = await this.entityManager.findOneBy(User, {
            id: 1
        });
        const user2 = await this.entityManager.findOneBy(User, {
            id: 2
        });

        const room1 = await this.entityManager.findOneBy(MeetingRoom, {
            id: 3
        });
        const room2 = await await this.entityManager.findOneBy(MeetingRoom, {
            id: 5
        });

        const booking1 = new Booking();
        booking1.room = room1;
        booking1.user = user1;
        booking1.startTime = new Date();
        booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

        await this.entityManager.save(Booking, booking1);

        const booking2 = new Booking();
        booking2.room = room2;
        booking2.user = user2;
        booking2.startTime = new Date();
        booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

        await this.entityManager.save(Booking, booking2);

        const booking3 = new Booking();
        booking3.room = room1;
        booking3.user = user2;
        booking3.startTime = new Date();
        booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

        await this.entityManager.save(Booking, booking3);

        const booking4 = new Booking();
        booking4.room = room2;
        booking4.user = user1;
        booking4.startTime = new Date();
        booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

        await this.entityManager.save(Booking, booking4);
    }

    async getBookingList(
        pageNo: number,
        pageSize: number,
        username?: string,
        roomName?: string,
        location?: string,
        startTime?: string,
        endTime?: string
    ) {
        const skipCount = (pageNo - 1) * pageSize;

        const condition: Record<string, any> = {};

        if (username) {
            condition.user = {
                username: Like(`%${username}%`)
            }
        }

        if (roomName) {
            condition.room = {
                name: Like(`%${roomName}%`)
            }
        }

        if (location) {
            if (!condition.room) {
                condition.room = {}
            }
            condition.room.location = Like(`%${location}%`)
        }

        if (startTime) {
            if (!endTime) {
                endTime = startTime + 60 * 60 * 1000
            }
            condition.startTime = Between(new Date(startTime), new Date(endTime))
        }

        const [bookings, totalCount] = await this.entityManager.findAndCount(Booking, {
            skip: skipCount,
            take: pageSize,
            where: condition,
            relations: {
                user: true,
                room: true,
            },
        });
        return {
            totalCount,
            bookings: bookings.map(item => {
                delete item.user.password;
                return item;
            })
        }
    }

    async addBooking(body: CreateBookingDto, userId: number) {
        const user = await this.entityManager.findOneBy(User, {
            id: userId
        });

        const room = await this.entityManager.findOneBy(MeetingRoom, {
            id: body.meetingRoomId
        });

        if (!room) {
            throw new BadRequestException('会议室不存在');
        }

        const booking = new Booking();
        booking.room = room;
        booking.user = user;
        booking.startTime = new Date(body.startTime);
        booking.endTime = new Date(body.endTime);
        booking.note = body.note;

        const res = await this.entityManager.findOneBy(Booking, {
            room: {
                id: body.meetingRoomId
            },
            startTime: LessThanOrEqual(booking.endTime),
            endTime: MoreThanOrEqual(booking.startTime)
        });

        if (res) {
            throw new BadRequestException('该时间段已被预定');
        }

        await this.entityManager.save(Booking, booking);

        return '预约成功';
    }

    async apply(id: number) {
        await this.entityManager.update(Booking, {
            id
        }, {
            status: '审批通过'
        });
        return 'success'
    }

    async reject(id: number) {
        await this.entityManager.update(Booking, {
            id
        }, {
            status: '审批驳回'
        });
        return 'success'
    }

    async unbind(id: number) {
        await this.entityManager.update(Booking, {
            id
        }, {
            status: '已解除'
        });
        return 'success'
    }

    async urge(id: number) {
        const flag = await this.redisService.get('urge_' + id);

        if (flag) {
            return '半小时内只能催办一次，请耐心等待';
        }

        let email = await this.redisService.get('admin_email');

        if (!email) {
            const admin = await this.entityManager.findOne(User, {
                select: {
                    email: true
                },
                where: {
                    isAdmin: true
                }
            });

            email = admin.email

            this.redisService.set('admin_email', admin.email);
        }

        this.emailService.sendMail({
            to: email,
            subject: '预定申请催办提醒',
            html: `id 为 ${id} 的预定申请正在等待审批`
        });

        this.redisService.set('urge_' + id, 1, 60 * 30);
    }
}
