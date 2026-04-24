export type PageId = 'messages' | 'profile' | 'artifacts'
export type InspectorSectionId = 'chatInfo' | 'customizeChat' | 'mediaFiles' | 'privacySupport'
export type NoticeTone = 'neutral' | 'active'
export type CallMode = 'voice' | 'video'
export type ArtifactCategory = 'notes' | 'marks' | 'logs'
export type ArtifactFilter = 'all' | ArtifactCategory

export type ChatMessage = {
  id: string
  threadId: string
  author: 'Ted Olney-Bell' | 'You'
  side: 'incoming' | 'outgoing'
  body: string
  createdAt: number
}

export type ChatThread = {
  id: string
  title: string
  participantName: string
  participantHandle: string
  messageIds: string[]
}

export type ArtifactRecord = {
  id: string
  title: string
  body: string
  art: 'sootTablet' | 'linkTablet' | 'workbenchTablet'
  className: string
  category: ArtifactCategory
  kicker: string
  createdAt: number
}

export type AppNotice = {
  text: string
  tone: NoticeTone
}

export type ProfileMemoryCard = {
  id: string
  title: string
  body: string
}

export type ProfilePost = {
  id: string
  title: string
  body: string
}

export const MESSENGER_THREAD_ID = 'ted-campfire-thread'

export const replyFragments = [
  'I asked because the fish portrait is still the strongest one.',
  'The cave-painting atmosphere is working, but the sidebar stone still needs more depth.',
  'Try keeping the tablet stack tighter so it feels pinned instead of pasted on.',
  'That tracks. The hand-carved framing is doing more of the work now.',
] as const

export const seedMessages = [
  {
    id: 'question-fish-prompt',
    threadId: MESSENGER_THREAD_ID,
    author: 'Ted Olney-Bell',
    side: 'incoming',
    body: 'What was the prompt you used for the one of me holding the fish?',
    createdAt: 1,
  },
  {
    id: 'answer-good-uis',
    threadId: MESSENGER_THREAD_ID,
    author: 'You',
    side: 'outgoing',
    body: "It's very good at generating UIs.",
    createdAt: 2,
  },
] as const satisfies readonly ChatMessage[]

export const seedThread: ChatThread = {
  id: MESSENGER_THREAD_ID,
  title: 'Ted Olney-Bell',
  participantName: 'Ted Olney-Bell',
  participantHandle: '@ted.olneybell',
  messageIds: seedMessages.map((message) => message.id),
}

export const seedArtifacts = [
  {
    id: 'artifact-soot-feed',
    title: "It's very good at generating UIs",
    body: 'Pinned soot tablet with a carved timeline, hand-fed replies, and ritual search rail.',
    art: 'sootTablet',
    className: 'artifact-card artifact-card--wide',
    category: 'notes',
    kicker: 'Camp Notes',
    createdAt: 3,
  },
  {
    id: 'artifact-link-tablet',
    title: 'Here was the chat',
    body: 'https://chatgpt.com/share/69e86442-93b8-83e8-9cb8-22ff2254e76d',
    art: 'linkTablet',
    className: 'artifact-card artifact-card--link',
    category: 'marks',
    kicker: 'Profile Marks',
    createdAt: 4,
  },
  {
    id: 'artifact-workbench',
    title: "Here's Codex in 1995",
    body: 'Stone workbench for projects, folders, patch previews, and camp-console output.',
    art: 'workbenchTablet',
    className: 'artifact-card artifact-card--workbench',
    category: 'logs',
    kicker: 'Ritual Logs',
    createdAt: 5,
  },
] as const satisfies readonly ArtifactRecord[]

export const profileMemories = [
  {
    id: 'memory-hunt-sketch',
    title: 'Hunt sketch',
    body: 'Three mammoths, one canoe, and a suspiciously modern search ranking algorithm.',
  },
  {
    id: 'memory-pinned-note',
    title: 'Pinned note',
    body: 'Still insists the fish portrait was for “research” and not profile optimization.',
  },
  {
    id: 'memory-guild-role',
    title: 'Guild role',
    body: 'Lead cave-interface wrangler for Sacred Fire Systems and elder of rough edges.',
  },
] as const satisfies readonly ProfileMemoryCard[]

export const profilePosts = [
  {
    id: 'post-fish-portrait',
    title: 'Shared a fish portrait study',
    body: '“Prompt discipline remains the highest form of cave governance.”',
  },
  {
    id: 'post-cave-ui-fragment',
    title: 'Pinned a cave UI fragment',
    body: 'Tabbed stone interfaces now standardized across camp tooling.',
  },
] as const satisfies readonly ProfilePost[]

export const inspectorDetails: Record<InspectorSectionId, string> = {
  chatInfo: 'Local-only thread with Ted. Messages stay in this browser and can be reset from the more button.',
  customizeChat:
    'The visual shell, reply loop, and tablet stack are active here. This build has no remote theme sync.',
  mediaFiles: 'Current shelf includes the soot feed tablet, the shared-chat tablet, and the Codex workbench tablet.',
  privacySupport: 'No server sync, no remote account state, and no network-backed actions. This app runs entirely locally.',
}

export const collectionCardMeta: Record<
  ArtifactCategory,
  { title: string; body: string; unit: string }
> = {
  notes: {
    title: 'Camp Notes',
    body: 'Drafted interfaces, link tablets, and smoke-dark conversation captures.',
    unit: 'tablets',
  },
  marks: {
    title: 'Profile Marks',
    body: 'Portrait studies, tribe badges, and messenger handle experiments.',
    unit: 'carvings',
  },
  logs: {
    title: 'Ritual Logs',
    body: 'Build output, patch rituals, and benchmark scratches kept beside the fire.',
    unit: 'embers',
  },
}
