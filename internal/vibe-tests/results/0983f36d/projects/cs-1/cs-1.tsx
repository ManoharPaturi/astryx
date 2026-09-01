import {useState} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Label} from '@/components/ui/label';

const fruits = ['Apple', 'Banana', 'Mango', 'Peach', 'Strawberry'];
const ripenessLevels = ['Unripe', 'Nearly Ripe', 'Ripe', 'Overripe'];

export default function FruitPicker() {
  const [value, setValue] = useState('');

  return (
    <div className="max-w-md p-6 space-y-2">
      <Label htmlFor="fruit-picker">Fruit Picker</Label>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id="fruit-picker">
          <SelectValue placeholder="Choose a fruit and ripeness" />
        </SelectTrigger>
        <SelectContent>
          {fruits.map((fruit) => (
            <div key={fruit}>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">{fruit}</div>
              {ripenessLevels.map((ripeness) => (
                <SelectItem key={`${fruit}::${ripeness}`} value={`${fruit}::${ripeness}`}>
                  {fruit} - {ripeness}
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
