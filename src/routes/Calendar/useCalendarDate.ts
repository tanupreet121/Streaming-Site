import { useCallback } from 'react';

const useCalendarDate = (profile: Profile) => {
    const toMonth = useCallback((calendarDate: CalendarDate | CalendarSelectableDate | null, format: 'short' | 'long'): string => {
        if (!calendarDate) return '';

        const date = new Date();
        date.setDate(1);
        date.setMonth(calendarDate.month - 1);

        return date.toLocaleString(profile.settings.interfaceLanguage, {
            month: format,
        });
    }, [profile.settings]);

    const toMonthYear = useCallback((calendarDate: CalendarDate | null): string => {
        if (!calendarDate) return '';

        const date = new Date();
        date.setDate(1);
        date.setMonth(calendarDate.month - 1);
        date.setFullYear(calendarDate.year);

        return date.toLocaleString(profile.settings.interfaceLanguage, {
            month: 'long',
            year: 'numeric',
        });
    }, [profile.settings]);

    const toDayMonth = useCallback((calendarDate: CalendarDate | null): string => {
        if (!calendarDate) return '';

        const date = new Date();
        date.setDate(calendarDate.day);
        date.setMonth(calendarDate.month - 1);

        return date.toLocaleString(profile.settings.interfaceLanguage, {
            day: 'numeric',
            month: 'short',
        });
    }, [profile.settings]);

    return {
        toMonth,
        toMonthYear,
        toDayMonth,
    };
};

export default useCalendarDate;
