import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Flame, Hand, Lock, Mic, MoreHorizontal, Mountain, Phone, ScrollText, Search, Send, Star, User, Video } from 'lucide-react'
import { Avatar, Badge, Button, InspectorSection, MessageBubble, MessengerComposer, Surface } from '@cavebook/ui'
import {
  type ArtifactFilter,
  type CallMode,
  type ChatMessage,
  type InspectorSectionId,
  type PageId,
  inspectorDetails,
  profileMemories,
  profilePosts,
} from './cavebook-model'
import {
  selectCurrentThreadMessages,
  selectFilteredCollectionCards,
  selectProfileStats,
  useCavebookStore,
} from './cavebook-store'
import './app.css'

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

export function App() {
  const [callNow, setCallNow] = useState(() => Date.now())
  const cavebook = useCavebookStore()
  const {
    artifactFilter,
    callMode,
    callStartedAt,
    clearNotice,
    cycleArtifactFilter,
    flushQueuedReply,
    hydratePageFromHash,
    isFollowing,
    isMuted,
    navigate,
    notice,
    openInspectorSection,
    page,
    pendingReply,
    resetCurrentThread,
    toggleCall,
    toggleFollow,
    toggleInspectorSection,
    toggleMute,
  } = cavebook
  const messages = selectCurrentThreadMessages(cavebook)
  const collectionCards = selectFilteredCollectionCards(cavebook)
  const profileStats = selectProfileStats(cavebook)

  const flushReplyEvent = useEffectEvent(() => {
    flushQueuedReply()
  })

  useEffect(() => {
    const syncPageFromLocation = () => {
      hydratePageFromHash(window.location.hash)
    }

    syncPageFromLocation()
    window.addEventListener('hashchange', syncPageFromLocation)
    window.addEventListener('popstate', syncPageFromLocation)
    return () => {
      window.removeEventListener('hashchange', syncPageFromLocation)
      window.removeEventListener('popstate', syncPageFromLocation)
    }
  }, [hydratePageFromHash])

  useEffect(() => {
    const nextHash = page === 'messages' ? '' : `#${page}`
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

    if (currentUrl !== nextUrl) {
      window.history.pushState(null, '', nextUrl)
    }
  }, [page])

  useEffect(() => {
    if (!notice) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      clearNotice()
    }, 2400)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [clearNotice, notice])

  useEffect(() => {
    if (!pendingReply) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      flushReplyEvent()
    }, 900)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [pendingReply])

  useEffect(() => {
    if (!callStartedAt) {
      return
    }

    const intervalId = window.setInterval(() => {
      setCallNow(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [callStartedAt])

  const callDurationSeconds = callStartedAt ? Math.max(0, Math.floor((callNow - callStartedAt) / 1000)) : 0

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
                onClick={() => navigate(tab.id)}
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
            callDurationSeconds={callDurationSeconds}
            callMode={callMode}
            isMuted={isMuted}
            messages={messages}
            openInspectorSection={openInspectorSection}
            pendingReply={pendingReply}
            onNavigate={navigate}
            onResetMessages={resetCurrentThread}
            onSendMessage={(body) => useCavebookStore.getState().sendMessage(body)}
            onStartCall={toggleCall}
            onToggleInspectorSection={toggleInspectorSection}
            onToggleMute={toggleMute}
          />
        ) : null}
        {page === 'profile' ? (
          <ProfilePage
            artifactCount={profileStats.artifacts}
            guildCount={profileStats.guilds}
            isFollowing={isFollowing}
            memories={profileMemories}
            onNavigate={navigate}
            onToggleFollow={toggleFollow}
            posts={profilePosts}
            friendCount={profileStats.friends}
          />
        ) : null}
        {page === 'artifacts' ? (
          <ArtifactsPage
            artifactFilter={artifactFilter}
            collectionCards={collectionCards}
            onBrowseArtifacts={cycleArtifactFilter}
            onNavigate={navigate}
          />
        ) : null}
      </div>
    </div>
  )
}

