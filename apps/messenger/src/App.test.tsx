import { fireEvent, render, screen } from '@testing-library/react'
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
})
