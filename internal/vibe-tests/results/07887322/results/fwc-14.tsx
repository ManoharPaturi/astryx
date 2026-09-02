import React, {useState} from 'react';
import {Grid} from '@astryxdesign/core/Grid';
import {Lightbox} from '@astryxdesign/core/Lightbox';
import {Card} from '@astryxdesign/core/Card';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';

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
  {type: 'video', src: 'https://www.w3schools.com/html/movie.mp4', alt: 'Video clip', poster: 'https://picsum.photos/seed/v2/800/600'},
  {type: 'image', src: 'https://picsum.photos/seed/d/800/600', alt: 'Abstract'},
];

export default function MediaGallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const lightboxMedia = mediaItems.map(item => ({
    type: item.type as 'image' | 'video',
    src: item.src,
    alt: item.alt,
  }));

  return (
    <>
      <Grid columns={{minWidth: 200}} gap={2}>
        {mediaItems.map((item, i) => (
          <Card key={i}>
            <button
              type="button"
              className="w-full cursor-pointer overflow-hidden rounded-lg"
              onClick={() => { setActiveIndex(i); setLightboxOpen(true); }}
              aria-label={`View ${item.alt}`}
            >
              <AspectRatio ratio="16/9">
                {item.type === 'image' ? (
                  <img src={item.src} alt={item.alt} className="w-full h-full object-cover" />
                ) : (
                  <div className="relative">
                    <img src={item.poster} alt={item.alt} className="w-full h-full object-cover" />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl text-white pointer-events-none" aria-hidden="true">&#9654;</span>
                  </div>
                )}
              </AspectRatio>
            </button>
          </Card>
        ))}
      </Grid>
      <Lightbox
        isOpen={lightboxOpen}
        onOpenChange={setLightboxOpen}
        media={lightboxMedia}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        hasZoom
        hasAutoPlay
      />
    </>
  );
}