function MessagesPage({
  callDurationSeconds,
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
  callDurationSeconds: number
  callMode: CallMode | null
  isMuted: boolean
  messages: ChatMessage[]
  openInspectorSection: InspectorSectionId | null
  pendingReply: boolean
  onNavigate: (page: PageId) => void
  onResetMessages: () => void
  onSendMessage: (body: string) => void
  onStartCall: (mode: CallMode) => void
  onToggleInspectorSection: (sectionId: InspectorSectionId) => void
  onToggleMute: () => void
}) {
  const [draft, setDraft] = useState('')
  const threadRef = useRef<HTMLDivElement>(null)
  const activeCallLabel = callMode === 'video' ? 'Vision fire' : 'Voice ritual'
  const formattedCallDuration = `${String(Math.floor(callDurationSeconds / 60)).padStart(2, '0')}:${String(
    callDurationSeconds % 60,
  ).padStart(2, '0')}`

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

        {callMode ? (
          <div className="messenger-call-tray" role="status" aria-live="polite">
            <div className="messenger-call-tray__identity">
              {callMode === 'video' ? <Video size={18} /> : <Phone size={18} />}
              <div>
                <p className="messenger-call-tray__title">{activeCallLabel} open</p>
                <p className="messenger-call-tray__meta">
                  Local-only session with Ted · {formattedCallDuration}
                  {isMuted ? ' · Ted muted' : ''}
                </p>
              </div>
            </div>

            <div className="messenger-call-tray__actions">
              {!isMuted ? (
                <Button variant="utility" onClick={onToggleMute}>
                  <Flame size={16} />
                  Silence Ted
                </Button>
              ) : null}
              <Button variant="utility" onClick={() => onStartCall(callMode)}>
                <MoreHorizontal size={16} />
                End ritual
              </Button>
            </div>
          </div>
        ) : null}

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
            <Button variant="ghost" className="messenger-monolith__action" aria-label="Profile" onClick={() => onNavigate('profile')}>
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
            <Button variant="ghost" className="messenger-monolith__action" aria-label="Artifacts" onClick={() => onNavigate('artifacts')}>
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
  artifactCount,
  friendCount,
  guildCount,
  isFollowing,
  memories,
  onNavigate,
  onToggleFollow,
  posts,
}: {
  artifactCount: number
  friendCount: number
  guildCount: number
  isFollowing: boolean
  memories: typeof profileMemories
  onNavigate: (page: PageId) => void
  onToggleFollow: () => void
  posts: typeof profilePosts
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
              <Badge variant="stone" icon={<Flame size={14} />}>
                Sacred Fire Guild
              </Badge>
              <Badge variant="stone" icon={<Star size={14} />}>
                Verified by ochre
              </Badge>
            </div>
          </div>
        </div>

        <div className="profile-stage__grid">
          {memories.map((card) => (
            <Surface key={card.id} variant="parchment" className="profile-memory-card">
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
            {posts.map((post) => (
              <article key={post.id} className="profile-post">
                <p className="profile-post__title">{post.title}</p>
                <p className="cb-copy">{post.body}</p>
              </article>
            ))}
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
              <span className="profile-stat__value">{friendCount}</span>
              <span className="profile-stat__label">Friends</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__value">{artifactCount}</span>
              <span className="profile-stat__label">Artifacts</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__value">{guildCount}</span>
              <span className="profile-stat__label">Guilds</span>
            </div>
          </div>

          <div className="messenger-monolith__actions">
            <Button variant="ghost" className="messenger-monolith__action" onClick={() => onNavigate('messages')}>
              <ScrollText size={20} />
              <span>Messages</span>
            </Button>
            <Button variant="ghost" className="messenger-monolith__action" aria-pressed={isFollowing} onClick={onToggleFollow}>
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
  collectionCards,
  onBrowseArtifacts,
  onNavigate,
}: {
  artifactFilter: ArtifactFilter
  collectionCards: Array<{ title: string; kicker: string; body: string }>
  onBrowseArtifacts: () => void
  onNavigate: (page: PageId) => void
}) {
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
          {collectionCards.map((card) => (
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
