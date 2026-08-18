import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { WEEK_GRID } from '@/constants/weekGrid';
import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CalendarIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ListFilter,
  RotateCcw,
  X,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { UI } from '@/constants/ui';
import {
  CLOSED_DATE_LABELS,
  CLOSED_DATE_TYPE,
  type ClosedDate,
  type ClosedDateType,
} from '@/types/closedDate';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// --- Constants ---

export const DATE_FORMAT_API = 'yyyy-MM-dd';
const WEEK_OPTIONS = { weekStartsOn: 1 } as const;
const LOCALE_FR = { locale: fr };

// --- Helpers ---

export function getDefaultRange(): { from: Date; to: Date } {
  const today = new Date();
  return {
    from: startOfWeek(today, WEEK_OPTIONS),
    to: endOfWeek(today, WEEK_OPTIONS),
  };
}

function formatRangeLabel(from: Date, to: Date): string {
  const sameMonth =
    from.getMonth() === to.getMonth() &&
    from.getFullYear() === to.getFullYear();
  if (sameMonth) {
    return `${format(from, 'd', LOCALE_FR)} – ${format(to, 'd MMM yyyy', LOCALE_FR)}`;
  }
  return `${format(from, 'd MMM', LOCALE_FR)} – ${format(to, 'd MMM yyyy', LOCALE_FR)}`;
}

export function getDaysInRange(from: Date, to: Date): Date[] {
  const days: Date[] = [];
  const count = differenceInCalendarDays(to, from) + 1;
  for (let i = 0; i < count; i++) {
    days.push(addDays(from, i));
  }
  return days;
}

export function getClosedBg(type: ClosedDateType): string {
  if (type === CLOSED_DATE_TYPE.PUBLIC_HOLIDAY)
    return 'bg-muted dark:bg-white/10';
  if (type === CLOSED_DATE_TYPE.SCHOOL_VACATION)
    return 'bg-muted/60 dark:bg-white/5';
  return 'bg-muted/40 dark:bg-white/[0.03]';
}

export function getClosedTooltip(closure: ClosedDate): string {
  const typeLabel = CLOSED_DATE_LABELS[closure.type] ?? closure.type;
  return `${closure.label} · ${typeLabel}`;
}

// --- Closed cell component ---

export function ClosedCell({ closure }: { closure?: ClosedDate }) {
  const bg = closure ? getClosedBg(closure.type) : 'bg-muted/40';
  const tooltip = closure ? getClosedTooltip(closure) : '';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex items-center justify-center rounded-md h-14 cursor-default closed-hatching',
            bg,
          )}
        />
      </TooltipTrigger>
      {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
    </Tooltip>
  );
}

// --- Types ---

type ClosedDateSource = {
  closedDates?: ClosedDate[];
  id?: string;
};

type GridSection = {
  key: string;
  headerLabel: string;
  headerSublabel?: string;
  rows: GridRow[];
  closedDates?: ClosedDate[];
  sectionId?: string;
};

type GridRow = {
  key: string;
  label: string;
  sublabel?: string;
  renderCell: (date: Date, dateStr: string) => ReactNode;
};

type DateRangeApi = { startDate: string; endDate: string };

type FilterChip = { label: string; onRemove: () => void };

type WeekGridProps = {
  sections: GridSection[];
  isInitialLoading: boolean;
  isRefetching: boolean;
  isEmpty: boolean;
  emptyIcon?: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  columnLabel: string;
  toolbarExtra?: ReactNode;
  skeleton: ReactNode;
  allClosedDateSources?: ClosedDateSource[];
  onDateRangeChange?: (range: DateRangeApi) => void;
  initialRange?: { from: Date; to: Date };
  // Filtres façon « Enfants » (optionnel, non-breaking) : bouton « Filtres »
  // repliable + chips de filtres actifs.
  collapsibleFilters?: ReactNode;
  collapsibleFiltersCount?: number;
  onResetCollapsibleFilters?: () => void;
  activeFilterChips?: FilterChip[];
};

// --- Component ---

