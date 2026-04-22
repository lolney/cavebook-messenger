import type { Meta, StoryObj } from '@storybook/react-vite'
import { cavebookAssets } from '../../assets'

function AssetGallery() {
  const entries = [
    ['Title plaque', cavebookAssets.plaqueTitle],
    ['Left plaque', cavebookAssets.plaqueLeft],
    ['Right plaque', cavebookAssets.plaqueRight],
    ['Parchment panel', cavebookAssets.panelParchment],
    ['Stone panel', cavebookAssets.panelStone],
    ['Portrait medallion', cavebookAssets.portraitMedallion],
    ['Soot tablet', cavebookAssets.tabletSootFeed],
    ['Link tablet', cavebookAssets.tabletLink],
    ['Workbench tablet', cavebookAssets.tabletWorkbench],
    ['Composer bar', cavebookAssets.composerBar],
    ['Status pill', cavebookAssets.statusPill],
    ['Status gem', cavebookAssets.statusGem],
  ] as const

  return (
    <div
      style={{
        padding: '32px',
        background: '#f3ead7',
        display: 'grid',
        gap: '18px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}
    >
      {entries.map(([label, src]) => (
        <figure
          key={label}
          style={{
            margin: 0,
            display: 'grid',
            gap: '10px',
            padding: '16px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.45)',
          }}
        >
          <img
            src={src}
            alt={label}
            style={{
              maxWidth: '100%',
              maxHeight: '220px',
              objectFit: 'contain',
              justifySelf: 'center',
            }}
          />
          <figcaption style={{ fontFamily: 'var(--cb-font-display)', fontSize: '1.1rem' }}>
            {label}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

const meta = {
  title: 'Messenger/Generated Assets',
  component: AssetGallery,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AssetGallery>

export default meta
type Story = StoryObj<typeof meta>

export const Gallery: Story = {}
