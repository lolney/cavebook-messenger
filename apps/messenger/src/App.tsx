import { useEffect, useRef, useState } from 'react'
import {
  Flame,
  Hand,
  Lock,
  Mic,
  MoreHorizontal,
  Phone,
  Search,
  Send,
  User,
  Video,
  ScrollText,
  Mountain,
  Star,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  InspectorSection,
  MessageBubble,
  MessengerComposer,
  Surface,
} from '@cavebook/ui'
import './app.css'

type PageId = 'messages' | 'profile' | 'artifacts'
type InspectorSectionId = 'chatInfo' | 'customizeChat' | 'mediaFiles' | 'privacySupport'
type NoticeTone = 'neutral' | 'active'

type ChatMessage = {
  id: string
  author: 'Ted Olney-Bell' | 'You'
  side: 'incoming' | 'outgoing'
  body: string
}

type AppNotice = {
  text: string
  tone: NoticeTone
}

const MESSAGE_STORAGE_KEY = 'cavebook.messages'
const PREFERENCES_STORAGE_KEY = 'cavebook.preferences'

const initialMessages: ChatMessage[] = [
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
]

const replyFragments = [
  'I asked because the fish portrait is still the strongest one.',
  'The cave-painting atmosphere is working, but the sidebar stone still needs more depth.',
  'Try keeping the tablet stack tighter so it feels pinned instead of pasted on.',
  'That tracks. The hand-carved framing is doing more of the work now.',
] as const

const pageTabs = [
  { id: 'messages' as const, label: 'Messages', icon: ScrollText },
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'artifacts' as const, label: 'Artifacts', icon: Mountain },
] as const

const inspectorSections = [
  { id: 'chatInfo' as const, label: 'Chat info', art: 'chatInfo' as const },
  { id: 'customizeChat' as const, label: 'Customize chat', art: 'customizeChat' as const },
  { id: 'mediaFiles' as const, label: 'Media & files', art: 'mediaFiles' as const },
  { id: 'privacySupport' as const, label: 'Privacy & support', art: 'privacySupport' as const },
] as const

const artifacts = [
  {
    title: "It's very good at generating UIs",
    body: 'Pinned soot tablet with a carved timeline, hand-fed replies, and ritual search rail.',
    art: 'sootTablet' as const,
    className: 'artifact-card artifact-card--wide',
  },
  {
    title: 'Here was the chat',
    body: 'https://chatgpt.com/share/69e86442-93b8-83e8-9cb8-22ff2254e76d',
    art: 'linkTablet' as const,
    className: 'artifact-card artifact-card--link',
  },
  {
    title: "Here's Codex in 1995",
    body: 'Stone workbench for projects, folders, patch previews, and camp-console output.',
    art: 'workbenchTablet' as const,
    className: 'artifact-card artifact-card--workbench',
  },
] as const

const memoryCards = [
  {
    title: 'Hunt sketch',
    body: 'Three mammoths, one canoe, and a suspiciously modern search ranking algorithm.',
  },
  {
    title: 'Pinned note',
    body: 'Still insists the fish portrait was for “research” and not profile optimization.',
  },
  {
    title: 'Guild role',
    body: 'Lead cave-interface wrangler for Sacred Fire Systems and elder of rough edges.',
  },
] as const

const collectionCards = [
  {
    title: 'Camp Notes',
    kicker: '22 tablets',
    body: 'Drafted interfaces, link tablets, and smoke-dark conversation captures.',
  },
  {
    title: 'Profile Marks',
    kicker: '7 carvings',
    body: 'Portrait studies, tribe badges, and messenger handle experiments.',
  },
  {
    title: 'Ritual Logs',
    kicker: '14 embers',
    body: 'Build output, patch rituals, and benchmark scratches kept beside the fire.',
  },
] as const

const inspectorDetails: Record<InspectorSectionId, string> = {
  chatInfo: 'Local-only thread with Ted. Messages stay in this browser and can be reset from the more button.',
  customizeChat:
    'The visual shell, reply loop, and tablet stack are active here. This build has no remote theme sync.',
  mediaFiles: 'Current shelf includes the soot feed tablet, the shared-chat tablet, and the Codex workbench tablet.',
  privacySupport: 'No server sync, no remote account state, and no network-backed actions. This app runs entirely locally.',
}

