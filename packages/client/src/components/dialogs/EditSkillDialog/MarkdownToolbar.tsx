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
import { useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import type { TMarkdownAction } from "./markdown";

import styles from "./EditSkillDialog.module.scss";

type MarkdownToolbarProps = {
  isDisabled: boolean;
  onAction: (action: TMarkdownAction) => void;
};

const icon = (children: React.ReactNode) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const ICONS: Record<TMarkdownAction, React.ReactNode> = {
  bold: icon(
    <path d="M4.5 2.5h4a2.5 2.5 0 0 1 0 5h-4zM4.5 7.5h4.8a2.75 2.75 0 0 1 0 5.5H4.5z" />,
  ),
  italic: icon(<path d="M6.5 2.5h6M3.5 13.5h6M9.5 2.5l-3 11" />),
  heading: icon(<path d="M3 2.5v11M10 2.5v11M3 8h7M12.5 9.5l1.5-1v5" />),
  bulleted: icon(
    <>
      <path d="M6 4h7.5M6 8h7.5M6 12h7.5" />
      <circle cx="3" cy="4" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="3" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="3" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </>,
  ),
  numbered: icon(
    <path d="M6.5 4h7M6.5 8h7M6.5 12h7M2.5 3l1-.5v3M2.3 9.6c.3-.8 1.5-.8 1.6 0 .1.6-.7 1-1.6 1.9h1.8M2.3 12.7h1.2a.65.65 0 1 1 0 1.3h-.5" />,
  ),
  code: icon(<path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5" />),
  link: icon(
    <path d="M6.5 9.5a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1 1M9.5 6.5a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l1-1" />,
  ),
};

/** The formatting buttons over a skill's instructions, and the note that they are Markdown. */
const MarkdownToolbar = ({ isDisabled, onAction }: MarkdownToolbarProps) => {
  const { t } = useTranslation(["Common"]);

  const actions: { action: TMarkdownAction; label: string }[] = [
    { action: "bold", label: t("Common:MarkdownBold") },
    { action: "italic", label: t("Common:MarkdownItalic") },
    { action: "heading", label: t("Common:MarkdownHeading") },
    { action: "bulleted", label: t("Common:MarkdownBulletedList") },
    { action: "numbered", label: t("Common:MarkdownNumberedList") },
    { action: "code", label: t("Common:MarkdownCode") },
    { action: "link", label: t("Common:Link") },
  ];

  return (
    <div className={styles.toolbar} role="toolbar" data-testid="edit-skill-toolbar">
      {actions.map(({ action, label }) => (
        <button
          key={action}
          type="button"
          className={styles.toolbarButton}
          aria-label={label}
          title={label}
          disabled={isDisabled}
          // The editor keeps its selection: the button never takes the focus.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onAction(action)}
          data-testid={`edit-skill-toolbar-${action}`}
        >
          {ICONS[action]}
        </button>
      ))}
      <Text fontSize="11px" lineHeight="16px" className={styles.toolbarNote}>
        {t("Common:MarkdownSupported")}
      </Text>
    </div>
  );
};

export default MarkdownToolbar;
