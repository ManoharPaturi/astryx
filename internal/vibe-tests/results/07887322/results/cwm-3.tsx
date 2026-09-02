import React, {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Popover} from '@astryxdesign/core/Popover';
import {Grid} from '@astryxdesign/core/Grid';
import {TextInput} from '@astryxdesign/core/TextInput';

const icons = ['\u{1F4DD}', '\u{1F4DA}', '\u{1F680}', '\u{2B50}', '\u{1F3AF}', '\u{1F4A1}', '\u{1F525}', '\u{1F389}', '\u{1F30E}', '\u{1F4C8}', '\u{1F3B5}', '\u{2764}'];
const covers = [
  'https://picsum.photos/seed/cover1/1200/300',
  'https://picsum.photos/seed/cover2/1200/300',
  'https://picsum.photos/seed/cover3/1200/300',
  'https://picsum.photos/seed/cover4/1200/300',
];

export default function NotionPageHeader() {
  const [icon, setIcon] = useState('\u{1F4DD}');
  const [coverUrl, setCoverUrl] = useState('');
  const [title, setTitle] = useState('Untitled');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      {coverUrl ? (
        <img src={coverUrl} alt="Page cover" className="w-full h-48 object-cover rounded-lg" />
      ) : (
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <Text type="supporting">Click "Add cover" to set a cover image</Text>
        </div>
      )}

      <Popover
        isOpen={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        trigger={
          <button type="button" className="text-6xl -mt-10 cursor-pointer" aria-label="Change page icon">
            {icon}
          </button>
        }
        content={
          <div className="flex flex-col gap-2 p-2">
            <Text type="supporting">Choose an icon</Text>
            <div className="grid grid-cols-6 gap-1">
              {icons.map(emoji => (
                <button key={emoji} type="button" className="text-2xl p-2 rounded hover:bg-gray-100 cursor-pointer"
                  onClick={() => { setIcon(emoji); setIconPickerOpen(false); }} aria-label={`Select ${emoji}`}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <Heading level={1}>{title}</Heading>
      <TextInput label="Page title" isLabelHidden value={title} onChange={setTitle} placeholder="Untitled" />

      <div className="flex gap-2">
        <Popover
          trigger={<Button label="Add cover" variant="ghost" />}
          content={
            <div className="grid grid-cols-2 gap-2 p-2">
              {covers.map(url => (
                <button key={url} type="button" onClick={() => setCoverUrl(url)} aria-label="Select cover">
                  <img src={url} alt="" className="w-full h-16 object-cover rounded cursor-pointer" />
                </button>
              ))}
            </div>
          }
        />
        {coverUrl && <Button label="Remove cover" variant="ghost" onClick={() => setCoverUrl('')} />}
      </div>
    </div>
  );
}
