import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  collectionCardMeta,
  type AppNotice,
  type ArtifactCategory,
  type ArtifactFilter,
  type ArtifactRecord,
  type CallMode,
  type ChatMessage,
  type ChatThread,
  type InspectorSectionId,
  type NoticeTone,
  type PageId,
  profileMemories,
  profilePosts,
  replyFragments,
  seedArtifacts,
  seedMessages,
  seedThread,
} from './cavebook-model'

const STORE_KEY = 'cavebook.store'
const LEGACY_MESSAGE_STORAGE_KEY = 'cavebook.messages'
const LEGACY_PREFERENCES_STORAGE_KEY = 'cavebook.preferences'

type CavebookStateData = {
  page: PageId
  currentThreadId: string
  threadIds: string[]
  threadsById: Record<string, ChatThread>
  messagesById: Record<string, ChatMessage>
  artifactIds: string[]
  artifactsById: Record<string, ArtifactRecord>
  isMuted: boolean
  isFollowing: boolean
  callMode: CallMode | null
  callStartedAt: number | null
  openInspectorSection: InspectorSectionId | null
  artifactFilter: ArtifactFilter
  pendingReply: boolean
  queuedReplyIndex: number | null
  notice: AppNotice | null
}

type CavebookState = CavebookStateData & {
  navigate: (page: PageId) => void
  hydratePageFromHash: (hash: string) => void
  sendMessage: (body: string) => void
  flushQueuedReply: () => void
  resetCurrentThread: () => void
  toggleCall: (mode: CallMode) => void
  toggleMute: () => void
  toggleFollow: () => void
  toggleInspectorSection: (sectionId: InspectorSectionId) => void
  cycleArtifactFilter: () => void
  showNotice: (text: string, tone?: NoticeTone) => void
  clearNotice: () => void
}

function pageFromHash(hash: string): PageId {
  const normalized = hash.replace(/^#/, '')
  return normalized === 'profile' || normalized === 'artifacts' ? normalized : 'messages'
}

function mapById<T extends { id: string }>(records: readonly T[]) {
  return Object.fromEntries(records.map((record) => [record.id, record])) as Record<string, T>
}

function createThread(messages: readonly ChatMessage[]): ChatThread {
  return {
    ...seedThread,
    messageIds: messages.map((message) => message.id),
  }
}

function parseLegacyMessages(): ChatMessage[] {
  if (typeof window === 'undefined') {
    return [...seedMessages]
  }

  try {
    const stored = window.localStorage.getItem(LEGACY_MESSAGE_STORAGE_KEY)
    if (!stored) {
      return [...seedMessages]
    }

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return [...seedMessages]
    }

    const validMessages = parsed.flatMap((message, index) => {
      if (!message || typeof message !== 'object') {
        return []
      }

      const candidate = message as Partial<ChatMessage>
      if (
        typeof candidate.id !== 'string' ||
        (candidate.author !== 'Ted Olney-Bell' && candidate.author !== 'You') ||
        (candidate.side !== 'incoming' && candidate.side !== 'outgoing') ||
        typeof candidate.body !== 'string'
      ) {
        return []
      }

      return [
        {
          id: candidate.id,
          threadId: seedThread.id,
          author: candidate.author,
          side: candidate.side,
          body: candidate.body,
          createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : index + 1,
        } satisfies ChatMessage,
      ]
    })

    return validMessages.length ? validMessages : [...seedMessages]
  } catch {
    return [...seedMessages]
  }
}

