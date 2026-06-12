import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Flame, Hand, Lock, Mic, MoreHorizontal, Mountain, Phone, ScrollText, Send, Star, User, Video } from 'lucide-react'
import { Badge, Button, InspectorSection, MessageBubble, Surface } from '@cavebook/ui'
import {
  type ArtifactFilter,
  type ArtifactRecord,
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
  const profileStats = selectProfileStats(cavebook)
  const ritualLogs = cavebook.artifactIds
    .map((artifactId) => cavebook.artifactsById[artifactId])
    .filter((artifact): artifact is ArtifactRecord => Boolean(artifact) && artifact.id.startsWith('ritual-log-'))

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
            className="messenger-topbar__plaque messenger-topbar__plaque--title"
            aria-label="Cavebook Messenger for Macintosh, 20,000 BCE"
          >
            <span>CAVEBOOK MESSENGER FOR MACINTOSH</span>
            <small>20,000 BCE</small>
          </div>
          <div
            className="messenger-topbar__plaque messenger-topbar__plaque--glyphs messenger-topbar__plaque--right cb-asset cb-asset--plaque-right"
            aria-hidden="true"
          />
        </header>

        <nav className={`messenger-nav ${page === 'messages' ? 'messenger-nav--chat-hidden' : ''}`} aria-label="Primary">
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

        {page !== 'messages' ? (
          <div className="messenger-page-tools" aria-label="Quick actions">
            <Button
              art="phone"
              size="icon"
              className="messenger-toolbar-button"
              aria-label="Call"
              aria-pressed={callMode === 'voice'}
              onClick={() => toggleCall('voice')}
            >
              <Phone size={20} />
            </Button>
            <Button
              art="video"
              size="icon"
              className="messenger-toolbar-button"
              aria-label="Video call"
              aria-pressed={callMode === 'video'}
              onClick={() => toggleCall('video')}
            >
              <Video size={20} />
            </Button>
            <Button
              art="more"
              size="icon"
              className="messenger-toolbar-button"
              aria-label="Reset chat"
              title="Reset chat"
              onClick={resetCurrentThread}
            >
              <MoreHorizontal size={20} />
            </Button>
          </div>
        ) : null}

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
            onBrowseArtifacts={cycleArtifactFilter}
            onNavigate={navigate}
            ritualLogs={ritualLogs}
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
      <section className="messenger-stage messenger-stage--messages">
        <div className="messenger-contact-strip">
          <div className="messenger-contact-strip__identity">
            <div className="messenger-contact-strip__portrait cb-asset cb-asset--portrait" aria-hidden="true" />
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
              art="phone"
              size="icon"
              className="messenger-toolbar-button"
              aria-label="Call"
              aria-pressed={callMode === 'voice'}
              onClick={() => onStartCall('voice')}
            >
              <Phone size={20} />
            </Button>
            <Button
              art="video"
              size="icon"
              className="messenger-toolbar-button"
              aria-label="Video call"
              aria-pressed={callMode === 'video'}
              onClick={() => onStartCall('video')}
            >
              <Video size={20} />
            </Button>
            <Button
              art="more"
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
                <span className="messenger-canvas__bubble-time">{message.side === 'outgoing' ? '10:25 AM ✓✓' : '10:24 AM'}</span>
              </MessageBubble>
            ))}
          </div>
        </div>

        <div className="messenger-composer-wrap">
          <form
            className="messenger-composer-wrap__composer"
            onSubmit={(event) => {
              event.preventDefault()
              sendDraft(draft)
            }}
          >
            <button className="composer-stone-button" type="button" aria-label="Voice scratch">
              <Mic size={18} />
            </button>
            <button className="composer-stone-button" type="button" aria-label="Mammoth mark">
              <Mountain size={18} />
            </button>
            <button className="composer-stone-button" type="button" aria-label="Hand glyph">
              <Hand size={18} />
            </button>
            <input
              aria-label="Message"
              name="message"
              placeholder="Aa"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button className="composer-stone-button composer-stone-button--face" type="button" aria-label="Ochre face">
              <span className="composer-face" aria-hidden="true" />
            </button>
            <button className="composer-stone-button" type="submit" aria-label="Send" disabled={!draft.trim()}>
              <Send size={18} />
            </button>
          </form>
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
            <RailAssetAction kind="profile" label="Profile" onClick={() => onNavigate('profile')} />
            <Button
              className="messenger-monolith__asset-action messenger-monolith__asset-action--mute"
              aria-label="Mute"
              aria-pressed={isMuted}
              onClick={onToggleMute}
            >
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </Button>
            <RailAssetAction kind="search" label="Search" onClick={() => onNavigate('artifacts')} />
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
              <button className="profile-memory-card__action" type="button">
                {profileMemoryAction(card.id)}
              </button>
            </Surface>
          ))}
        </div>

        <Surface variant="stone" className="profile-stage__ledger">
          <div className="profile-stage__ledger-head">
            <p className="cb-section-kicker">Recent wall posts</p>
          </div>
          <div className="profile-stage__posts">
            {posts.map((post) => (
              <article key={post.id} className="profile-post">
                <p className="profile-post__title">{post.title}</p>
                <p className="cb-copy">{post.body}</p>
                <span className="profile-post__meta">{profilePostMeta(post.id)}</span>
                <span className="profile-post__arrow" aria-hidden="true">›</span>
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

          <Badge variant="stone" icon={<Lock size={14} />} className="messenger-monolith__badge profile-inspector__badge">
            End-to-end encrypted by sacred fire
          </Badge>

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
            <RailAssetAction kind="profile" label="Messages" onClick={() => onNavigate('messages')} />
            <Button
              className="messenger-monolith__asset-action messenger-monolith__asset-action--mute"
              aria-pressed={isFollowing}
              onClick={onToggleFollow}
            >
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </Button>
            <RailAssetAction kind="search" label="Archive" onClick={() => onNavigate('artifacts')} />
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
  ritualLogs,
}: {
  artifactFilter: ArtifactFilter
  onBrowseArtifacts: () => void
  onNavigate: (page: PageId) => void
  ritualLogs: ArtifactRecord[]
}) {
  return (
    <main className="messenger-main">
      <section className="messenger-stage artifacts-stage">
        <div className="artifacts-stage__header">
          <div>
            <p className="cb-section-kicker">Artifact shelves</p>
            <h2 className="cb-heading">Cavebook archive</h2>
          </div>
        </div>

        <div className="artifact-shelf-tabs" aria-label="Artifact shelves">
          <button type="button">
            <span className="tool-glyph tool-glyph--ring" aria-hidden="true" />
            <span>Messenger shell</span>
          </button>
          <button type="button">
            <span className="tool-glyph tool-glyph--hand" aria-hidden="true" />
            <span>Profile shrine</span>
          </button>
          <button type="button">
            <span className="tool-glyph tool-glyph--tools" aria-hidden="true" />
            <span>Codex workbench</span>
          </button>
          <button type="button">
            <span className="tool-glyph tool-glyph--ledger" aria-hidden="true" />
            <span>Camp ledger</span>
          </button>
        </div>

        <div className="artifacts-stage__grid">
          <article className="archive-preview archive-preview--messenger" aria-label="Messenger shell v3.7">
            <span className="archive-tablet__pin archive-tablet__pin--left" aria-hidden="true" />
            <span className="archive-tablet__pin archive-tablet__pin--right" aria-hidden="true" />
            <p className="archive-preview__title">
              <span className="tool-glyph tool-glyph--ring" aria-hidden="true" />
              Messenger shell v3.7
            </p>
            <div className="archive-preview__soot" aria-hidden="true">
              <nav>
                <span>Home</span>
                <span>Explore</span>
                <span>Messages</span>
                <span>Grok</span>
                <span>Mammoths</span>
              </nav>
              <section>
                <p>What's happening?</p>
                <p>Papyrus thread with ochre highlights</p>
                <p>Klindoropodos posted a mammoth sketch</p>
              </section>
              <aside>
                <span>Search</span>
                <span>Trends</span>
                <span>Tracks</span>
              </aside>
            </div>
          </article>

          <article className="archive-preview archive-preview--profile" aria-label="Profile shrine v2.4">
            <span className="archive-tablet__pin archive-tablet__pin--left" aria-hidden="true" />
            <span className="archive-tablet__pin archive-tablet__pin--right" aria-hidden="true" />
            <p className="archive-preview__title">
              <span className="tool-glyph tool-glyph--tools" aria-hidden="true" />
              Profile shrine v2.4
            </p>
            <div className="archive-profile-card">
              <div className="archive-profile-card__portrait cb-asset cb-asset--portrait" aria-hidden="true" />
              <p>@ted.olneybell</p>
              <div className="archive-profile-card__badge">
                <Lock size={13} />
                <span>End-to-end encrypted by Sacred Fire</span>
                <Flame size={14} />
              </div>
              <div className="archive-profile-card__actions">
                <span className="tool-glyph tool-glyph--walk" aria-hidden="true" />
                <span className="tool-glyph tool-glyph--hand" aria-hidden="true" />
                <SearchGlyph />
              </div>
            </div>
          </article>

          <article className="archive-note archive-note--codex">
            <span className="tool-glyph tool-glyph--tools" aria-hidden="true" />
            <h3>Codex patch note</h3>
            <p>Fixed crash when reading mammoth_eval.log on return-left gesture. Improved glyph rendering in low firelight.</p>
            <Hand size={18} aria-hidden="true" />
          </article>

          <article className="archive-note archive-note--guild">
            <span className="tool-glyph tool-glyph--walk" aria-hidden="true" />
            <h3>Guild memo</h3>
            <p>All artifacts must be tested on real stone before sharing with other camps.</p>
            <Mountain size={18} aria-hidden="true" />
          </article>

          <Surface variant="stone" className="artifacts-stage__table">
            <p className="artifacts-stage__table-title">Stones catalogued by camp order</p>
            <div className="artifacts-stage__table-head">
              <span>#</span>
              <span>Artifact name</span>
              <span>Category</span>
              <span>Version</span>
              <span>Carved by</span>
              <span>Date carved</span>
            </div>
            <div className="artifacts-stage__table-row">
              <span>01</span>
              <span>Messenger shell</span>
              <span>Messenger shell</span>
              <span>v3.7</span>
              <span>Trud Aardoyer</span>
              <span>18,742 BCE</span>
            </div>
            <div className="artifacts-stage__table-row">
              <span>02</span>
              <span>Profile shrine</span>
              <span>Profile shrine</span>
              <span>v2.4</span>
              <span>Ted Olney-Bell</span>
              <span>18,915 BCE</span>
            </div>
            <div className="artifacts-stage__table-row">
              <span>03</span>
              <span>Codex workbench</span>
              <span>Codex workbench</span>
              <span>v1.9</span>
              <span>Klindoropodos</span>
              <span>19,023 BCE</span>
            </div>
            <div className="artifacts-stage__table-row">
              <span>04</span>
              <span>Camp ledger</span>
              <span>Camp ledger</span>
              <span>v1.3</span>
              <span>Urcha Cavehand</span>
              <span>19,104 BCE</span>
            </div>
            {ritualLogs.length > 0 ? (
              <div className="artifacts-stage__local-logs" aria-label="Local ritual logs">
                {ritualLogs.map((artifact) => (
                  <article key={artifact.id} className="artifacts-stage__local-log">
                    <span className="tool-glyph tool-glyph--tools" aria-hidden="true" />
                    <strong>{artifact.title}</strong>
                    <span>{artifact.body}</span>
                  </article>
                ))}
              </div>
            ) : null}
          </Surface>
        </div>
      </section>

      <aside className="messenger-inspector">
        <Surface art="stonePanel" className="messenger-monolith artifacts-inspector">
          <div className="messenger-monolith__profile">
            <h2 className="cb-heading">Stone tools</h2>
            <div className="messenger-monolith__beasts" aria-hidden="true">
              <Mountain size={24} />
              <Mountain size={24} />
            </div>
          </div>

          <Badge variant="stone" className="messenger-monolith__badge" icon={<Mountain size={14} />}>
            Stones catalogued by camp order
          </Badge>

          <div className="artifact-tools-list">
            <button type="button" aria-label="Browse" onClick={onBrowseArtifacts}>
              <SearchGlyph />
              <span>Browse</span>
              <small>Explore all artifacts</small>
            </button>
            <button type="button" onClick={() => onNavigate('messages')}>
              <span className="tool-glyph tool-glyph--ring" aria-hidden="true" />
              <span>Messages</span>
              <small>View messenger artifacts</small>
            </button>
            <button type="button" onClick={() => onNavigate('profile')}>
              <span className="tool-glyph tool-glyph--hand" aria-hidden="true" />
              <span>Profile</span>
              <small>View profile artifacts</small>
            </button>
            <button type="button" onClick={onBrowseArtifacts}>
              <span className="tool-glyph tool-glyph--tools" aria-hidden="true" />
              <span>Codex</span>
              <small>View codex artifacts</small>
            </button>
            <button type="button" onClick={onBrowseArtifacts}>
              <SearchGlyph />
              <span>Search archive</span>
              <small>Find by glyph or name</small>
            </button>
            <button type="button" onClick={onBrowseArtifacts}>
              <Flame size={18} />
              <span>Firelight filter</span>
              <small>{artifactFilter === 'all' ? 'Show only verified' : 'Next shelf'}</small>
            </button>
            <button type="button" onClick={onBrowseArtifacts}>
              <span className="tool-glyph tool-glyph--age" aria-hidden="true" />
              <span>Sort by age</span>
              <small>Oldest carvings first</small>
            </button>
          </div>
        </Surface>
      </aside>
    </main>
  )
}

function profilePostMeta(postId: string) {
  if (postId === 'post-fish-portrait') {
    return '3 moons ago'
  }

  if (postId === 'post-cave-ui-fragment') {
    return '7 moons ago'
  }

  return '12 moons ago'
}

function profileMemoryAction(cardId: string) {
  if (cardId === 'memory-hunt-sketch') {
    return 'View sketch'
  }

  if (cardId === 'memory-pinned-note') {
    return 'Read note'
  }

  return 'View role'
}

function SearchGlyph() {
  return <span className="tool-glyph tool-glyph--search" aria-hidden="true" />
}

function RailAssetAction({
  kind,
  label,
  onClick,
}: {
  kind: 'profile' | 'mute' | 'search'
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={`messenger-monolith__asset-action messenger-monolith__asset-action--${kind}`}
      type="button"
      onClick={onClick}
    >
      <span>{label}</span>
    </button>
  )
}
