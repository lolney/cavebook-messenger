import { useEffect, useState } from 'react'
import {
  Flame,
  Hand,
  Lock,
  Mic,
  MoreHorizontal,
  Phone,
  Search,
  Send,
  Sun,
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

const pageTabs = [
  { id: 'messages' as const, label: 'Messages', icon: ScrollText },
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'artifacts' as const, label: 'Artifacts', icon: Mountain },
] as const

const inspectorSections = [
  { label: 'Chat info', art: 'chatInfo' as const },
  { label: 'Customize chat', art: 'customizeChat' as const },
  { label: 'Media & files', art: 'mediaFiles' as const },
  { label: 'Privacy & support', art: 'privacySupport' as const },
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

function pageFromHash(hash: string): PageId {
  const normalized = hash.replace(/^#/, '')
  return normalized === 'profile' || normalized === 'artifacts' ? normalized : 'messages'
}

export function App() {
  const [page, setPage] = useState<PageId>(() =>
    typeof window === 'undefined' ? 'messages' : pageFromHash(window.location.hash),
  )

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

  return (
    <div className="cb-page">
      <div className="cb-ambient cb-ambient--left" />
      <div className="cb-ambient cb-ambient--right" />

      <div className="messenger-shell cb-frame">
        <div className="messenger-shell__post messenger-shell__post--left" aria-hidden="true" />
        <div className="messenger-shell__post messenger-shell__post--right" aria-hidden="true" />
        <div className="messenger-shell__rope messenger-shell__rope--left" aria-hidden="true" />
        <div className="messenger-shell__rope messenger-shell__rope--right" aria-hidden="true" />
        <div className="messenger-shell__corner messenger-shell__corner--tl" aria-hidden="true" />
        <div className="messenger-shell__corner messenger-shell__corner--tr" aria-hidden="true" />
        <div className="messenger-shell__corner messenger-shell__corner--bl" aria-hidden="true" />
        <div className="messenger-shell__corner messenger-shell__corner--br" aria-hidden="true" />

        <header className="messenger-topbar">
          <div className="messenger-topbar__plaque messenger-topbar__plaque--glyphs messenger-topbar__plaque--left cb-asset cb-asset--plaque-left">
            <span>𐂂</span>
            <span>✋</span>
            <span>𐃘</span>
          </div>
          <div className="messenger-topbar__plaque messenger-topbar__plaque--title cb-asset cb-asset--plaque-title">
            <p className="cb-eyebrow">Facebook Messenger for Macintosh</p>
            <h1 className="cb-display">20,000 BCE</h1>
          </div>
          <div className="messenger-topbar__plaque messenger-topbar__plaque--glyphs messenger-topbar__plaque--right cb-asset cb-asset--plaque-right">
            <span>
              <Sun size={18} />
            </span>
            <span>𐄷</span>
            <span>𐃔</span>
            <span>✋</span>
          </div>
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

        {page === 'messages' ? <MessagesPage onNavigate={setPage} /> : null}
        {page === 'profile' ? <ProfilePage onNavigate={setPage} /> : null}
        {page === 'artifacts' ? <ArtifactsPage onNavigate={setPage} /> : null}
      </div>
    </div>
  )
}

function MessagesPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
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
                Active now
              </p>
            </div>
          </div>

          <div className="messenger-contact-strip__actions">
            <Button variant="utility" size="icon" className="messenger-toolbar-button" aria-label="Call">
              <Phone size={20} />
            </Button>
            <Button variant="utility" size="icon" className="messenger-toolbar-button" aria-label="Video call">
              <Video size={20} />
            </Button>
            <Button variant="utility" size="icon" className="messenger-toolbar-button" aria-label="More options">
              <MoreHorizontal size={20} />
            </Button>
          </div>
        </div>

        <div className="messenger-canvas">
          <div className="messenger-canvas__art messenger-canvas__art--ghost" />
          <div className="messenger-canvas__art messenger-canvas__art--prints">✋</div>

          <MessageBubble
            author="Ted Olney-Bell"
            ornament={<Hand size={16} />}
            className="messenger-canvas__bubble messenger-canvas__bubble--question"
          >
            <p>What was the prompt you used for the one of me holding the fish?</p>
          </MessageBubble>

          <MessageBubble
            author="You"
            side="outgoing"
            ornament={<Hand size={16} />}
            className="messenger-canvas__bubble messenger-canvas__bubble--answer"
          >
            <p>It&apos;s very good at generating UIs.</p>
          </MessageBubble>

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
          />
        </div>

        <footer className="messenger-statusbar">
          <span className="messenger-statusbar__dot" />
          <span>Connected to Cavebook</span>
          <span>𐃘</span>
        </footer>
      </section>

      <aside className="messenger-inspector">
        <Surface art="stonePanel" className="messenger-monolith">
          <div className="messenger-monolith__profile">
            <h2 className="cb-heading">Ted Olney-Bell</h2>
            <div className="messenger-monolith__portrait cb-asset cb-asset--portrait" aria-hidden="true" />
            <p className="messenger-monolith__handle">@ted.olneybell</p>
            <div className="messenger-monolith__beasts" aria-hidden="true">
              <span>𐃘</span>
              <span>𐃘</span>
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
            <Button variant="ghost" className="messenger-monolith__action" aria-label="Mute">
              <Flame size={20} />
              <span>Mute</span>
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
              <InspectorSection key={section.label} label={section.label} art={section.art} />
            ))}
          </div>
        </Surface>
      </aside>
    </main>
  )
}

function ProfilePage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
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
              <span className="profile-stat__value">92</span>
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
            <Button variant="ghost" className="messenger-monolith__action">
              <User size={20} />
              <span>Follow</span>
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

function ArtifactsPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
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
              <span>𐃘</span>
              <span>𐃘</span>
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
            <Button variant="ghost" className="messenger-monolith__action">
              <Search size={20} />
              <span>Browse</span>
            </Button>
          </div>
        </Surface>
      </aside>
    </main>
  )
}
