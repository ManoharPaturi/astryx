import React, {useState} from 'react';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';

const fruits = ['Apple', 'Banana', 'Mango', 'Peach', 'Strawberry'];
const ripenessLevels = ['Unripe', 'Nearly Ripe', 'Ripe', 'Overripe'];

export default function FruitPicker() {
  const [fruit, setFruit] = useState('Apple');
  const [ripeness, setRipeness] = useState('Ripe');
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-md">
      <Label>Fruit and ripeness</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between mt-1">
            {fruit} — {ripeness}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Fruit</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Fruit">
                {fruits.map(f => (
                  <button key={f} type="button" role="radio" aria-checked={f === fruit}
                    className={`px-3 py-1 rounded-md text-sm border transition-colors ${f === fruit ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                    onClick={() => setFruit(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Ripeness</p>
              <div className="flex flex-col gap-1" role="radiogroup" aria-label="Ripeness">
                {ripenessLevels.map(r => (
                  <button key={r} type="button" role="radio" aria-checked={r === ripeness}
                    className={`px-3 py-2 rounded-md text-sm text-left transition-colors ${r === ripeness ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    onClick={() => { setRipeness(r); setOpen(false); }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
