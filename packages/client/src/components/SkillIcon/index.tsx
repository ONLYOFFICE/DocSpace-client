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
import classNames from "classnames";

import { RoomsType } from "@docspace/shared/enums";

import styles from "./SkillIcon.module.scss";

type SkillIconProps = {
  /** A skill set (the book on a tinted square) or one skill of a set (the scroll). */
  kind: "set" | "skill";
  /** The side of the icon's box, in pixels. */
  size?: number;
  className?: string;
  dataTestId?: string;
};

/**
 * A room drawn with the skill set icon: every Instructions room. Skill sets
 * are not told apart by a picture, a colour or initials, so a logo stored
 * for the room is not shown, and none can be set.
 */
export const isSkillSetIconRoom = (room: {
  isRoom?: boolean;
  roomType?: RoomsType | number | null;
}): boolean => !!room.isRoom && room.roomType === RoomsType.InstructionsRoom;

const SET_PATHS = (
  <>
    <path d="M3.5 12.8V3.3c0-.7.6-1.3 1.3-1.3h7.7v9.8H4.8c-.7 0-1.3.5-1.3 1.2s.6 1.2 1.3 1.2h7.7" />
    <path d="M6.2 5h3.8M6.2 7.2h3.8" />
  </>
);

const SKILL_PATHS = (
  <>
    <path d="M5 2h7.5v9.3" />
    <path d="M5 2a1.5 1.5 0 0 0-1.5 1.5V5H5" />
    <path d="M5 2v10.6A1.4 1.4 0 0 0 6.4 14h6.2a1.4 1.4 0 0 0 1.4-1.4v-1.3H7.8v1.3A1.4 1.4 0 0 1 6.4 14" />
    <path d="M7 5h3.5M7 7.5h3.5" />
  </>
);

/**
 * The icon of a skill set or of a skill, the same for every one of them:
 * the sets are not told apart by a colour or initials, as rooms are, and a
 * skill is not shown as the Markdown file that holds it.
 */
const SkillIcon = ({ kind, size = 32, className, dataTestId }: SkillIconProps) => {
  const isSet = kind === "set";
  // The book takes half of its square; the scroll, with no square behind
  // it, three quarters of a large box and half of a row's one.
  const glyph = isSet || size <= 32 ? size / 2 : size * 0.75;
  // The lines stay about a pixel and a half thick whatever the size.
  const strokeWidth = Math.max(0.9, (1.6 * 16) / Math.max(glyph, 16));

  return (
    <span
      aria-hidden="true"
      className={classNames(styles.icon, { [styles.set]: isSet }, className)}
      style={{
        width: size,
        height: size,
        borderRadius: isSet ? Math.round(size / 6) : undefined,
      }}
      data-testid={dataTestId ?? `skill-icon-${kind}`}
    >
      <svg
        viewBox="0 0 16 16"
        width={glyph}
        height={glyph}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isSet ? SET_PATHS : SKILL_PATHS}
      </svg>
    </span>
  );
};

export default SkillIcon;
