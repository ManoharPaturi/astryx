import {useState} from 'react';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';

const fruits = ['Apple', 'Banana', 'Mango', 'Peach', 'Strawberry'];
const ripenessLevels = ['Unripe', 'Nearly Ripe', 'Ripe', 'Overripe'];

type FruitSelection = {fruit: string; ripeness: string} | null;

function formatSelection(sel: FruitSelection): string {
  if (!sel) return '';
  return `${sel.fruit} - ${sel.ripeness}`;
}

export default function FruitPicker() {
  const [value, setValue] = useState<FruitSelection>(null);

  const options = fruits.flatMap((fruit) =>
    ripenessLevels.map((ripeness) => ({
      value: `${fruit}::${ripeness}`,
      label: `${fruit} - ${ripeness}`,
      section: fruit,
    }))
  );

  return (
    <ComplexSelector
      label="Fruit Picker"
      value={value ? `${value.fruit}::${value.ripeness}` : ''}
      onChange={(val: string) => {
        if (!val) {
          setValue(null);
          return;
        }
        const [fruit, ripeness] = val.split('::');
        setValue({fruit, ripeness});
      }}
      options={options}
      placeholder="Choose a fruit and ripeness"
    />
  );
}
