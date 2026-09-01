import {useState} from 'react';

const fruits = ['Apple', 'Banana', 'Mango', 'Peach', 'Strawberry'];
const ripenessLevels = ['Unripe', 'Nearly Ripe', 'Ripe', 'Overripe'];

export default function FruitPicker() {
  const [value, setValue] = useState('');

  return (
    <div style={{maxWidth: 400, padding: 24}}>
      <label htmlFor="fruit-picker" style={{display: 'block', fontWeight: 600, marginBottom: 8}}>
        Fruit Picker
      </label>
      <select
        id="fruit-picker"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14}}
      >
        <option value="">Choose a fruit and ripeness</option>
        {fruits.map((fruit) => (
          <optgroup key={fruit} label={fruit}>
            {ripenessLevels.map((ripeness) => (
              <option key={`${fruit}::${ripeness}`} value={`${fruit}::${ripeness}`}>
                {fruit} - {ripeness}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
