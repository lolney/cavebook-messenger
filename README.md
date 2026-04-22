# Cavebook Workspace

This repository now has three layers:

- `packages/cavebook-ui`: the shared design-language framework
- `apps/design-lab`: a lightweight theme and token showcase
- `apps/messenger`: the Cavebook Messenger frontend

Storybook is configured at the root and points at stories inside the shared UI package.

## Commands

```bash
npm install
npm run dev:design-lab
npm run dev:messenger
npm run storybook
npm run build
npm run lint
```

## Framework scope

The shared package currently includes:

- Global theme tokens and material styles
- Core primitives: `Surface`, `Button`, `Badge`, `TextField`, `Avatar`
- Messenger primitives: `ConversationListItem`, `MessageBubble`, `MessengerComposer`, `InspectorSection`

This is enough to build and iterate on Cavebook Messenger while keeping the product app separate from the framework layer.
