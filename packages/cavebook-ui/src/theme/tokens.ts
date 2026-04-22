export const designPrinciples = [
  {
    name: 'Material honesty',
    description:
      'Panels should feel carved, brushed, stamped, or burnished into existence.',
  },
  {
    name: 'Warm hierarchy',
    description:
      'Heat and ochre signal emphasis, while stone and ash carry supporting structure.',
  },
  {
    name: 'Ceremonial rhythm',
    description:
      'Spacing should feel architectural, with large framing gestures around compact controls.',
  },
] as const

export const palette = [
  { name: 'Parchment', value: '#d2b38c', usage: 'Primary reading surface' },
  { name: 'Ochre', value: '#ab6e3a', usage: 'Selected states and motion cues' },
  { name: 'Ember', value: '#cd6331', usage: 'Primary actions and alerts' },
  { name: 'Stone', value: '#92806e', usage: 'Utility panels and rails' },
  { name: 'Clay', value: '#8f5d37', usage: 'Frames and secondary controls' },
  { name: 'Soot', value: '#261711', usage: 'Text and high-contrast accents' },
] as const

export const componentFamilies = [
  {
    name: 'Surfaces',
    description:
      'Foundational layers for parchment content planes and stone utility planes.',
    scale: 'Foundation',
    badgeVariant: 'stone',
  },
  {
    name: 'Controls',
    description:
      'Buttons, tiles, and fields share border weight, radii, and embossed highlights.',
    scale: 'Interactive',
    badgeVariant: 'ember',
  },
  {
    name: 'Messenger',
    description:
      'Conversation list items, chat bubbles, composer, and inspector patterns.',
    scale: 'Product',
    badgeVariant: 'default',
  },
] as const