function defaultPreferences() {
  return {
    isMuted: false,
    isFollowing: false,
    callMode: null as 'voice' | 'video' | null,
    openInspectorSection: null as InspectorSectionId | null,
    artifactFilter: 'all' as 'all' | 'notes' | 'marks' | 'logs',
  }
}

function pageFromHash(hash: string): PageId {
  const normalized = hash.replace(/^#/, '')
  return normalized === 'profile' || normalized === 'artifacts' ? normalized : 'messages'
}

function loadMessages(): ChatMessage[] {
  if (typeof window === 'undefined') {
    return initialMessages
  }

  try {
    const storedMessages = window.localStorage.getItem(MESSAGE_STORAGE_KEY)
    if (!storedMessages) {
      return initialMessages
    }

    const parsedMessages: unknown = JSON.parse(storedMessages)
    if (!Array.isArray(parsedMessages)) {
      return initialMessages
    }

    const validMessages = parsedMessages.filter((message): message is ChatMessage => {
      if (!message || typeof message !== 'object') {
        return false
      }

      const candidate = message as Partial<ChatMessage>
      return (
        typeof candidate.id === 'string' &&
        (candidate.author === 'Ted Olney-Bell' || candidate.author === 'You') &&
        (candidate.side === 'incoming' || candidate.side === 'outgoing') &&
        typeof candidate.body === 'string'
      )
    })

    return validMessages.length ? validMessages : initialMessages
  } catch {
    return initialMessages
  }
}

function persistMessages(messages: ChatMessage[]) {
  try {
    window.localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // Storage can be unavailable in restricted browser contexts; the chat still works in memory.
  }
}

function loadPreferences() {
  if (typeof window === 'undefined') {
    return defaultPreferences()
  }

  try {
    const storedPreferences = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (!storedPreferences) {
      return defaultPreferences()
    }

    const parsedPreferences: unknown = JSON.parse(storedPreferences)
    if (!parsedPreferences || typeof parsedPreferences !== 'object') {
      return defaultPreferences()
    }

    const candidate = parsedPreferences as Partial<ReturnType<typeof defaultPreferences>>
    return {
      isMuted: candidate.isMuted === true,
      isFollowing: candidate.isFollowing === true,
      callMode: candidate.callMode === 'voice' || candidate.callMode === 'video' ? candidate.callMode : null,
      openInspectorSection:
        candidate.openInspectorSection === 'chatInfo' ||
        candidate.openInspectorSection === 'customizeChat' ||
        candidate.openInspectorSection === 'mediaFiles' ||
        candidate.openInspectorSection === 'privacySupport'
          ? candidate.openInspectorSection
          : null,
      artifactFilter:
        candidate.artifactFilter === 'notes' ||
        candidate.artifactFilter === 'marks' ||
        candidate.artifactFilter === 'logs'
          ? candidate.artifactFilter
          : 'all',
    }
  } catch {
    return defaultPreferences()
  }
}

function persistPreferences(preferences: ReturnType<typeof defaultPreferences>) {
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Preferences stay in memory when storage is unavailable.
  }
}

