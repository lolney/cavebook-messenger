import type { Preview } from '@storybook/react-vite'
import '@cavebook/ui/styles.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'cave',
      values: [
        { name: 'cave', value: '#22150f' },
        { name: 'parchment', value: '#d2b38c' },
      ],
    },
  },
}

export default preview
