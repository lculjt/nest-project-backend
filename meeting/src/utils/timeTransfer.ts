import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Shanghai');

export const dateTransformer = {
    from: (value: Date) => {
        return dayjs.tz(value).format('YYYY-MM-DD HH:mm:ss');
    },
    to: (value: Date) => {
        return dayjs.tz(value).format('YYYY-MM-DD HH:mm:ss');
    },
};

