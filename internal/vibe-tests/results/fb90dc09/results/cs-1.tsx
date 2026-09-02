import React, {useState} from 'react';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {VStack} from '@astryxdesign/core/VStack';
import {Text} from '@astryxdesign/core/Text';
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
    <ComplexSelector<Selection>
      label="Fruit and ripeness"
      value={selection}
      onChange={setSelection}
      triggerLabel={`${selection.fruit} — ${selection.ripeness}`}
    >
      {(value, onChange, close) => {
        const handleFruitChange = (fruit: string) => {
          onChange({...value, fruit});
        };
        const handleRipenessChange = (ripeness: string) => {
          const next = {...value, ripeness};
          onChange(next);
          close();
        };
        return (
          <VStack gap={3}>
            <div>
              <Heading level={6}>Fruit</Heading>
              <RadioList
                label="Fruit"
                isLabelHidden
                value={value.fruit}
                onChange={handleFruitChange}
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
                onChange={handleRipenessChange}
              >
                {ripenessLevels.map(r => (
                  <RadioListItem key={r} value={r} label={r} />
                ))}
              </RadioList>
            </div>
          </VStack>
        );
      }}
    </ComplexSelector>
  );
}
