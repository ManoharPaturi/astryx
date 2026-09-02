import React, {useState} from 'react';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  alt: string;
  poster?: string;
}

const mediaItems: MediaItem[] = [
  {type: 'image', src: 'https://picsum.photos/seed/a/800/600', alt: 'Landscape'},
  {type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', alt: 'Sample video', poster: 'https://picsum.photos/seed/v1/800/600'},
  {type: 'image', src: 'https://picsum.photos/seed/b/800/600', alt: 'Nature'},
  {type: 'image', src: 'https://picsum.photos/seed/c/800/600', alt: 'City'},
  {type: 'video', src: 'https://www.w3schools.com/html/movie.mp4', alt: 'Clip', poster: 'https://picsum.photos/seed/v2/800/600'},
  {type: 'image', src: 'https://picsum.photos/seed/d/800/600', alt: 'Abstract'},
];

export default function MediaGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const current = selectedIndex !== null ? mediaItems[selectedIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {mediaItems.map((item, i) => (
          <Card key={i} className="cursor-pointer overflow-hidden" onClick={() => setSelectedIndex(i)}>
            <CardContent className="p-0">
              <div className="aspect-video relative">
                <img src={item.type === 'video' ? item.poster : item.src} alt={item.alt} className="w-full h-full object-cover" />
                {item.type === 'video' && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-4xl" aria-hidden="true">&#9654;</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={(open) => { if (!open) setSelectedIndex(null); }}>
        <DialogContent className="max-w-4xl p-0 bg-black">
          {current && (
            <div className="relative">
              {current.type === 'image' ? (
                <img src={current.src} alt={current.alt} className="w-full h-auto" onDoubleClick={(e) => {
                  const img = e.currentTarget;
                  img.style.transform = img.style.transform === 'scale(2)' ? 'scale(1)' : 'scale(2)';
                }} />
              ) : (
                <video src={current.src} controls autoPlay className="w-full" />
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <Button variant="secondary" size="sm" disabled={selectedIndex === 0}
                  onClick={() => setSelectedIndex(i => i !== null ? i - 1 : 0)}>Prev</Button>
                <Button variant="secondary" size="sm" disabled={selectedIndex === mediaItems.length - 1}
                  onClick={() => setSelectedIndex(i => i !== null ? i + 1 : 0)}>Next</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
