import type { Meta, StoryObj } from '@storybook/react-vite'
import { Flame, Search, Shield } from 'lucide-react'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Signal the camp',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: (
      <>
        <Flame size={18} />
        Signal the camp
      </>
    ),
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: (
      <>
        <Shield size={18} />
        Open ward
      </>
    ),
  },
}

export const Utility: Story = {
  args: {
    variant: 'utility',
    children: (
      <>
        <Search size={18} />
        Search tablets
      </>
    ),
  },
}

export const AssetIcon: Story = {
  args: {
    size: 'icon',
    art: 'phone',
    'aria-label': 'Start a call',
  },
}
