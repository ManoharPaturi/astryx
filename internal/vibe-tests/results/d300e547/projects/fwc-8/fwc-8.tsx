import {useState} from 'react';
import {DateRangeInput, type DateRange} from '@astryxdesign/core/DateRangeInput';
import {Heading} from '@astryxdesign/core/Heading';

export default function HotelBookingDatePicker() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const today = new Date().toISOString().split('T')[0] as `${number}-${number}-${number}`;

  return (
    <div className="flex flex-col gap-4 p-6 max-w-lg">
      <Heading level={2}>Book Your Stay</Heading>
      <DateRangeInput
        label="Travel Dates"
        description="Select your check-in and check-out dates"
        value={dateRange}
        onChange={setDateRange}
        min={today}
        placeholder="Select dates"
      />
    </div>
  );
}
