import { useEffect, useState } from 'react';

export const useCountdown = (date: Date): string | null => {
    const [timeString, setTimeString] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const secondsLeft = Math.max((date.getTime() - Date.now()) / 1000, 0);
            const _timeString = timeStringFromSeconds(Math.floor(secondsLeft));
            setTimeString(_timeString);
        }, 100);

        return () => {
            clearInterval(timer);
        };
    }, [date]);

    return timeString;
};

const timeStringFromSeconds = (seconds: number): string => {
    const oneDay = 60 * 60 * 24;
    const oneHour = 60 * 60;
    const oneMinute = 60;

    let secondsLeft = seconds;
    const days = Math.floor(secondsLeft / oneDay);
    secondsLeft -= days * oneDay;
    const hours = Math.floor(secondsLeft / oneHour);
    secondsLeft -= hours * oneHour;
    const minutes = Math.floor(secondsLeft / oneMinute);
    secondsLeft -= minutes * oneMinute;

    return `${paddedNum(days)}:${paddedNum(hours)}:${paddedNum(minutes)}:${paddedNum(secondsLeft)}`;
};

const paddedNum = (num: number): string => {
    if (num < 10) {
        return `0${num}`;
    } else {
        return `${num}`;
    }
};
