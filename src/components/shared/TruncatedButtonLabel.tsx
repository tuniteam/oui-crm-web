import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
  /** Full button label. */
  label: string;
  className?: string;
};

/**
 * Common rule for button labels: when the label does not fit the available
 * button width (typically on mobile / narrow containers) it is truncated with
 * an ellipsis, and the full text is exposed in a tooltip on hover / long-press.
 *
 * Truncation is driven by real overflow detection, so a label that fits (e.g.
 * on desktop) is shown in full with no tooltip.
 *
 * The host `<Button>` must allow its content to shrink — add `min-w-0`.
 */
export function TruncatedButtonLabel({ label, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => setIsTruncated(el.scrollWidth > el.clientWidth);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [label]);

  const text = (
    <span ref={ref} className={cn('min-w-0 truncate', className)}>
      {label}
    </span>
  );

  if (!isTruncated) return text;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{text}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
