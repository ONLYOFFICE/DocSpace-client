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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Text } from "@docspace/ui-kit/components/text";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import InfoPanelRoomEmptyScreenSvgUrl from "PUBLIC_DIR/images/emptyview/empty.rooms.info.light.svg?url";
import InfoPanelRoomEmptyScreenDarkSvgUrl from "PUBLIC_DIR/images/emptyview/empty.rooms.info.dark.svg?url";

import styles from "./NoAgentItem.module.scss";

const NoAgentItem = () => {
  const { isBase } = useTheme();
  const { t } = useTranslation(["Common"]);

  // Defer theme-dependent rendering until the client has mounted. The
  // server doesn't know the theme (negotiated client-side via the theme
  // header), so a direct `isBase ? Light : Dark` swap mismatches hydration
  // when the resolved theme isn't the default. Mount-gating forces SSR +
  // first client render to share one branch (light), then upgrades on
  // next render. Same pattern as AgentsEmptyView.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const useLightIcon = !mounted || isBase;

  const imageSrc = useLightIcon
    ? InfoPanelRoomEmptyScreenSvgUrl
    : InfoPanelRoomEmptyScreenDarkSvgUrl;

  return (
    <div
      className={classNames(
        styles.noItemContainer,
        "info-panel_gallery-empty-screen",
      )}
    >
      <div className="no-thumbnail-img-wrapper">
        {/* biome-ignore lint/performance/noImgElement: static SVG asset; next/image is unnecessary here */}
        <img
          src={imageSrc}
          alt={t("Common:NoAgent", {
            aiAgent: t("Common:AIAgent"),
            defaultValue: "No AI agent",
          })}
        />
      </div>
      <Text className="no-item-text" textAlign="center">
        {t("Common:AIAgentsEmptyScreenTent", {
          aiAgents: t("Common:AIAgents"),
          defaultValue: "Select an AI agent to start working with it.",
        })}
      </Text>
    </div>
  );
};

export default NoAgentItem;