function parseLegacyPreferences() {
  if (typeof window === 'undefined') {
    return {
      isMuted: false,
      isFollowing: false,
      callMode: null as CallMode | null,
      openInspectorSection: null as InspectorSectionId | null,
      artifactFilter: 'all' as ArtifactFilter,
    }
  }

  try {
    const stored = window.localStorage.getItem(LEGACY_PREFERENCES_STORAGE_KEY)
    if (!stored) {
      return {
        isMuted: false,
        isFollowing: false,
        callMode: null as CallMode | null,
        openInspectorSection: null as InspectorSectionId | null,
        artifactFilter: 'all' as ArtifactFilter,
      }
    }

    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object') {
      return {
        isMuted: false,
        isFollowing: false,
        callMode: null as CallMode | null,
        openInspectorSection: null as InspectorSectionId | null,
        artifactFilter: 'all' as ArtifactFilter,
      }
    }

    const candidate = parsed as Partial<{
      isMuted: boolean
      isFollowing: boolean
      callMode: CallMode | null
      openInspectorSection: InspectorSectionId | null
      artifactFilter: ArtifactFilter
    }>

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
    return {
      isMuted: false,
      isFollowing: false,
      callMode: null as CallMode | null,
      openInspectorSection: null as InspectorSectionId | null,
      artifactFilter: 'all' as ArtifactFilter,
    }
  }
}

