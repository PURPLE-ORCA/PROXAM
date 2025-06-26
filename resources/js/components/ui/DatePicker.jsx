// A NEW, SIMPLER DatePicker.jsx

import * as React from 'react';
import { format } from 'date-fns';
import { Icon } from '@iconify/react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

// This is now a self-contained component that just works.
export function DatePicker({ value, onSelect, placeholder = 'Pick a date', className }) {
    const [open, setOpen] = React.useState(false);

    // The value from the form is a 'YYYY-MM-DD' string. We need to parse it.
    // The 'T00:00:00' part is crucial to avoid timezone-off-by-one errors.
    const date = value ? new Date(value + 'T00:00:00') : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    <Icon icon="mdi:calendar" className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            {/* The onPointerDownOutside prop was the correct idea, let's keep it as our shield */}
            <PopoverContent className="w-auto p-0" align="start" onPointerDownOutside={(e) => e.preventDefault()}>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                        onSelect(selectedDate); // Pass the Date object up
                        setOpen(false);      // Close our own popover
                    }}
                    initialFocus
                    captionLayout="dropdown" // The style you wanted
                    fromYear={1960}
                    toYear={new Date().getFullYear() + 1}
                />
            </PopoverContent>
        </Popover>
    );
}
