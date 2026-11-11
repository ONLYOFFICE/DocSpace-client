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


import { AnimationEvents } from "@onlyoffice/apps-ui-kit/hooks/useAnimation";

type TLinkEntry = {
  linkData?: { path: string };
  // biome-ignore lint/suspicious/noExplicitAny: NavMenu's item and sub-item handlers differ in their arguments and result
  onClick?: (...args: any[]) => any;
};

/** The page in the address bar, as a sidebar entry's `linkData.path` names it. */
const currentPage = () => `${window.location.pathname}${window.location.search}`;

/**
 * NavMenu fills a clicked entry's highlight most of the way and waits for the
 * page to say it has loaded (`END_ANIMATION`) before finishing it; each
 * section says so once its content is read. An entry that opens the page
 * already on screen loads nothing - Agents from the chat over the agents
 * list, the open project, Home on the dashboard - so nothing says it, and
 * the fill stops short. Such a click finishes the fill itself.
 *
 * Only an entry that names its page (`linkData`) can be told apart; one
 * without opens something of its own and reports it there.
 */
export const endAnimationOnSamePage = <E extends TLinkEntry>(entry: E): E => {
  const path = entry.linkData?.path;
  if (!path) return entry;
  const handler = entry.onClick;
  return {
    ...entry,
    onClick: (...args: unknown[]) => {
      // Read before the handler: a link navigates during the click.
      const isSamePage = currentPage() === path;
      const result = handler?.(...args);
      // After NavMenu has started the fill and listens for its end.
      if (isSamePage)
        window.setTimeout(() =>
          window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION)),
        );
      return result;
    },
  };
};