export function WeekGrid({
  sections,

  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  columnLabel,
  toolbarExtra,
  skeleton,
  allClosedDateSources = [],
  onDateRangeChange,
  isInitialLoading,
  isRefetching,
  initialRange,
  collapsibleFilters,
  collapsibleFiltersCount = 0,
  onResetCollapsibleFilters,
  activeFilterChips,
}: WeekGridProps) {
  const [dateRange, setDateRange] = useState(initialRange ?? getDefaultRange);
  const [showFilters, setShowFilters] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>(
    undefined,
  );
  const [rangeComplete, setRangeComplete] = useState(false);
  const [autoCloseProgress, setAutoCloseProgress] = useState(0);
  const selectCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Notify parent of date range changes
  useEffect(() => {
    onDateRangeChange?.({
      startDate: format(dateRange.from, DATE_FORMAT_API),
      endDate: format(dateRange.to, DATE_FORMAT_API),
    });
  }, [dateRange, onDateRangeChange]);

  const daysInRange = useMemo(
    () => getDaysInRange(dateRange.from, dateRange.to),
    [dateRange],
  );

  const rangeDuration =
    differenceInCalendarDays(dateRange.to, dateRange.from) + 1;

  // Collect closures for column headers (PUBLIC_HOLIDAY + SCHOOL_VACATION)
  const headerClosuresByDate = useMemo(() => {
    const map = new Map<string, ClosedDate>();
    for (const source of allClosedDateSources) {
      for (const cd of source.closedDates ?? []) {
        if (
          cd.type !== CLOSED_DATE_TYPE.PUBLIC_HOLIDAY &&
          cd.type !== CLOSED_DATE_TYPE.SCHOOL_VACATION
        )
          continue;
        const existing = map.get(cd.date);
        if (
          !existing ||
          (cd.type === CLOSED_DATE_TYPE.PUBLIC_HOLIDAY &&
            existing.type !== CLOSED_DATE_TYPE.PUBLIC_HOLIDAY)
        ) {
          map.set(cd.date, cd);
        }
      }
    }
    return map;
  }, [allClosedDateSources]);

  // --- Navigation ---

  const handlePrev = useCallback(() => {
    setDateRange((prev) => ({
      from: addDays(prev.from, -rangeDuration),
      to: addDays(prev.to, -rangeDuration),
    }));
  }, [rangeDuration]);

  const handleNext = useCallback(() => {
    setDateRange((prev) => ({
      from: addDays(prev.from, rangeDuration),
      to: addDays(prev.to, rangeDuration),
    }));
  }, [rangeDuration]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setDateRange({
      from: startOfWeek(today, WEEK_OPTIONS),
      to: endOfWeek(today, WEEK_OPTIONS),
    });
  }, []);

  // --- Calendar range picker ---

  const clearAutoCloseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setAutoCloseProgress(0);
  }, []);

  const applyRange = useCallback(() => {
    if (calendarRange?.from && calendarRange?.to) {
      setDateRange({ from: calendarRange.from, to: calendarRange.to });
    }
    clearAutoCloseTimer();
    setCalendarOpen(false);
    setRangeComplete(false);
    selectCountRef.current = 0;
  }, [calendarRange, clearAutoCloseTimer]);

  const startAutoCloseTimer = useCallback(() => {
    clearAutoCloseTimer();
    const totalMs = WEEK_GRID.AUTO_CLOSE_SECONDS * 1000;
    const intervalMs = 50;
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += intervalMs;
      setAutoCloseProgress(Math.min((elapsed / totalMs) * 100, 100));
      if (elapsed >= totalMs) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
      }
    }, intervalMs);
  }, [clearAutoCloseTimer]);

  useEffect(() => {
    if (autoCloseProgress >= 100 && rangeComplete) {
      applyRange();
    }
  }, [autoCloseProgress, rangeComplete, applyRange]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleCalendarSelect = useCallback(
    (range: DateRange | undefined) => {
      selectCountRef.current += 1;
      setCalendarRange(range);

      if (selectCountRef.current >= 2 && range?.from && range?.to) {
        setRangeComplete(true);
        startAutoCloseTimer();
      } else {
        setRangeComplete(false);
        clearAutoCloseTimer();
      }
    },
    [startAutoCloseTimer, clearAutoCloseTimer],
  );

  const handleCalendarCancel = useCallback(() => {
    clearAutoCloseTimer();
    setCalendarOpen(false);
    setRangeComplete(false);
    setCalendarRange(undefined);
    selectCountRef.current = 0;
  }, [clearAutoCloseTimer]);

  // --- Render ---

  if (isInitialLoading && isEmpty) {
    return <>{skeleton}</>;
  }

  return (
    <Card className="elevation-1">
      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            <CalendarIcon className="h-4 w-4" />
            {WEEK_GRID.TODAY_BUTTON}
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Popover
            open={calendarOpen}
            onOpenChange={(open) => {
              if (open) {
                selectCountRef.current = 0;
                setCalendarRange({ from: dateRange.from, to: dateRange.to });
                setRangeComplete(false);
                clearAutoCloseTimer();
              } else {
                clearAutoCloseTimer();
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
                {formatRangeLabel(dateRange.from, dateRange.to)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                max={90}
                selected={calendarRange}
                onSelect={handleCalendarSelect}
                numberOfMonths={2}
                defaultMonth={dateRange.from}
                showOutsideDays={false}
              />
              <div className="border-t px-3 py-2">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCalendarCancel}
                  >
                    <X className="h-3.5 w-3.5" />
                    {WEEK_GRID.CANCEL_BUTTON}
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyRange}
                    disabled={!rangeComplete}
                    className="relative overflow-hidden"
                  >
                    {rangeComplete && (
                      <span
                        className="absolute inset-0 bg-primary-foreground/20 origin-left"
                        style={{
                          transform: `scaleX(${autoCloseProgress / 100})`,
                        }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      {WEEK_GRID.APPLY_BUTTON}
                    </span>
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {activeFilterChips && activeFilterChips.length > 0 && (
            <>
              {activeFilterChips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 h-9 pl-2.5 pr-1.5 rounded-lg border border-primary/30 bg-primary/5 text-xs text-primary font-medium"
                >
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    className="ml-0.5 p-0.5 rounded hover:bg-primary/20 transition-colors"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              ))}
            </>
          )}

          {collapsibleFilters && (
            <>
              <div className="h-6 w-px bg-border mx-1" />
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters((v) => !v)}
                  className={cn(
                    'gap-1.5',
                    (collapsibleFiltersCount > 0 || showFilters) &&
                      'border-primary bg-primary/5 text-primary',
                  )}
                >
                  <ListFilter className="size-3.5" />
                  {UI.TABLE.FILTERS_BUTTON}
                  {showFilters ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                </Button>
                {!activeFilterChips && collapsibleFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-background">
                    {collapsibleFiltersCount}
                  </span>
                )}
              </div>
            </>
          )}

          {toolbarExtra}
        </div>

        {collapsibleFilters && showFilters && (
          <div className="flex flex-wrap items-center gap-2 px-5 pb-3">
            {collapsibleFilters}
            {onResetCollapsibleFilters && collapsibleFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={onResetCollapsibleFilters}
                className="text-muted-foreground gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                {UI.TABLE.RESET_FILTERS}
              </Button>
            )}
          </div>
        )}

        <div className="border-t" />

        {/* Grid */}
        <div className="px-5 py-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16">
              {emptyIcon}
              <h3 className="text-lg font-bold text-center">{emptyTitle}</h3>
              <p className="text-sm text-muted-foreground text-center">
                {emptyDescription}
              </p>
            </div>
          ) : (
            <div
              className={cn(
                'w-0 min-w-full overflow-x-auto',
                isRefetching && 'opacity-50',
              )}
            >
              <table
                className="w-full border-collapse table-fixed"
                style={{ minWidth: `${152 + daysInRange.length * 90}px` }}
              >
                <colgroup>
                  <col style={{ width: 152 }} />
                  {daysInRange.map((d) => (
                    <col key={d.toISOString()} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-1.5 text-left text-xs font-semibold text-muted-foreground">
                      {columnLabel}
                    </th>
                    {daysInRange.map((date) => {
                      const dateStr = format(date, DATE_FORMAT_API);
                      const headerClosure = headerClosuresByDate.get(dateStr);
                      const isHoliday =
                        headerClosure?.type === CLOSED_DATE_TYPE.PUBLIC_HOLIDAY;
                      const isVacation =
                        headerClosure?.type ===
                        CLOSED_DATE_TYPE.SCHOOL_VACATION;

                      return (
                        <th
                          key={date.toISOString()}
                          className={cn(
                            'px-1 py-1.5 text-center text-xs font-semibold',
                            isToday(date)
                              ? 'bg-brand-primary/10 text-brand-primary border-b-2 border-b-brand-primary'
                              : isHoliday
                                ? 'bg-muted dark:bg-white/10 text-muted-foreground'
                                : isVacation
                                  ? 'bg-muted/60 dark:bg-white/5 text-muted-foreground'
                                  : 'text-muted-foreground',
                          )}
                        >
                          <div>{format(date, 'EEE', LOCALE_FR)}</div>
                          <div className="font-bold">
                            {format(date, 'dd/MM', LOCALE_FR)}
                          </div>
                          <div
                            className={cn(
                              'text-[9px] font-normal truncate max-w-20 mx-auto h-3',
                              headerClosure
                                ? isHoliday
                                  ? 'opacity-70'
                                  : 'opacity-50'
                                : 'invisible',
                            )}
                          >
                            {headerClosure?.label ?? '\u00A0'}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => (
                    <Fragment key={section.key}>
                      {/* Section header */}
                      <tr
                        key={`header-${section.key}`}
                        className="bg-brand-primary/5"
                      >
                        <td
                          colSpan={daysInRange.length + 1}
                          className="px-2 pt-1.5 pb-2.5 border-l-3 border-l-brand-primary"
                        >
                          <div className="font-semibold text-sm text-brand-primary">
                            {section.headerLabel}
                          </div>
                          {section.headerSublabel && (
                            <div className="text-[10px] text-muted-foreground">
                              {section.headerSublabel}
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Rows */}
                      {section.rows.map((row) => (
                        <tr key={row.key} className="border-b last:border-b-0">
                          <td className="px-2 py-1 text-xs">
                            <div className="font-medium">{row.label}</div>
                            {row.sublabel && (
                              <div className="text-[10px] text-muted-foreground">
                                {row.sublabel}
                              </div>
                            )}
                          </td>
                          {daysInRange.map((date) => {
                            const dateStr = format(date, DATE_FORMAT_API);
                            return (
                              <td
                                key={dateStr}
                                className={cn(
                                  'px-1 py-1 text-center select-none',
                                  isToday(date) && 'bg-brand-primary/5',
                                )}
                              >
                                {row.renderCell(date, dateStr)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
