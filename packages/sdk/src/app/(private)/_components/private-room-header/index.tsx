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

// PARITY-SOURCE: packages/client/src/pages/Home/Section/Header/index.js
// PARITY-REVIEW: Required when source changes. Last reviewed: 2026-05-27 by Ilya Oleshko
// NOTE: A focused header wrapper — reuses (docspace)/Header and just injects
// the encrypted-room titleIcon + tooltip via the additive titleIcon/Tooltip
// props (see SDK_PRIVATE_PLAN.md §7.3). The full main-client Header (~1400
// lines) carries too much public-room baggage to fork verbatim; we lean on
// the SDK base instead so navigation/breadcrumbs stay in sync automatically.

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import EncryptedRoomIconUrl from "PUBLIC_DIR/images/icons/16/security.react.svg?url";

import Header, { type HeaderProps } from "@/app/(docspace)/_components/header";

type PrivateRoomCurrent = HeaderProps["current"] & { private?: boolean };

type PrivateRoomHeaderProps = Omit<HeaderProps, "current" | "titleIcon" | "titleIconTooltip"> & {
  current: PrivateRoomCurrent;
};

const PrivateRoomHeader: React.FC<PrivateRoomHeaderProps> = (props) => {
  const { t } = useTranslation(["Common"]);
  const isEncrypted = props.current?.private === true;

  const titleIcon = isEncrypted ? EncryptedRoomIconUrl : "";
  const titleIconTooltip = isEncrypted ? t("Common:EncryptedRoomTooltip") : "";

  return (
    <Header
      {...props}
      titleIcon={titleIcon}
      titleIconTooltip={titleIconTooltip}
    />
  );
};

export default PrivateRoomHeader;
