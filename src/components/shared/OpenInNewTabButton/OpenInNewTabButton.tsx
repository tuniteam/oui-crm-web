import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  href: string;
  tooltip: string;
  size?: number;
  className?: string;
};

export function OpenInNewTabButton({ href, tooltip, size = 14, className }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleClick}
          className={cn('text-muted-foreground hover:text-foreground', className)}
        >
          <ExternalLink size={size} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
