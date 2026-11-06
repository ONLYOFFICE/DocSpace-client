# Design

## Context

See proposal.md. Read on 2026-11-06 on `release/v4.1.0` (`../server` at
`b562fc3fb1`, the server through CodeGraph).

Where the ban sits:

- Server: `FileSecurity.FilterEntryAsync` denies `UseChat`, `Vectorization`,
  `IndexExport`, `Copy`, `Duplicate` and `StartFilling` on a private room and
  on every entry inside one, active or archived
  (`products/ASC.Files/Core/Core/Security/FileSecurity.cs:1706-1718`); the
  comment there gives the reason: the server has no clear text to build an
  index or a vector from. A private AI agent is created today and the server
  proposes to refuse it (`private-rooms-server-hardening`, decision 27).
- Client: the AI chat button and the AI quick-action tiles are withheld on a
  private address and inside a private room (`private-rooms/sidebar-section`
  "No AI chat in the section", `private-rooms/room-membership` "No AI chat
  in private rooms"); the SDK never offers the chat on its private pages.
- Editor: the doceditor does not initialise the editor's AI plugin for an
  encrypted file (`packages/doceditor/src/hooks/useEditorEvents.ts:282-320`,
  `isEncrypted` next to the guest rule) and does not answer the plugin's
  "attach a file" requests for one
  (`packages/doceditor/src/components/Editor.tsx:203-211`).

Where clear text flows and rests in the AI paths of the portal today:

- The DocSpace AI chat (`@onlyoffice/ai-chat` in the browser) calls the
  portal's AI routes (`packages/shared/api/ai/index.ts`, `/api/2.0/ai/...`)
  and the portal's AI gateway, which forwards to the provider and applies the
  spending limits (`packages/shared/utils/ai/getServiceLimitChatError.ts`).
  Threads and attachments are stored in the portal's database
  (`DbChatMessage`, `ChatMessageAttachments`,
  `common/Tools/ASC.Migrations.Core/EF/MigrationContext.cs:141`).
- Vectorization of a Knowledge room reads the file on the server, splits it
  into chunks, embeds them through the provider and stores the chunks with
  their vectors in OpenSearch
  (`products/ASC.Files/Core/Vectorization/VectorizationTask.cs`,
  `Vectorization/Data/Chunk.cs`,
  `Vectorization/Embedding/OpenAiFloatEmbeddingGenerator.cs`,
  `common/services/ASC.ElasticSearch/VectorData/VectorStore.cs`, read by
  `products/ASC.AI/Core/Knowledge/KnowledgeSearchEngine.cs`).
- The editor's AI plugin takes the text from the document in the browser,
  but its model calls go through the same gateway (the doceditor skips the
  plugin for guests because the gateway refuses them), and a document it
  attaches is extracted to text by the AI service on the server
  (`packages/doceditor/src/utils/aiAttachFile.ts:46-63`).

```
  browser (clear text is here)       portal (must not see clear text)     provider
  +---------------------------+      +--------------------------------+   +-----+
  | editor + crypto add-on    |----->| AI gateway, spending limits    |-->| LLM |
  | DocSpace AI chat          |      | chat threads, attachments (DB) |   +-----+
  | doceditor key hook (DEK)  |      | VectorizationTask -> OpenSearch|
  +---------------------------+      +--------------------------------+
```

What the client already has for a browser-only path: the apps that render
the AI chat carry the provider SDKs as peers of `@onlyoffice/ai-chat`
(`@anthropic-ai/sdk`, `openai`, `@google/genai`, `@mistralai/mistralai` in
the `catalog:` of `pnpm-workspace.yaml`, declared by
`packages/client/package.json` and the SDK), and the doceditor resolves the
file key of an encrypted file for the editor
(`packages/doceditor/src/hooks/useFileEncryptionKeys.ts`,
`private-rooms/editor-integration`). Whether the library can call a provider
without the gateway, and what it uses the SDKs for, is spike 1.

Seen on the release stand `tests.onlyoffice.io` on 2026-11-06 (Document
Server 10.0.3.19): the editor's AI Tools tab is shown for an encrypted file.
Because the doceditor skips the plugin's initialisation, no portal model is
connected and AI Chat asks to "Connect an AI Model", but the plugin's own
Settings let the user add a provider key, after which Summarization,
Translation and the chat would send the clear text of the open document
from the browser to that provider. Option C below therefore already exists
de facto through the plugin, outside the client's control and without the
room-owner opt-in of decision 4. The editor configuration carries the
switch: `customization.ai.disabled` (`AiConfigDto`, set by the server for a
portal without AI and for anonymous visitors), so the ban reaches the
editor once the server sets it for an encrypted file
(`private-rooms-server-hardening`, task group 16, decision 29).

No stashed design document covers AI in private rooms; the ban predates the
AI chat.

## Goals / Non-Goals

**Goals:**
- Keep the promise as the server states it: no clear text of a private room
  on the server, in its database, its index or its gateway.
- Record the options with what each one shows to whom, so a later decision
  compares them on facts.

**Non-Goals:**
- Lifting the ban in any form now.
- Server-side AI over private rooms, in any phase.

## Decisions

1. **The ban stays (owner, 2026-11-06).** No phase is scheduled; this
   change holds the options. Alternative: schedule phase 1 for the beta;
   rejected, the beta's promise and its release notes would change while
   the server hardening of the same week closes the last clear-text leaks.

2. **A future integration keeps the portal out of the clear text.** The
   options are judged by where the clear text goes and where it rests:

   | Option | The portal sees | Rests on the portal | Promise |
   | --- | --- | --- | --- |
   | A. The ban (today) | nothing | nothing | kept |
   | B. Editor AI plugin on an encrypted file through the gateway | prompts and answers | the plugin's thread (spike 1) | broken; on SaaS the operator reads the text |
   | C. Browser to provider directly, history in the browser or as an encrypted file of the room | nothing | nothing | kept; the text reaches the provider the user chose |
   | D. Search in the browser: decryption, embedding and index in the browser, the index an encrypted file of the room | nothing | the index, wrapped like a file | kept; heavy, lower quality than the server's search |
   | E. Server chat, vectorization, agents with tools | everything | threads, chunks, vectors | broken |

   C is phase 1 and D phase 2 of the proposal; B is allowed as phase 3 on
   standalone portals only, where the model runs inside the customer's
   boundary; E is never. Alternative: a trusted execution environment on
   the server that decrypts under attestation; not considered, the portal
   has no such platform.

3. **The editor is the first surface.** The clear text and the file key are
   already in the browser there, the AI plugin already works on the open
   document, and attachments can be decrypted by the doceditor that holds
   the key, so phase 1 is the smallest change that keeps the promise.
   Alternative: the DocSpace AI chat first; rejected, its threads are
   stored on the server and its attachments are extracted there, so it
   needs a browser-side thread store and extractor before anything else.

4. **Opt-in per room, visible and audited.** Any phase is switched on by
   the room owner, shown to members (a badge next to the private one) and
   written to the audit trail, since the promise changes for that room.
   Alternative: a portal-wide setting; rejected, members of one room cannot
   see what an administrator decided for another.

5. **Private AI agents stay refused.** An agent runs its tools on the
   server, so a private agent cannot do what it is for; the server's
   proposed 400 (`private-rooms-server-hardening`, decision 8) is consistent
   with this change.

## Risks / Trade-offs

- [A direct provider call from the browser bypasses the gateway's spending
  limits and the operator's provider keys] → phase 1 is bring-your-own-key
  by design; the SaaS billing of AI does not apply to it, which product
  accepts or rejects before phase 1 is scheduled.
- [The provider sees the clear text] → it is the user's choice per room
  (decision 4) and the release notes name it; the portal keeps its promise.
- [In-browser embedding is heavy] → phase 2 is optional and may stay on the
  shelf; phase 1 does not depend on it.
- [The editor's AI plugin is Document Server code] → phase 1 needs the
  Document Server team: where the plugin stores its thread and whether it
  can be pointed at a provider directly (spike 1).

## Migration Plan

None now. A scheduled phase is proposed as its own change with specs and
tasks; this change is archived when the first of them is, or when the owner
decides the ban is permanent.

## Open Questions

- Spike 1: where the editor's AI plugin keeps its chat history, and whether
  its model calls can target a provider without the portal's gateway.
  Owner: Document Server team with the doceditor developer.
- Spike 2: whether the browser agent of `@onlyoffice/ai-chat` can call a
  provider directly with the user's key, and what it uses the provider SDKs
  for today. Owner: the ai-chat developer.
- Spike 3: an in-browser embedding model and the size of an index for a
  room of ordinary size, and the format of the index as an encrypted file.
  Owner: client.
- Product: whether a bring-your-own-key AI without the gateway is
  acceptable on SaaS, and how the promise is worded in the positioning
  documents of `private-rooms-release-gate` once a phase ships.
- Closed 2026-11-06: the editor hides its AI tools when the
  configuration says `customization.ai.disabled`; the server sets it for
  an encrypted file in `private-rooms-server-hardening` 16.1, and a phase
  of this change that switches AI on in the editor lifts that flag for
  the rooms that opted in.