export function App() {
  const [preferences, setPreferences] = useState(loadPreferences)
  const [page, setPage] = useState<PageId>(() =>
    typeof window === 'undefined' ? 'messages' : pageFromHash(window.location.hash),
  )
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages)
  const [pendingReply, setPendingReply] = useState(false)
  const [notice, setNotice] = useState<AppNotice | null>(null)
  const replyTimeoutRef = useRef<number | null>(null)
  const noticeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const syncPageFromLocation = () => {
      setPage(pageFromHash(window.location.hash))
    }

    window.addEventListener('hashchange', syncPageFromLocation)
    window.addEventListener('popstate', syncPageFromLocation)
    return () => {
      window.removeEventListener('hashchange', syncPageFromLocation)
      window.removeEventListener('popstate', syncPageFromLocation)
    }
  }, [])

  useEffect(() => {
    const nextHash = page === 'messages' ? '' : `#${page}`
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

    if (currentUrl !== nextUrl) {
      window.history.pushState(null, '', nextUrl)
    }
  }, [page])

  useEffect(() => {
    persistMessages(messages)
  }, [messages])

  useEffect(() => {
    persistPreferences(preferences)
  }, [preferences])

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current !== null) {
        window.clearTimeout(replyTimeoutRef.current)
      }
      if (noticeTimeoutRef.current !== null) {
        window.clearTimeout(noticeTimeoutRef.current)
      }
    }
  }, [])

  const showNotice = (text: string, tone: NoticeTone = 'neutral') => {
    setNotice({ text, tone })

    if (noticeTimeoutRef.current !== null) {
      window.clearTimeout(noticeTimeoutRef.current)
    }

    noticeTimeoutRef.current = window.setTimeout(() => {
      setNotice(null)
      noticeTimeoutRef.current = null
    }, 2400)
  }

  const handleSendMessage = (body: string) => {
    setMessages((currentMessages) => {
      const nextMessages = [
        ...currentMessages,
        {
          id: `local-${Date.now()}-${currentMessages.length}`,
          author: 'You',
          side: 'outgoing',
          body,
        } satisfies ChatMessage,
      ]

      const replyIndex =
        nextMessages.filter((message) => message.author === 'Ted Olney-Bell').length % replyFragments.length

      if (preferences.isMuted) {
        setPendingReply(false)
        showNotice('Ted is muted locally. Replies are paused until you unmute him.')
        return nextMessages
      }

      if (replyTimeoutRef.current !== null) {
        window.clearTimeout(replyTimeoutRef.current)
      }

      setPendingReply(true)
      replyTimeoutRef.current = window.setTimeout(() => {
        setMessages((latestMessages) => [
          ...latestMessages,
          {
            id: `ted-${Date.now()}-${latestMessages.length}`,
            author: 'Ted Olney-Bell',
            side: 'incoming',
            body: replyFragments[replyIndex],
          },
        ])
        setPendingReply(false)
        replyTimeoutRef.current = null
      }, 900)

      return nextMessages
    })
  }

  const handleResetMessages = () => {
    if (replyTimeoutRef.current !== null) {
      window.clearTimeout(replyTimeoutRef.current)
      replyTimeoutRef.current = null
    }
    setPendingReply(false)
    setMessages(initialMessages)
    showNotice('Thread reset to the seeded camp exchange.')
  }

  const handleStartCall = (mode: 'voice' | 'video') => {
    const isClosing = preferences.callMode === mode

    setPreferences((current) => ({
      ...current,
      callMode: isClosing ? null : mode,
    }))

    showNotice(
      isClosing
        ? mode === 'voice'
          ? 'Voice ritual ended.'
          : 'Vision fire ended.'
        : mode === 'voice'
          ? 'Voice ritual started locally. No remote call is placed.'
          : 'Vision fire started locally. No remote video session is placed.',
      'active',
    )
  }

  const handleToggleMute = () => {
    const nextMuted = !preferences.isMuted

    if (nextMuted && replyTimeoutRef.current !== null) {
      window.clearTimeout(replyTimeoutRef.current)
      replyTimeoutRef.current = null
      setPendingReply(false)
    }

    setPreferences((current) => ({ ...current, isMuted: nextMuted }))
    showNotice(
      nextMuted ? 'Ted is muted locally. Replies are paused.' : 'Ted is unmuted locally. Replies will resume.',
    )
  }

  const handleToggleFollow = () => {
    const nextFollowing = !preferences.isFollowing
    setPreferences((current) => ({ ...current, isFollowing: nextFollowing }))
    showNotice(nextFollowing ? 'You are now following Ted.' : 'You stopped following Ted.')
  }

  const handleToggleInspectorSection = (sectionId: InspectorSectionId) => {
    setPreferences((current) => ({
      ...current,
      openInspectorSection: current.openInspectorSection === sectionId ? null : sectionId,
    }))
  }

  const handleBrowseArtifacts = () => {
    const nextFilter =
      preferences.artifactFilter === 'all'
        ? 'notes'
        : preferences.artifactFilter === 'notes'
          ? 'marks'
          : preferences.artifactFilter === 'marks'
            ? 'logs'
            : 'all'

    setPreferences((current) => ({
      ...current,
      artifactFilter: nextFilter,
    }))

    showNotice(
      nextFilter === 'all'
        ? 'Showing the full archive shelf.'
        : `Browsing ${nextFilter === 'notes' ? 'Camp Notes' : nextFilter === 'marks' ? 'Profile Marks' : 'Ritual Logs'}.`,
    )
  }

  return (
    <div className="cb-page">
      <div className="cb-ambient cb-ambient--left" />
      <div className="cb-ambient cb-ambient--right" />

      <div className="messenger-shell cb-frame">
        {notice ? (
          <div className={`messenger-notice messenger-notice--${notice.tone}`} aria-live="polite" role="status">
            {notice.text}
          </div>
        ) : null}
        <div className="messenger-shell__post messenger-shell__post--left" aria-hidden="true" />
        <div className="messenger-shell__post messenger-shell__post--right" aria-hidden="true" />
        <div className="messenger-shell__rope messenger-shell__rope--left" aria-hidden="true" />
        <div className="messenger-shell__rope messenger-shell__rope--right" aria-hidden="true" />
        <div className="messenger-shell__corner messenger-shell__corner--tl" aria-hidden="true" />
        <div className="messenger-shell__corner messenger-shell__corner--tr" aria-hidden="true" />
        <div className="messenger-shell__corner messenger-shell__corner--bl" aria-hidden="true" />
        <div className="messenger-shell__corner messenger-shell__corner--br" aria-hidden="true" />

        <header className="messenger-topbar">
          <div
            className="messenger-topbar__plaque messenger-topbar__plaque--glyphs messenger-topbar__plaque--left cb-asset cb-asset--plaque-left"
            aria-hidden="true"
          />
          <div
            className="messenger-topbar__plaque messenger-topbar__plaque--title cb-asset cb-asset--plaque-title"
            aria-label="Facebook Messenger for Macintosh, 20,000 BCE"
          />
          <div
            className="messenger-topbar__plaque messenger-topbar__plaque--glyphs messenger-topbar__plaque--right cb-asset cb-asset--plaque-right"
            aria-hidden="true"
          />
        </header>

        <nav className="messenger-nav" aria-label="Primary">
          {pageTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`messenger-nav__tab ${page === tab.id ? 'is-active' : ''}`}
                type="button"
                onClick={() => setPage(tab.id)}
                aria-current={page === tab.id ? 'page' : undefined}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {page === 'messages' ? (
          <MessagesPage
            callMode={preferences.callMode}
            isMuted={preferences.isMuted}
            messages={messages}
            openInspectorSection={preferences.openInspectorSection}
            pendingReply={pendingReply}
            onSendMessage={handleSendMessage}
            onResetMessages={handleResetMessages}
            onNavigate={setPage}
            onStartCall={handleStartCall}
            onToggleInspectorSection={handleToggleInspectorSection}
            onToggleMute={handleToggleMute}
          />
        ) : null}
        {page === 'profile' ? (
          <ProfilePage
            isFollowing={preferences.isFollowing}
            onNavigate={setPage}
            onToggleFollow={handleToggleFollow}
          />
        ) : null}
        {page === 'artifacts' ? (
          <ArtifactsPage
            artifactFilter={preferences.artifactFilter}
            onBrowseArtifacts={handleBrowseArtifacts}
            onNavigate={setPage}
          />
        ) : null}
      </div>
    </div>
  )
}

