import { useCallback, useRef, useState } from 'react';
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { COMMON } from '@/constants';

const DATE_FORMAT_API = 'yyyy-MM-dd';

export function getDefaultMonthRange(defaultMonth?: Date): MonthRange {
  const initMonth = defaultMonth ?? subMonths(new Date(), 1);
  return {
    startDate: format(startOfMonth(initMonth), DATE_FORMAT_API),
    endDate: format(endOfMonth(initMonth), DATE_FORMAT_API),
  };
}

export type MonthRange = { startDate: string; endDate: string };

type Props = {
  /** Initial month to display. Defaults to previous month. */
  defaultMonth?: Date;
  /** Called on every change (prev/next/calendar pick). */
  onChange: (range: MonthRange) => void;
  /** Extra elements rendered after the navigator (filters, buttons). */
  extra?: React.ReactNode;
};

function formatRangeLabel(from: Date, to: Date): string {
  const sameMonth =
    from.getMonth() === to.getMonth() &&
    from.getFullYear() === to.getFullYear();
  if (sameMonth) {
    return `${format(from, 'd', { locale: fr })} – ${format(to, 'd MMM yyyy', { locale: fr })}`;
  }
  return `${format(from, 'd MMM', { locale: fr })} – ${format(to, 'd MMM yyyy', { locale: fr })}`;
}

function toApiRange(from: Date, to: Date): MonthRange {
  return {
    startDate: format(from, DATE_FORMAT_API),
    endDate: format(to, DATE_FORMAT_API),
  };
}

export function MonthNavigator({ defaultMonth, onChange, extra }: Props) {
  const initMonth = defaultMonth ?? subMonths(new Date(), 1);
  const [from, setFrom] = useState(() => startOfMonth(initMonth));
  const [to, setTo] = useState(() => endOfMonth(initMonth));

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>();
  const [rangeComplete, setRangeComplete] = useState(false);
  const selectCountRef = useRef(0);

  const applyRange = useCallback(
    (newFrom: Date, newTo: Date) => {
      setFrom(newFrom);
      setTo(newTo);
      onChange(toApiRange(newFrom, newTo));
    },
    [onChange],
  );

  const handlePrev = useCallback(() => {
    const prev = subMonths(from, 1);
    applyRange(startOfMonth(prev), endOfMonth(prev));
  }, [from, applyRange]);

  const handleNext = useCallback(() => {
    const next = addMonths(from, 1);
    applyRange(startOfMonth(next), endOfMonth(next));
  }, [from, applyRange]);

  const handleCalendarSelect = useCallback((range: DateRange | undefined) => {
    selectCountRef.current += 1;
    setCalendarRange(range);
    setRangeComplete(
      selectCountRef.current >= 2 && !!range?.from && !!range?.to,
    );
  }, []);

  const handleApply = useCallback(() => {
    if (calendarRange?.from && calendarRange?.to) {
      applyRange(calendarRange.from, calendarRange.to);
    }
    setCalendarOpen(false);
    setRangeComplete(false);
    setCalendarRange(undefined);
    selectCountRef.current = 0;
  }, [calendarRange, applyRange]);

  const handleCancel = useCallback(() => {
    setCalendarOpen(false);
    setRangeComplete(false);
    setCalendarRange(undefined);
    selectCountRef.current = 0;
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="icon" onClick={handlePrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover
        open={calendarOpen}
        onOpenChange={(open) => {
          if (open) {
            selectCountRef.current = 0;
            setCalendarRange({ from, to });
            setRangeComplete(false);
          }
          setCalendarOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-64 justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatRangeLabel(from, to)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={calendarRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            defaultMonth={from}
            showOutsideDays={false}
          />
          <div className="border-t px-3 py-2">
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-3.5 w-3.5" />
                {COMMON.ACTIONS.CANCEL}
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!rangeComplete}
              >
                <Check className="h-3.5 w-3.5" />
                {COMMON.ACTIONS.SAVE}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={handleNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>

      {extra}
    </div>
  );
}
