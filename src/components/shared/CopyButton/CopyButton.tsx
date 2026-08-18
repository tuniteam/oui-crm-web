import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
  text: string;
  tooltipCopy: string;
  tooltipCopied: string;
  size?: number;
  className?: string;
};

export function CopyButton({
  text,
  tooltipCopy,
  tooltipCopied,
  size = 14,
  className,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Tooltip open={copied || undefined}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'text-muted-foreground hover:text-foreground',
            className,
          )}
        >
          {copied ? <Check size={size} /> : <Copy size={size} />}
        </button>
      </TooltipTrigger>
      <TooltipContent>{copied ? tooltipCopied : tooltipCopy}</TooltipContent>
    </Tooltip>
  );
}
