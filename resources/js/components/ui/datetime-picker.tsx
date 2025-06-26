import React, { useState, useEffect } from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

// Helper function to parse datetime-local format (YYYY-MM-DDTHH:mm)
const parseDateTimeLocal = (datetimeString: string) => {
  if (!datetimeString) return { date: undefined, time: "" }
  
  try {
    const [datePart, timePart] = datetimeString.split('T')
    const date = new Date(datePart + 'T00:00:00') // Create date without time to avoid timezone issues
    const time = timePart || ""
    
    return { date, time }
  } catch (e) {
    return { date: undefined, time: "" }
  }
}

// Helper function to format date and time back to datetime-local format
const formatToDateTimeLocal = (date: Date | undefined, time: string) => {
  if (!date) return ""
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const formattedDate = `${year}-${month}-${day}`
  
  // If no time provided, default to empty or current time
  const formattedTime = time || "10:30"
  
  return `${formattedDate}T${formattedTime}`
}

export function DateTimePicker({ value, onChange, label, required = false, error, className = "" }: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")

  // Initialize from the value prop
  useEffect(() => {
    const { date, time } = parseDateTimeLocal(value)
    setSelectedDate(date)
    setSelectedTime(time)
  }, [value])

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setOpen(false)
    
    // Update the parent component with the new datetime
    const newDateTime = formatToDateTimeLocal(date, selectedTime)
    onChange(newDateTime)
  }

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setSelectedTime(newTime)
    
    // Update the parent component with the new datetime
    const newDateTime = formatToDateTimeLocal(selectedDate, newTime)
    onChange(newDateTime)
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="flex flex-col gap-3 flex-1">
        <Label htmlFor="date-picker" className="px-1">
          {label || "Date"} {required && "*"}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-full justify-between font-normal"
            >
              {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
        {error && <p className="mt-1 text-sm text-[var(--destructive)]">{error}</p>}
      </div>
      
      <div className="flex flex-col gap-3 flex-1">
        <Label htmlFor="time-picker" className="px-1">
          Time {required && "*"}
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={selectedTime}
          onChange={handleTimeChange}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          required={required}
        />
      </div>
    </div>
  )
}
