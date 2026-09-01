import {useState} from 'react';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import type {DateRange} from 'react-day-picker';

export default function HotelBookingDatePicker() {
  const [date, setDate] = useState<DateRange | undefined>();

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});

  return (
    <div className="flex flex-col gap-4 p-6 max-w-lg">
      <h2 className="text-2xl font-bold">Book Your Stay</h2>
      <div className="space-y-2">
        <Label>Travel Dates</Label>
        <p className="text-sm text-muted-foreground">Select your check-in and check-out dates</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              {date?.from ? (
                date.to ? (
                  `${formatDate(date.from)} - ${formatDate(date.to)}`
                ) : (
                  formatDate(date.from)
                )
              ) : (
                <span className="text-muted-foreground">Select dates</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              disabled={{before: new Date()}}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
