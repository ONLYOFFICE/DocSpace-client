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

import React from "react";

import { Tags } from "@onlyoffice/apps-ui-kit/components/tags";
import type { TagClickEvent, TagType } from "@onlyoffice/apps-ui-kit/components/tag";
import type { TAiProjectSource } from "@docspace/shared/api/ai/projects";

type SourceTagsProps = {
  rooms: TAiProjectSource[];
  /** How many tags fit before the rest fold into the "+N" tag. */
  columnCount?: number;
  className?: string;
};

const noop = () => {};

// A room the caller can no longer read (gone, or access lost) comes without
// a title, so it has nothing to show: the lists name the readable rooms only.
// An archived room keeps its title and stays listed.
const titledRooms = (rooms: TAiProjectSource[]) => rooms.filter((room) => room.available && room.title);

/** The linked rooms as the tags of a room render in the rooms list. */
export const SourceTags = ({ rooms, columnCount = 2, className }: SourceTagsProps) => {
  const shown = titledRooms(rooms);
  if (shown.length === 0) return null;
  return (
    <Tags
      className={className}
      tags={shown.map((room) => room.title)}
      columnCount={columnCount}
      onSelectTag={noop}
    />
  );
};

/** How many rooms a wrapped list shows before the rest fold into "+N". */
const VISIBLE_ROOMS = 3;
const MORE_KEY = "ai-project-more-rooms";

/**
 * The linked rooms as wrapped tags (the info panel): the first three, then a
 * "+N" tag that shows the others in place.
 */
export const SourceTagList = ({ rooms, className }: { rooms: TAiProjectSource[]; className?: string }) => {
  const [expanded, setExpanded] = React.useState(false);
  const titles = React.useMemo(() => titledRooms(rooms).map((room) => room.title), [rooms]);
  const hidden = titles.length - VISIBLE_ROOMS;
  const more = `+${hidden}`;
  // A stable array: the tags are laid out again whenever it changes.
  const tags = React.useMemo<(string | TagType)[]>(
    () =>
      expanded || hidden <= 0 ? titles : [...titles.slice(0, VISIBLE_ROOMS), { key: MORE_KEY, label: more }],
    [expanded, hidden, titles, more],
  );
  const onSelectTag = React.useCallback(
    (tag: TagClickEvent) => {
      if (tag.label === more) setExpanded(true);
    },
    [more],
  );
  if (titles.length === 0) return null;
  return <Tags className={className} tags={tags} columnCount={-1} onSelectTag={onSelectTag} />;
};

/** The rooms as one line of names, for the row view's side info. */
export const sourceNames = (rooms: TAiProjectSource[]) =>
  titledRooms(rooms)
    .map((room) => room.title)
    .join(", ");

export default SourceTags;
