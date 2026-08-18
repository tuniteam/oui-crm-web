// src/components/layouts/layout-1/shared/details-page/DetailsField.tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { COMMON } from '@/constants/common';
import { CopyButton } from '@/components/shared/CopyButton';

type Props = {
  label: string;
  value: string;
  className?: string;
  copyable?: boolean;
  copyTooltipCopy?: string;
  copyTooltipCopied?: string;
  multiline?: boolean;
};

export function DetailsField({
  label,
  value,
  className,
  copyable = false,
  copyTooltipCopy = COMMON.ACTIONS.COPY,
  copyTooltipCopied = COMMON.ACTIONS.COPIED,
  multiline = false,
}: Props) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative mt-1">
        {multiline ? (
          <Textarea
            value={value}
            readOnly
            className="bg-muted/30 resize-none whitespace-pre-wrap"
            rows={4}
          />
        ) : (
          <Input
            value={value}
            readOnly
            className={copyable ? 'bg-muted/30 pr-10' : 'bg-muted/30'}
          />
        )}
        {copyable && value && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            <CopyButton
              text={value}
              tooltipCopy={copyTooltipCopy}
              tooltipCopied={copyTooltipCopied}
            />
          </div>
        )}
      </div>
    </div>
  );
}
