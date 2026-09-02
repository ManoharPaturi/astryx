import React, {useState} from 'react';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Heading} from '@astryxdesign/core/Heading';

const fruits = ['Apple', 'Banana', 'Mango', 'Peach', 'Strawberry'];
const ripenessLevels = ['Unripe', 'Nearly Ripe', 'Ripe', 'Overripe'];

interface Selection {
  fruit: string;
  ripeness: string;
}

export default function FruitPicker() {
  const [selection, setSelection] = useState<Selection>({fruit: 'Apple', ripeness: 'Ripe'});

  return (
    <div className="max-w-md">
      <ComplexSelector<Selection>
        label="Fruit and ripeness"
        value={selection}
        onChange={setSelection}
        triggerLabel={`${selection.fruit} — ${selection.ripeness}`}
      >
        {(value, onChange, close) => (
          <div className="flex flex-col gap-4 p-2">
            <div>
              <Heading level={6}>Fruit</Heading>
              <RadioList
                label="Fruit"
                isLabelHidden
                value={value.fruit}
                onChange={(fruit) => onChange({...value, fruit})}
                orientation="horizontal"
              >
                {fruits.map(f => (
                  <RadioListItem key={f} value={f} label={f} />
                ))}
              </RadioList>
            </div>
            <div>
              <Heading level={6}>Ripeness</Heading>
              <RadioList
                label="Ripeness"
                isLabelHidden
                value={value.ripeness}
                onChange={(ripeness) => {
                  onChange({...value, ripeness});
                  close();
                }}
              >
                {ripenessLevels.map(r => (
                  <RadioListItem key={r} value={r} label={r} />
                ))}
              </RadioList>
            </div>
          </div>
        )}
      </ComplexSelector>
    </div>
  );
}