function initialData(): CavebookStateData {
  const messages = parseLegacyMessages()
  const preferences = parseLegacyPreferences()

  return {
    page: typeof window === 'undefined' ? 'messages' : pageFromHash(window.location.hash),
    currentThreadId: seedThread.id,
    threadIds: [seedThread.id],
    threadsById: {
      [seedThread.id]: createThread(messages),
    },
    messagesById: mapById(messages),
    artifactIds: seedArtifacts.map((artifact) => artifact.id),
    artifactsById: mapById(seedArtifacts),
    isMuted: preferences.isMuted,
    isFollowing: preferences.isFollowing,
    callMode: preferences.callMode,
    callStartedAt: preferences.callMode ? Date.now() : null,
    openInspectorSection: preferences.openInspectorSection,
    artifactFilter: preferences.artifactFilter,
    pendingReply: false,
    queuedReplyIndex: null,
    notice: null,
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function summarizeCall(durationSeconds: number, mode: CallMode) {
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  return `${mode === 'video' ? 'Vision fire' : 'Voice ritual'} lasted ${minutes}:${String(seconds).padStart(2, '0')}.`
}

function buildCollectionCards(artifactsById: Record<string, ArtifactRecord>, artifactIds: string[]) {
  const counts = artifactIds.reduce<Record<ArtifactCategory, number>>(
    (current, artifactId) => {
      const artifact = artifactsById[artifactId]
      if (artifact) {
        current[artifact.category] += 1
      }
      return current
    },
    { notes: 0, marks: 0, logs: 0 },
  )

  return (Object.keys(collectionCardMeta) as ArtifactCategory[]).map((category) => ({
    title: collectionCardMeta[category].title,
    kicker: `${counts[category]} ${collectionCardMeta[category].unit}`,
    body: collectionCardMeta[category].body,
  }))
}

export const useCavebookStore = create<CavebookState>()(
  persist(
    (set, get) => ({
      ...initialData(),
      navigate: (page) => set({ page }),
      hydratePageFromHash: (hash) => set({ page: pageFromHash(hash) }),
      sendMessage: (body) => {
        const trimmed = body.trim()
        if (!trimmed) {
          return
        }

        const state = get()
        const thread = state.threadsById[state.currentThreadId]
        if (!thread) {
          return
        }

        const message: ChatMessage = {
          id: makeId('local'),
          threadId: thread.id,
          author: 'You',
          side: 'outgoing',
          body: trimmed,
          createdAt: Date.now(),
        }

        const nextThread: ChatThread = {
          ...thread,
          messageIds: [...thread.messageIds, message.id],
        }

        const tedReplyCount = nextThread.messageIds.reduce((count, messageId) => {
          const currentMessage = messageId === message.id ? message : state.messagesById[messageId]
          return currentMessage?.author === 'Ted Olney-Bell' ? count + 1 : count
        }, 0)

        if (state.isMuted) {
          set({
            threadsById: { ...state.threadsById, [thread.id]: nextThread },
            messagesById: { ...state.messagesById, [message.id]: message },
            pendingReply: false,
            queuedReplyIndex: null,
            notice: {
              text: 'Ted is muted locally. Replies are paused until you unmute him.',
              tone: 'neutral',
            },
          })
          return
        }

        set({
          threadsById: { ...state.threadsById, [thread.id]: nextThread },
          messagesById: { ...state.messagesById, [message.id]: message },
          pendingReply: true,
          queuedReplyIndex: tedReplyCount % replyFragments.length,
        })
      },
      flushQueuedReply: () => {
        const state = get()
        if (!state.pendingReply || state.queuedReplyIndex === null) {
          return
        }

        const thread = state.threadsById[state.currentThreadId]
        if (!thread || state.isMuted) {
          set({ pendingReply: false, queuedReplyIndex: null })
          return
        }

        const replyMessage: ChatMessage = {
          id: makeId('ted'),
          threadId: thread.id,
          author: 'Ted Olney-Bell',
          side: 'incoming',
          body: replyFragments[state.queuedReplyIndex],
          createdAt: Date.now(),
        }

        set({
          threadsById: {
            ...state.threadsById,
            [thread.id]: {
              ...thread,
              messageIds: [...thread.messageIds, replyMessage.id],
            },
          },
          messagesById: { ...state.messagesById, [replyMessage.id]: replyMessage },
          pendingReply: false,
          queuedReplyIndex: null,
        })
      },
      resetCurrentThread: () =>
        set((state) => ({
          threadsById: {
            ...state.threadsById,
            [seedThread.id]: createThread(seedMessages),
          },
          messagesById: {
            ...state.messagesById,
            ...mapById(seedMessages),
          },
          pendingReply: false,
          queuedReplyIndex: null,
          notice: { text: 'Thread reset to the seeded camp exchange.', tone: 'neutral' },
        })),
      toggleCall: (mode) =>
        set((state) => {
          const isClosing = state.callMode === mode
          const nextArtifacts = { ...state.artifactsById }
          const nextArtifactIds = [...state.artifactIds]

          if (isClosing && state.callStartedAt !== null) {
            const durationSeconds = Math.max(1, Math.floor((Date.now() - state.callStartedAt) / 1000))
            const artifactId = makeId('ritual-log')
            nextArtifacts[artifactId] = {
              id: artifactId,
              title: `${mode === 'video' ? 'Vision fire' : 'Voice ritual'} log`,
              body: summarizeCall(durationSeconds, mode),
              art: 'workbenchTablet',
              className: 'artifact-card artifact-card--link',
              category: 'logs',
              kicker: 'Ritual Logs',
              createdAt: Date.now(),
            }
            nextArtifactIds.unshift(artifactId)
          }

          return {
            callMode: isClosing ? null : mode,
            callStartedAt: isClosing ? null : Date.now(),
            artifactsById: nextArtifacts,
            artifactIds: nextArtifactIds,
            notice: {
              text: isClosing
                ? mode === 'voice'
                  ? 'Voice ritual ended.'
                  : 'Vision fire ended.'
                : mode === 'voice'
                  ? 'Voice ritual started locally. No remote call is placed.'
                  : 'Vision fire started locally. No remote video session is placed.',
              tone: 'active',
            },
          }
        }),
      toggleMute: () =>
        set((state) => ({
          isMuted: !state.isMuted,
          pendingReply: !state.isMuted ? false : state.pendingReply,
          queuedReplyIndex: !state.isMuted ? null : state.queuedReplyIndex,
          notice: {
            text: !state.isMuted
              ? 'Ted is muted locally. Replies are paused.'
              : 'Ted is unmuted locally. Replies will resume.',
            tone: 'neutral',
          },
        })),
      toggleFollow: () =>
        set((state) => ({
          isFollowing: !state.isFollowing,
          notice: {
            text: !state.isFollowing ? 'You are now following Ted.' : 'You stopped following Ted.',
            tone: 'neutral',
          },
        })),
      toggleInspectorSection: (sectionId) =>
        set((state) => ({
          openInspectorSection: state.openInspectorSection === sectionId ? null : sectionId,
        })),
      cycleArtifactFilter: () =>
        set((state) => {
          const nextFilter =
            state.artifactFilter === 'all'
              ? 'notes'
              : state.artifactFilter === 'notes'
                ? 'marks'
                : state.artifactFilter === 'marks'
                  ? 'logs'
                  : 'all'

          return {
            artifactFilter: nextFilter,
            notice: {
              text:
                nextFilter === 'all'
                  ? 'Showing the full archive shelf.'
                  : `Browsing ${
                      nextFilter === 'notes' ? 'Camp Notes' : nextFilter === 'marks' ? 'Profile Marks' : 'Ritual Logs'
                    }.`,
              tone: 'neutral',
            },
          }
        }),
      showNotice: (text, tone = 'neutral') => set({ notice: { text, tone } }),
      clearNotice: () => set({ notice: null }),
    }),
    {
      name: STORE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        page: state.page,
        currentThreadId: state.currentThreadId,
        threadIds: state.threadIds,
        threadsById: state.threadsById,
        messagesById: state.messagesById,
        artifactIds: state.artifactIds,
        artifactsById: state.artifactsById,
        isMuted: state.isMuted,
        isFollowing: state.isFollowing,
        callMode: state.callMode,
        callStartedAt: state.callStartedAt,
        openInspectorSection: state.openInspectorSection,
        artifactFilter: state.artifactFilter,
        pendingReply: false,
        queuedReplyIndex: null,
        notice: null,
      }),
    },
  ),
)