function MessagesPage({
  callMode,
  isMuted,
  messages,
  openInspectorSection,
  pendingReply,
  onNavigate,
  onResetMessages,
  onSendMessage,
  onStartCall,
  onToggleInspectorSection,
  onToggleMute,
}: {
  callMode: 'voice' | 'video' | null
  isMuted: boolean
  messages: ChatMessage[]
  openInspectorSection: InspectorSectionId | null
  pendingReply: boolean
  onNavigate: (page: PageId) => void
  onResetMessages: () => void
  onSendMessage: (body: string) => void
  onStartCall: (mode: 'voice' | 'video') => void
  onToggleInspectorSection: (sectionId: InspectorSectionId) => void
  onToggleMute: () => void
}) {
  const [draft, setDraft] = useState('')
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const threadElement = threadRef.current
    if (!threadElement) {
      return
    }

    threadElement.scrollTop = threadElement.scrollHeight
  }, [messages])

  const sendDraft = (body: string) => {
    onSendMessage(body)
    setDraft('')
  }

  return (
    <main className="messenger-main">
      <section className="messenger-stage">
        <div className="messenger-contact-strip">
          <div className="messenger-contact-strip__identity">
            <Avatar initials="TO" />
            <div>
              <h2 className="messenger-contact-strip__name">Ted Olney-Bell</h2>
              <p className="messenger-contact-strip__status">
                <span className="messenger-contact-strip__status-dot" />
                {pendingReply ? 'Scratching a reply…' : 'Active now'}
                {isMuted ? ' · muted locally' : ''}
                {callMode === 'voice' ? ' · voice ritual open' : ''}
                {callMode === 'video' ? ' · vision fire open' : ''}
              </p>
            </div>
          </div>

          <div className="messenger-contact-strip__actions">
            <Button
              variant="utility"
              size="icon"
              className="messenger-toolbar-button"
              aria-label="Call"
              aria-pressed={callMode === 'voice'}
              onClick={() => onStartCall('voice')}
            >
              <Phone size={20} />
            </Button>
            <Button
              variant="utility"
              size="icon"
              className="messenger-toolbar-button"
              aria-label="Video call"
              aria-pressed={callMode === 'video'}
              onClick={() => onStartCall('video')}
            >
              <Video size={20} />
            </Button>
            <Button
              variant="utility"
              size="icon"
              className="messenger-toolbar-button"
              aria-label="Reset chat"
              title="Reset chat"
              onClick={onResetMessages}
            >
              <MoreHorizontal size={20} />
            </Button>
          </div>
        </div>

        <div className="messenger-canvas">
          <div className="messenger-canvas__art messenger-canvas__art--ghost" />
          <div className="messenger-canvas__art messenger-canvas__art--prints" aria-hidden="true" />

          <div className="messenger-canvas__thread" ref={threadRef} aria-live="polite">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                author={message.author}
                side={message.side}
                ornament={<Hand size={16} />}
                className={`messenger-canvas__bubble ${
                  message.id === 'question-fish-prompt' ? 'messenger-canvas__bubble--question' : ''
                } ${message.id === 'answer-good-uis' ? 'messenger-canvas__bubble--answer' : ''}`}
              >
                <p>{message.body}</p>
              </MessageBubble>
            ))}
          </div>

          <div className="messenger-canvas__artifact-stack">
            {artifacts.map((artifact) => (
              <Surface key={artifact.title} art={artifact.art} className={artifact.className}>
                <div className="artifact-card__pin artifact-card__pin--left" aria-hidden="true" />
                <div className="artifact-card__pin artifact-card__pin--right" aria-hidden="true" />
                <p className="artifact-card__title">{artifact.title}</p>
                <p className="artifact-card__body">{artifact.body}</p>
                <div className="artifact-card__mock" aria-hidden="true">
                  {artifact.className.includes('wide') ? (
                    <>
                      <div className="artifact-card__ui artifact-card__ui--sidebar">
                        <span>Home</span>
                        <span>Explore</span>
                        <span>Messages</span>
                        <span>Grok</span>
                        <span>Mammoths</span>
                        <span>More</span>
                      </div>
                      <div className="artifact-card__ui artifact-card__ui--feed">
                        <div>What&apos;s happening?</div>
                        <div>Papyrus thread with ochre highlights</div>
                        <div>Klindoropodos posted a new mammoth sketch</div>
                        <div>Trud Aardoter replied by sacred fire</div>
                      </div>
                      <div className="artifact-card__ui artifact-card__ui--rail">
                        <span>Search</span>
                        <span>Trends</span>
                        <span>Transport</span>
                        <span>Tracks</span>
                        <span>Replies</span>
                      </div>
                    </>
                  ) : null}

                  {artifact.className.includes('workbench') ? (
                    <>
                      <div className="artifact-card__desk artifact-card__desk--nav" />
                      <div className="artifact-card__desk artifact-card__desk--editor" />
                      <div className="artifact-card__desk artifact-card__desk--files" />
                      <div className="artifact-card__desk artifact-card__desk--console" />
                    </>
                  ) : null}
                </div>
              </Surface>
            ))}
          </div>
        </div>

        <div className="messenger-composer-wrap">
          <MessengerComposer
            className="messenger-composer-wrap__composer"
            leading={<Mic size={18} />}
            secondary={<Hand size={18} />}
            action={<Send size={18} />}
            placeholder="Aa"
            value={draft}
            onValueChange={setDraft}
            onSend={sendDraft}
          />
        </div>

        <footer className="messenger-statusbar">
          <span className="messenger-statusbar__dot" />
          <span>Connected to Cavebook</span>
          <span className="messenger-statusbar__mark" aria-hidden="true" />
        </footer>
      </section>

      <aside className="messenger-inspector">
        <Surface art="stonePanel" className="messenger-monolith">
          <div className="messenger-monolith__profile">
            <h2 className="cb-heading">Ted Olney-Bell</h2>
            <div className="messenger-monolith__portrait cb-asset cb-asset--portrait" aria-hidden="true" />
            <p className="messenger-monolith__handle">@ted.olneybell</p>
            <div className="messenger-monolith__beasts" aria-hidden="true">
              <Mountain size={24} />
              <Mountain size={24} />
            </div>
            <div className="messenger-monolith__embers" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>

          <Badge variant="stone" icon={<Lock size={14} />} className="messenger-monolith__badge">
            End-to-end encrypted by sacred fire
          </Badge>

          <div className="messenger-monolith__actions">
            <Button
              variant="ghost"
              className="messenger-monolith__action"
              aria-label="Profile"
              onClick={() => onNavigate('profile')}
            >
              <Hand size={20} />
              <span>Profile</span>
            </Button>
            <Button
              variant="ghost"
              className="messenger-monolith__action"
              aria-label="Mute"
              aria-pressed={isMuted}
              onClick={onToggleMute}
            >
              <Flame size={20} />
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </Button>
            <Button
              variant="ghost"
              className="messenger-monolith__action"
              aria-label="Artifacts"
              onClick={() => onNavigate('artifacts')}
            >
              <Mountain size={20} />
              <span>Archive</span>
            </Button>
          </div>

          <div className="messenger-monolith__sections">
            {inspectorSections.map((section) => (
              <div key={section.label} className="messenger-monolith__section-block">
                <InspectorSection
                  aria-expanded={openInspectorSection === section.id}
                  className={openInspectorSection === section.id ? 'is-open' : undefined}
                  label={section.label}
                  art={section.art}
                  onClick={() => onToggleInspectorSection(section.id)}
                />
                {openInspectorSection === section.id ? (
                  <div className="messenger-monolith__section-detail">
                    <p>{inspectorDetails[section.id]}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Surface>
      </aside>
    </main>
  )
}

function ProfilePage({
  isFollowing,
  onNavigate,
  onToggleFollow,
}: {
  isFollowing: boolean
  onNavigate: (page: PageId) => void
  onToggleFollow: () => void
}) {
  return (
    <main className="messenger-main">
      <section className="messenger-stage profile-stage">
        <div className="profile-stage__hero cb-frame">
          <div className="profile-stage__portrait cb-asset cb-asset--portrait" aria-hidden="true" />
          <div className="profile-stage__identity">
            <p className="cb-section-kicker">Stone profile</p>
            <h2 className="cb-heading">Ted Olney-Bell</h2>
            <p className="profile-stage__handle">@ted.olneybell</p>
            <p className="cb-copy">
              Interface naturalist, mammoth-feed enthusiast, and keeper of rough-hewn product sense.
            </p>
            <div className="profile-stage__badges">
              <Badge variant="stone" icon={<Flame size={14} />}>Sacred Fire Guild</Badge>
              <Badge variant="stone" icon={<Star size={14} />}>Verified by ochre</Badge>
            </div>
          </div>
        </div>

        <div className="profile-stage__grid">
          {memoryCards.map((card) => (
            <Surface key={card.title} variant="parchment" className="profile-memory-card">
              <p className="profile-memory-card__title">{card.title}</p>
              <p className="cb-copy">{card.body}</p>
            </Surface>
          ))}
        </div>

        <Surface variant="stone" className="profile-stage__ledger">
          <div className="profile-stage__ledger-head">
            <p className="cb-section-kicker">Recent wall posts</p>
            <Button variant="utility" onClick={() => onNavigate('messages')}>
              <ScrollText size={18} />
              Open chat
            </Button>
          </div>
          <div className="profile-stage__posts">
            <article className="profile-post">
              <p className="profile-post__title">Shared a fish portrait study</p>
              <p className="cb-copy">“Prompt discipline remains the highest form of cave governance.”</p>
            </article>
            <article className="profile-post">
              <p className="profile-post__title">Pinned a cave UI fragment</p>
              <p className="cb-copy">Tabbed stone interfaces now standardized across camp tooling.</p>
            </article>
          </div>
        </Surface>
      </section>

      <aside className="messenger-inspector">
        <Surface art="stonePanel" className="messenger-monolith profile-inspector">
          <div className="messenger-monolith__profile">
            <h2 className="cb-heading">Profile marks</h2>
            <div className="messenger-monolith__portrait cb-asset cb-asset--portrait" aria-hidden="true" />
            <p className="messenger-monolith__handle">@ted.olneybell</p>
          </div>

          <div className="profile-inspector__stats">
            <div className="profile-stat">
              <span className="profile-stat__value">{isFollowing ? '93' : '92'}</span>
              <span className="profile-stat__label">Friends</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__value">14</span>
              <span className="profile-stat__label">Artifacts</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__value">7</span>
              <span className="profile-stat__label">Guilds</span>
            </div>
          </div>

          <div className="messenger-monolith__actions">
            <Button variant="ghost" className="messenger-monolith__action" onClick={() => onNavigate('messages')}>
              <ScrollText size={20} />
              <span>Messages</span>
            </Button>
            <Button
              variant="ghost"
              className="messenger-monolith__action"
              aria-pressed={isFollowing}
              onClick={onToggleFollow}
            >
              <User size={20} />
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </Button>
            <Button variant="ghost" className="messenger-monolith__action" onClick={() => onNavigate('artifacts')}>
              <Mountain size={20} />
              <span>Archive</span>
            </Button>
          </div>
        </Surface>
      </aside>
    </main>
  )
}

function ArtifactsPage({
  artifactFilter,
  onBrowseArtifacts,
  onNavigate,
}: {
  artifactFilter: 'all' | 'notes' | 'marks' | 'logs'
  onBrowseArtifacts: () => void
  onNavigate: (page: PageId) => void
}) {
  const filteredCards =
    artifactFilter === 'all'
      ? collectionCards
      : collectionCards.filter((card) =>
          artifactFilter === 'notes'
            ? card.title === 'Camp Notes'
            : artifactFilter === 'marks'
              ? card.title === 'Profile Marks'
              : card.title === 'Ritual Logs',
        )

  return (
    <main className="messenger-main">
      <section className="messenger-stage artifacts-stage">
        <div className="artifacts-stage__header">
          <div>
            <p className="cb-section-kicker">Cavebook archive</p>
            <h2 className="cb-heading">Artifact shelves</h2>
          </div>
          <Button variant="utility" onClick={() => onNavigate('messages')}>
            <ScrollText size={18} />
            Return to messages
          </Button>
        </div>

        <div className="artifacts-stage__grid">
          {filteredCards.map((card) => (
            <Surface key={card.title} variant="parchment" className="artifacts-card">
              <p className="artifacts-card__kicker">{card.kicker}</p>
              <p className="artifacts-card__title">{card.title}</p>
              <p className="cb-copy">{card.body}</p>
            </Surface>
          ))}
          <Surface variant="stone" className="artifacts-stage__table">
            <div className="artifacts-stage__table-head">
              <span>Tablet</span>
              <span>Owner</span>
              <span>Status</span>
            </div>
            <div className="artifacts-stage__table-row">
              <span>Messenger shell</span>
              <span>Ted</span>
              <span>Carved</span>
            </div>
            <div className="artifacts-stage__table-row">
              <span>Profile shrine</span>
              <span>Guild</span>
              <span>Archived</span>
            </div>
            <div className="artifacts-stage__table-row">
              <span>Codex workbench</span>
              <span>Camp</span>
              <span>Active</span>
            </div>
          </Surface>
        </div>
      </section>

      <aside className="messenger-inspector">
        <Surface art="stonePanel" className="messenger-monolith artifacts-inspector">
          <div className="messenger-monolith__profile">
            <h2 className="cb-heading">Archive tools</h2>
            <div className="messenger-monolith__beasts" aria-hidden="true">
              <Mountain size={24} />
              <Mountain size={24} />
            </div>
          </div>

          <Badge variant="stone" className="messenger-monolith__badge" icon={<Mountain size={14} />}>
            Stones catalogued by camp order
          </Badge>

          <div className="messenger-monolith__actions">
            <Button variant="ghost" className="messenger-monolith__action" onClick={() => onNavigate('messages')}>
              <ScrollText size={20} />
              <span>Messages</span>
            </Button>
            <Button variant="ghost" className="messenger-monolith__action" onClick={() => onNavigate('profile')}>
              <User size={20} />
              <span>Profile</span>
            </Button>
            <Button variant="ghost" className="messenger-monolith__action" onClick={onBrowseArtifacts}>
              <Search size={20} />
              <span>{artifactFilter === 'all' ? 'Browse' : 'Next shelf'}</span>
            </Button>
          </div>
        </Surface>
      </aside>
    </main>
  )
}
