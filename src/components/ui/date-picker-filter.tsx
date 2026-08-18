import { CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  formatDateStringToDate,
  formatDateToValue,
  formatToFrenchDate,
} from '@/shared/utils/date-utils';

type Props = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder: string;
};

export function DatePickerFilter({ value, onChange, placeholder }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-36 justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">
            {value
              ? formatToFrenchDate(formatDateStringToDate(value))
              : placeholder}
          </span>
          {value && (
            <X
              className="ml-1 h-3 w-3 shrink-0 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? formatDateStringToDate(value) : undefined}
          onSelect={(date) => onChange(date ? formatDateToValue(date) : undefined)}
        />
      </PopoverContent>
    </Popover>
  );
}
