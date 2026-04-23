import { fireEvent, render, screen, within } from '@testing-library/react'
import { act } from 'react'
import { afterEach, vi } from 'vitest'
import { App } from './App'

afterEach(() => {
  vi.useRealTimers()
})

describe('local messenger flow', () => {
  it('sends a message, persists it, and renders the local reply', async () => {
    vi.useFakeTimers()

    render(<App />)

    const messageField = screen.getByRole('textbox', { name: 'Message' })
    fireEvent.change(messageField, { target: { value: 'Bring the fish portrait back into the thread.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('Bring the fish portrait back into the thread.')).toBeInTheDocument()
    expect(screen.getByText('Scratching a reply…')).toBeInTheDocument()

    expect(window.localStorage.getItem('cavebook.messages')).toContain(
      'Bring the fish portrait back into the thread.',
    )

    act(() => {
      vi.advanceTimersByTime(900)
    })

    expect(
      screen.getByText('The cave-painting atmosphere is working, but the sidebar stone still needs more depth.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Active now')).toBeInTheDocument()
  })

  it('restores the persisted thread and resets back to the seeded messages', async () => {
    const storedMessages = [
      {
        id: 'question-fish-prompt',
        author: 'Ted Olney-Bell',
        side: 'incoming',
        body: 'What was the prompt you used for the one of me holding the fish?',
      },
      {
        id: 'answer-good-uis',
        author: 'You',
        side: 'outgoing',
        body: "It's very good at generating UIs.",
      },
      {
        id: 'saved-local-message',
        author: 'You',
        side: 'outgoing',
        body: 'Stored message from the previous fire.',
      },
    ]

    window.localStorage.setItem('cavebook.messages', JSON.stringify(storedMessages))

    render(<App />)

    expect(screen.getByText('Stored message from the previous fire.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset chat' }))

    expect(screen.queryByText('Stored message from the previous fire.')).not.toBeInTheDocument()
    expect(screen.getByText('What was the prompt you used for the one of me holding the fish?')).toBeInTheDocument()
    expect(screen.getByText("It's very good at generating UIs.")).toBeInTheDocument()
  })

  it('makes local-only controls stateful instead of dead', async () => {
    render(<App />)
    const primaryNav = screen.getByRole('navigation', { name: 'Primary' })

    fireEvent.click(screen.getByRole('button', { name: 'Mute' }))
    expect(screen.getByText('Ted is muted locally. Replies are paused.')).toBeInTheDocument()
    expect(screen.getByText(/Active now/)).toHaveTextContent('Active now · muted locally')
    expect(screen.getByRole('button', { name: 'Mute' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Chat info' }))
    expect(screen.getByText(/Messages stay in this browser/)).toBeInTheDocument()

    fireEvent.click(within(primaryNav).getByRole('button', { name: 'Profile' }))
    fireEvent.click(screen.getByRole('button', { name: 'Follow' }))
    expect(screen.getByText('93')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Following' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(within(primaryNav).getByRole('button', { name: 'Artifacts' }))
    fireEvent.click(screen.getByRole('button', { name: 'Browse' }))
    expect(screen.getByText('Browsing Camp Notes.')).toBeInTheDocument()
    expect(screen.queryByText('Profile Marks')).not.toBeInTheDocument()
  })

  it('suppresses Ted replies while muted', async () => {
    vi.useFakeTimers()

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Mute' }))

    const messageField = screen.getByRole('textbox', { name: 'Message' })
    fireEvent.change(messageField, { target: { value: 'Testing the quiet camp mode.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('Testing the quiet camp mode.')).toBeInTheDocument()
    expect(screen.getByText('Ted is muted locally. Replies are paused until you unmute him.')).toBeInTheDocument()
    expect(screen.queryByText('Scratching a reply…')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(900)
    })

    expect(screen.queryByText('I asked because the fish portrait is still the strongest one.')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('cavebook.messages')).toContain('Testing the quiet camp mode.')
  })

  it('opens and closes a local call tray from the toolbar', async () => {
    vi.useFakeTimers()

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Call' }))
    expect(screen.getByText('Voice ritual open')).toBeInTheDocument()
    expect(screen.getByText(/Local-only session with Ted/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Call' })).toHaveAttribute('aria-pressed', 'true')

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText(/02:00|00:02/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'End ritual' }))
    expect(screen.queryByText('Voice ritual open')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Call' })).toHaveAttribute('aria-pressed', 'false')
  })
})
