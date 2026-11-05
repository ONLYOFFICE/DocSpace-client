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

import RemoveSessionSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TickSvgUrl from "PUBLIC_DIR/images/tick.svg?url";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";
import { globalColors } from "@onlyoffice/apps-ui-kit/providers/theme/themes";

import type { TActiveSession } from "SRC_DIR/store/SettingsSetupStore";

import styles from "../../active-sessions.module.scss";

type TCellProps = { session: TActiveSession };

/** The platform, the browser, and a tick on the current session. */
export const SessionCell = ({
  session,
  isCurrent,
}: TCellProps & { isCurrent: boolean }) => (
  <>
    <Text className={styles.sessionPlatform} dataTestId="session_platform">
      {session.platform}
    </Text>
    <Text className={styles.sessionInfo} dataTestId="session_browser">
      {`(${session.browser})`}
    </Text>
    {isCurrent ? (
      <IconButton
        size={12}
        className={styles.tickIcon}
        color={globalColors.tickColor}
        iconName={TickSvgUrl}
      />
    ) : null}
  </>
);

export const DateCell = ({
  session,
  locale,
}: TCellProps & { locale: string }) => (
  <Text className={styles.sessionInfo} truncate dataTestId="session_date">
    {getCorrectDate(locale, session.date)}
  </Text>
);

export const LocationCell = ({ session }: TCellProps) => {
  const { country, city, ip } = session;

  return (
    <Text className={styles.sessionInfo} truncate dataTestId="session_location">
      {country || city ? (
        <>
          {country}
          {country && city ? ", " : null}
          {city}
          {ip ? <span className={styles.rowDivider} /> : null}
        </>
      ) : null}
      {ip}
    </Text>
  );
};

export const RemoveCell = ({
  session,
  onRemove,
}: TCellProps & { onRemove: (session: TActiveSession) => void }) => (
  <IconButton
    size={20}
    iconName={RemoveSessionSvgUrl}
    isClickable
    onClick={() => onRemove(session)}
    dataTestId="session_remove_icon_button"
  />
);
