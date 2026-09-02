import React, {useState} from 'react';
import {Grid} from '@astryxdesign/core/Grid';
import {Lightbox} from '@astryxdesign/core/Lightbox';
import {Card} from '@astryxdesign/core/Card';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import stylex from '@stylexjs/stylex';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  alt: string;
  poster?: string;
}

const mediaItems: MediaItem[] = [
  {type: 'image', src: 'https://picsum.photos/seed/a/800/600', alt: 'Landscape photo'},
  {type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', alt: 'Sample video', poster: 'https://picsum.photos/seed/v1/800/600'},
  {type: 'image', src: 'https://picsum.photos/seed/b/800/600', alt: 'Nature photo'},
  {type: 'image', src: 'https://picsum.photos/seed/c/800/600', alt: 'City photo'},
  {type: 'video', src: 'https://www.w3schools.com/html/movie.mp4', alt: 'Another video', poster: 'https://picsum.photos/seed/v2/800/600'},
  {type: 'image', src: 'https://picsum.photos/seed/d/800/600', alt: 'Abstract photo'},
];

const styles = stylex.create({
  thumbnail: {
    cursor: 'pointer',
    overflow: 'hidden',
    borderRadius: 8,
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  videoThumb: {
    position: 'relative',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 48,
    color: 'white',
    pointerEvents: 'none',
  },
});

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
              onClick={() => {
                setActiveIndex(i);
                setLightboxOpen(true);
              }}
              aria-label={`View ${item.alt}`}
              {...stylex.props(styles.thumbnail)}
            >
              <AspectRatio ratio="16/9">
                {item.type === 'image' ? (
                  <img src={item.src} alt={item.alt} {...stylex.props(styles.img)} />
                ) : (
                  <div {...stylex.props(styles.videoThumb)}>
                    <img
                      src={item.poster}
                      alt={item.alt}
                      {...stylex.props(styles.img)}
                    />
                    <span {...stylex.props(styles.playIcon)} aria-hidden="true">&#9654;</span>
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