export function selectCurrentThreadMessages(state: CavebookState) {
  const thread = state.threadsById[state.currentThreadId]
  if (!thread) {
    return [] as ChatMessage[]
  }

  return thread.messageIds
    .map((messageId) => state.messagesById[messageId])
    .filter((message): message is ChatMessage => Boolean(message))
    .sort((left, right) => left.createdAt - right.createdAt)
}

export function selectShowcaseArtifacts(state: CavebookState) {
  return state.artifactIds
    .map((artifactId) => state.artifactsById[artifactId])
    .filter((artifact): artifact is ArtifactRecord => Boolean(artifact))
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 3)
}

export function selectFilteredCollectionCards(state: CavebookState) {
  const cards = buildCollectionCards(state.artifactsById, state.artifactIds)
  return state.artifactFilter === 'all'
    ? cards
    : cards.filter((card) => card.title === collectionCardMeta[state.artifactFilter].title)
}

export function selectArtifactCount(state: CavebookState) {
  return state.artifactIds.length
}

export function selectProfileStats(state: CavebookState) {
  return {
    friends: state.isFollowing ? 93 : 92,
    artifacts: selectArtifactCount(state),
    guilds: 7,
  }
}

export function selectProfileMemories() {
  return [...profileMemories]
}

export function selectProfilePosts() {
  return [...profilePosts]
}

export function resetCavebookStore() {
  useCavebookStore.persist.clearStorage()
  useCavebookStore.setState(
    {
      ...initialData(),
      navigate: useCavebookStore.getState().navigate,
      hydratePageFromHash: useCavebookStore.getState().hydratePageFromHash,
      sendMessage: useCavebookStore.getState().sendMessage,
      flushQueuedReply: useCavebookStore.getState().flushQueuedReply,
      resetCurrentThread: useCavebookStore.getState().resetCurrentThread,
      toggleCall: useCavebookStore.getState().toggleCall,
      toggleMute: useCavebookStore.getState().toggleMute,
      toggleFollow: useCavebookStore.getState().toggleFollow,
      toggleInspectorSection: useCavebookStore.getState().toggleInspectorSection,
      cycleArtifactFilter: useCavebookStore.getState().cycleArtifactFilter,
      showNotice: useCavebookStore.getState().showNotice,
      clearNotice: useCavebookStore.getState().clearNotice,
    },
    true,
  )
}
