/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ProviderType, ServerType } from "@docspace/ui-kit/enums/ai";

export { ProviderType, ServerType };

// The chat-lib profile `providerType` value of the built-in system (portal)
// provider. Must match the "onlyoffice" member of `BuiltinProviderType` in
// @onlyoffice/ai-chat — the union also accepts arbitrary strings, so a typo
// at a call site would not fail typechecking.
export const SYSTEM_AI_PROFILE_PROVIDER_TYPE = "onlyoffice";

// The chat-lib profile `providerType` of OpenRouter — the only gateway a
// standalone portal can reach the models we recommend through (the system
// provider above is hidden there; on SaaS it is the other way round, the
// models come with the portal's own AI). Same typing caveat as the constant
// above.
export const OPENROUTER_AI_PROFILE_PROVIDER_TYPE = "openrouter";

// Bit flags of the chat-lib profile `capabilities` field. Must match
// `CapabilitiesUI` in @onlyoffice/ai-chat and the C# `Capabilities` enum in
// ASC.AI.Integration — the field travels end-to-end as a plain number.
export const ProfileCapabilities = {
  Chat: 0x01,
  Image: 0x02,
  Embeddings: 0x04,
  Audio: 0x08,
  Vision: 0x80,
  Tools: 0x100,
} as const;

// Whether a chat-lib profile can drive a chat round. Mirrors the chat lib's
// own model pickers: a profile with no `capabilities` set is allowed (older
// providers never report them), an explicit mask must carry the Chat bit —
// image-only gateway models (e.g. Nano Banana) otherwise fail every send
// with an upstream `model_not_found` (Bug 82663).
export function isChatCapableProfile(profile: {
  capabilities?: number;
}): boolean {
  return (
    !profile.capabilities ||
    (profile.capabilities & ProfileCapabilities.Chat) !== 0
  );
}

export enum ToolsPermission {
  Allow,
  AlwaysAllow,
  Deny,
}

export enum WebSearchType {
  None,
  Exa,
  PortalAi,
}

export enum KnowledgeType {
  None,
  OpenAi,
  OpenRouter,
  PortalAi,
}
