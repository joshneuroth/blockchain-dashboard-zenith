
import React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CloudMethodSelectorProps {
  methods: string[];
  selectedMethod: string | null;
  onSelectMethod: (method: string) => void;
  className?: string;
}

const CloudMethodSelector: React.FC<CloudMethodSelectorProps> = ({
  methods,
  selectedMethod,
  onSelectMethod,
  className
}) => {
  const [open, setOpen] = React.useState(false);

  if (!methods.length) {
    return null;
  }

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <div className="text-sm text-gray-500 dark:text-gray-400">Method:</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[180px] justify-between"
          >
            {selectedMethod || "Select method..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-0">
          <Command>
            <CommandInput placeholder="Search method..." />
            <CommandEmpty>No method found.</CommandEmpty>
            <CommandGroup>
              {methods.map((method) => (
                <CommandItem
                  key={method}
                  value={method}
                  onSelect={(currentValue) => {
                    onSelectMethod(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedMethod === method ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {method}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CloudMethodSelector;
