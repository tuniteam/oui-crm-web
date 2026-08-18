// components/ui/empty-state.tsx
import { ReactNode } from 'react';
import ReactSVG from 'react-inlinesvg';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export interface EmptyTableComponentProps {
  illustration?: string;
  illustrationSize?: string;

  title: string;
  description: string | string[];
  buttonIcon?: ReactNode;
  buttonText?: string;
  buttonId?: string;
  onClick?: () => void;
  tip?: {
    title?: string;
    content: string | string[];
  };

  children?: ReactNode;
  className?: string;
  tipCardClassName?: string;
  hasPermission?: boolean;
}

export default function EmptyTableComponent({
  illustration,
  illustrationSize = 'w-64 h-64',
  title,
  description,
  buttonIcon,
  buttonText,
  buttonId,
  children,
  tip,
  hasPermission = true,
  className = '',
  tipCardClassName = '',
  onClick,
}: EmptyTableComponentProps) {
  // Handle description as string or array
  const descriptionLines = Array.isArray(description)
    ? description
    : [description];

  // Handle tip content as string or array
  const tipLines =
    tip && Array.isArray(tip.content) ? tip.content : tip ? [tip.content] : [];

  return (
    <Card className={cn('min-h-full mb-4', className)}>
      <CardContent className="flex flex-col items-center justify-center gap-4 sm:gap-6">
        {/* Illustration */}
        {illustration && (
          <ReactSVG
            src={illustration}
            className={illustrationSize}
            loader={<Skeleton className={cn(illustrationSize, 'rounded-md')} />}
          />
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-center">{title}</h3>

        {/* Description - Better line handling */}
        {hasPermission && 
        <div className="flex flex-col items-center justify-center gap-1">
          {descriptionLines.map((line, index) => (
            <span
              key={index}
              className="text-sm text-muted-foreground text-center"
            >
              {line}
            </span>
          ))}
        </div>}

        {/* Action Button */}
        {hasPermission && buttonText && (
          <Button
            className="p-5"
            onClick={onClick}
            data-testid={buttonId ?? 'empty-Identifier-button'}
          >
            {buttonIcon}
            {buttonText}
          </Button>
        )}
        {/* Extra content */}
        {children}
        {/* Tip Section */}
        {tip && (
          <Card
            className={cn(
              'bg-gray-100 border-gray-300 w-full max-w-[600px] rounded-md',
              tipCardClassName,
            )}
          >
            <CardContent className="flex flex-col items-start justify-center gap-2 p-4">
              {tip.title && <span className="font-bold">{tip.title}</span>}
              <div className="flex flex-col gap-1">
                {tipLines.map((line, index) => (
                  <span key={index} className="text-sm text-muted-foreground">
                    {line}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
