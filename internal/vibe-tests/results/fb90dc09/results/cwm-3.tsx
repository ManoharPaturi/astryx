import React, {useState} from 'react';
import {VStack} from '@astryxdesign/core/VStack';
import {Stack} from '@astryxdesign/core/Stack';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Popover} from '@astryxdesign/core/Popover';
import {Grid} from '@astryxdesign/core/Grid';
import {TextInput} from '@astryxdesign/core/TextInput';
import stylex from '@stylexjs/stylex';

const icons = ['\u{1F4DD}', '\u{1F4DA}', '\u{1F680}', '\u{2B50}', '\u{1F3AF}', '\u{1F4A1}', '\u{1F525}', '\u{1F389}', '\u{1F30E}', '\u{1F4C8}', '\u{1F3B5}', '\u{2764}'];
const covers = [
  'https://picsum.photos/seed/cover1/1200/300',
  'https://picsum.photos/seed/cover2/1200/300',
  'https://picsum.photos/seed/cover3/1200/300',
  'https://picsum.photos/seed/cover4/1200/300',
];

const styles = stylex.create({
  cover: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIcon: {
    fontSize: 64,
    cursor: 'pointer',
    marginTop: -40,
  },
  iconGrid: {
    fontSize: 28,
    cursor: 'pointer',
    padding: 8,
    borderRadius: 4,
  },
  title: {
    width: '100%',
  },
  coverOption: {
    width: '100%',
    height: 60,
    objectFit: 'cover',
    borderRadius: 4,
    cursor: 'pointer',
  },
});

export default function NotionPageHeader() {
  const [icon, setIcon] = useState('\u{1F4DD}');
  const [coverUrl, setCoverUrl] = useState('');
  const [title, setTitle] = useState('Untitled');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  return (
    <VStack gap={2}>
      {coverUrl ? (
        <img src={coverUrl} alt="Page cover" {...stylex.props(styles.cover)} />
      ) : (
        <div {...stylex.props(styles.coverPlaceholder)}>
          <Text type="supporting">Click "Add cover" to set a cover image</Text>
        </div>
      )}

      <Stack gap={2}>
        <Popover
          isOpen={iconPickerOpen}
          onOpenChange={setIconPickerOpen}
          trigger={
            <button
              type="button"
              aria-label="Change page icon"
              {...stylex.props(styles.pageIcon)}
            >
              {icon}
            </button>
          }
          content={
            <VStack gap={2}>
              <Text type="supporting">Choose an icon</Text>
              <Grid columns={6} gap={1}>
                {icons.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setIcon(emoji);
                      setIconPickerOpen(false);
                    }}
                    aria-label={`Select icon ${emoji}`}
                    {...stylex.props(styles.iconGrid)}
                  >
                    {emoji}
                  </button>
                ))}
              </Grid>
            </VStack>
          }
        />
      </Stack>

      <Heading level={1}>{title}</Heading>
      <TextInput
        label="Page title"
        isLabelHidden
        value={title}
        onChange={setTitle}
        placeholder="Untitled"
      />

      <Stack gap={2}>
        <Popover
          trigger={<Button label="Add cover" variant="ghost" />}
          content={
            <VStack gap={2}>
              <Text type="supporting">Choose a cover</Text>
              <Grid columns={2} gap={1}>
                {covers.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setCoverUrl(url)}
                    aria-label="Select cover image"
                  >
                    <img src={url} alt="" {...stylex.props(styles.coverOption)} />
                  </button>
                ))}
              </Grid>
            </VStack>
          }
        />
        {coverUrl && (
          <Button label="Remove cover" variant="ghost" onClick={() => setCoverUrl('')} />
        )}
      </Stack>
    </VStack>
  );
}
