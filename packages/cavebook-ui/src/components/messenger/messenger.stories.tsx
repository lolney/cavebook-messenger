import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bell, Hand, Mic, Search, Send } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Surface } from '../ui/surface'
import { ConversationListItem } from './conversation-list-item'
import { InspectorSection } from './inspector-section'
import { MessageBubble } from './message-bubble'
import { MessengerComposer } from './messenger-composer'

function MessengerPreview() {
  return (
    <div style={{ width: 'min(1100px, 100%)', display: 'grid', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.7fr 0.85fr', gap: '24px' }}>
        <Surface variant="stone">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <ConversationListItem
              initials="TO"
              name="Ted Olney-Bell"
              preview="Make it a framework, not a postcard."
              meta="Active now"
              active
            />
            <ConversationListItem
              initials="SF"
              name="Sacred Fire Guild"
              preview="Deploy messenger by sundown."
              meta="12m"
              unread="3"
            />
          </div>
        </Surface>

        <Surface art="parchmentPanel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <p className="cb-section-kicker">Conversation</p>
              <h2 className="cb-heading">Ted Olney-Bell</h2>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button art="phone" size="icon" aria-label="Call">
                <Bell size={18} />
              </Button>
              <Button art="video" size="icon" aria-label="Video">
                <Search size={18} />
              </Button>
              <Button art="more" size="icon" aria-label="More actions" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
            <MessageBubble author="Ted Olney-Bell" ornament={<Hand size={16} />}>
              <p>What was the prompt you used for the one of me holding the fish?</p>
            </MessageBubble>
            <MessageBubble author="You" side="outgoing" ornament={<Bell size={16} />}>
              <p>I turned it into a proper design framework and a messenger frontend.</p>
            </MessageBubble>
          </div>
          <MessengerComposer
            illustrated
            leading={<Mic size={18} />}
            secondary={<Hand size={18} />}
            action={<Send size={18} />}
          />
        </Surface>

        <Surface art="stonePanel">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Badge>Encrypted by sacred fire</Badge>
            <InspectorSection label="Chat info" art="chatInfo" />
            <InspectorSection label="Customize chat" art="customizeChat" />
            <InspectorSection label="Media & files" art="mediaFiles" />
            <InspectorSection label="Privacy & support" art="privacySupport" />
          </div>
        </Surface>
      </div>
    </div>
  )
}

const meta = {
  title: 'Messenger/Shell',
  component: MessengerPreview,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MessengerPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
