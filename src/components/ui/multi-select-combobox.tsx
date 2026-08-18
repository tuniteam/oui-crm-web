import * as React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type MultiSelectOption = {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type MultiSelectComboboxProps = {
  options: MultiSelectOption[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  selectionLabel?: string;
  renderChip?: (option: MultiSelectOption) => React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  triggerClassName?: string;
  hideBadges?: boolean;
};

export function MultiSelectCombobox({
  options,
  selected,
  onSelectedChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  selectionLabel,
  renderChip,
  disabled = false,
  icon,
  triggerClassName,
  hideBadges = false,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onSelectedChange(selected.filter((v) => v !== value));
    } else {
      onSelectedChange([...selected, value]);
    }
  };

  const handleRemove = (value: string) => {
    onSelectedChange(selected.filter((v) => v !== value));
  };

  const selectedOptions = options.filter((o) => selected.includes(o.value));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'justify-between font-normal text-muted-foreground hover:text-muted-foreground',
              icon ? 'gap-2' : 'w-full',
              triggerClassName,
            )}
          >
            {icon}
            <span className="truncate">{placeholder}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const Icon = option.icon;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selected.includes(option.value)
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {Icon && (
                        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {!hideBadges && (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.length > 0 && selectionLabel && (
            <span className="text-xs text-muted-foreground w-full">
              {selectionLabel}
            </span>
          )}
          {selectedOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Badge
                key={option.value}
                variant="primary"
                appearance="light"
                size="lg"
                className="gap-1"
              >
                {renderChip ? (
                  renderChip(option)
                ) : (
                  <span className="flex items-center gap-1">
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {option.label}
                  </span>
                )}
                {!disabled && (
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-hidden hover:opacity-70"
                    onClick={() => handleRemove(option.value)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
