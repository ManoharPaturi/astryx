import React, {useState} from 'react';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

const icons = ['\u{1F4DD}', '\u{1F4DA}', '\u{1F680}', '\u{2B50}', '\u{1F3AF}', '\u{1F4A1}', '\u{1F525}', '\u{1F389}', '\u{1F30E}', '\u{1F4C8}', '\u{1F3B5}', '\u{2764}'];
const covers = ['https://picsum.photos/seed/c1/1200/300', 'https://picsum.photos/seed/c2/1200/300', 'https://picsum.photos/seed/c3/1200/300', 'https://picsum.photos/seed/c4/1200/300'];

export default function NotionPageHeader() {
  const [icon, setIcon] = useState('\u{1F4DD}');
  const [coverUrl, setCoverUrl] = useState('');
  const [title, setTitle] = useState('Untitled');

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-3">
      {coverUrl ? (
        <img src={coverUrl} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
      ) : (
        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
          Click "Add cover" to set a cover
        </div>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="text-6xl -mt-10 cursor-pointer" aria-label="Change icon">{icon}</button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="text-sm font-medium mb-2">Choose an icon</p>
          <div className="grid grid-cols-6 gap-1">
            {icons.map(e => (
              <button key={e} type="button" className="text-2xl p-2 rounded hover:bg-accent cursor-pointer" onClick={() => setIcon(e)} aria-label={`Select ${e}`}>{e}</button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <h1 className="text-4xl font-bold">{title}</h1>
      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled" className="text-lg border-none shadow-none focus-visible:ring-0 px-0" />

      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild><Button variant="ghost">Add cover</Button></PopoverTrigger>
          <PopoverContent>
            <div className="grid grid-cols-2 gap-2">
              {covers.map(url => (
                <button key={url} type="button" onClick={() => setCoverUrl(url)} aria-label="Select cover">
                  <img src={url} alt="" className="w-full h-16 object-cover rounded cursor-pointer" />
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {coverUrl && <Button variant="ghost" onClick={() => setCoverUrl('')}>Remove cover</Button>}
      </div>
    </div>
  );
}
