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

// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";

import SdkIframe from "SRC_DIR/components/SdkIframe";

import {
  useSdkFrameContext,
  type FrameEntry,
  type SdkNavigateExtra,
} from "./SdkFrameContext";
import styles from "./SdkFrameHost.module.scss";

type FrameSlotProps = {
  entry: FrameEntry;
  // Outgoing frame kept on screen, dimmed, while the incoming loads.
  dimmed: boolean;
  // Incoming frame stacked above the dimmed outgoing, invisible until ready.
  hidden: boolean;
  onReady: (appId: string) => void;
};

const FrameSlot = ({ entry, dimmed, hidden, onReady }: FrameSlotProps) => {
  // Stable wrappers read the live callback ref, so the iframe never remounts
  // when the owning page re-renders with new closures.
  const handleNavigate = React.useCallback(
    (section: string, extra?: SdkNavigateExtra) =>
      entry.callbacksRef.current.onNavigate?.(section, extra),
    [entry],
  );
  const handleFilterSearch = React.useCallback(
    (search: string) => entry.callbacksRef.current.onFilterSearch?.(search),
    [entry],
  );
  const handleAppReady = React.useCallback(() => {
    entry.callbacksRef.current.onAppReady?.();
    onReady(entry.appId);
  }, [entry, onReady]);

  const className = [
    styles.slot,
    dimmed ? styles.dimmed : "",
    hidden ? styles.hidden : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <SdkIframe
        apiRef={entry.apiRef}
        src={entry.src}
        title={entry.title}
        onNavigate={handleNavigate}
        onFilterSearch={handleFilterSearch}
        onAppReady={handleAppReady}
      />
    </div>
  );
};

/**
 * Persistent host that owns the SDK iframe(s). At rest it shows one frame;
 * during an app switch it keeps the outgoing frame dimmed while the incoming
 * loads underneath (stacked on top, invisible), then reveals the incoming and
 * unmounts the outgoing on `onAppReady`. Slots are keyed by `appId` so React
 * keeps each iframe mounted across host re-renders.
 */
export const SdkFrameHost = () => {
  const { state, markReady } = useSdkFrameContext();
  const { current, incoming } = state;

  if (!current && !incoming) return null;

  return (
    <div className={styles.host}>
      {current ? (
        <FrameSlot
          key={current.appId}
          entry={current}
          dimmed={!!incoming}
          hidden={false}
          onReady={markReady}
        />
      ) : null}
      {incoming ? (
        <FrameSlot
          key={incoming.appId}
          entry={incoming}
          dimmed={false}
          hidden
          onReady={markReady}
        />
      ) : null}
    </div>
  );
};

export default SdkFrameHost;
