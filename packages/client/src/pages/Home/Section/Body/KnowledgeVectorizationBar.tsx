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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import PublicRoomBar from "@onlyoffice/apps-ui-kit/components/public-room-bar";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";
import { RoomsType } from "@docspace/shared/enums";
import { AI_SETTINGS_URL } from "SRC_DIR/helpers/constants";

type KnowledgeVectorizationBarProps = {
  isKnowledgeRoom: boolean;
  /** Vectorization is on for the portal (an embeddings provider is configured). */
  vectorizationEnabled: boolean;
  /** Portal owner or DocSpace admin: may configure the provider. */
  isAdmin: boolean;
};

/**
 * The bar at the top of a Knowledge room while vectorization is off on the
 * portal: nothing new gets indexed, so uploads are blocked and the room
 * cannot be searched. An admin is pointed to the AI settings, anyone else
 * to the admin. Renders nothing elsewhere or while vectorization is on.
 */
const KnowledgeVectorizationBar = ({
  isKnowledgeRoom,
  vectorizationEnabled,
  isAdmin,
}: KnowledgeVectorizationBarProps) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();

  if (!isKnowledgeRoom || vectorizationEnabled) return null;

  const bodyText = isAdmin ? (
    <>
      {t("Common:KnowledgeRoomVectorizationOffAdmin")}{" "}
      <Link
        type={LinkType.action}
        isHovered
        fontWeight={600}
        onClick={() => navigate(AI_SETTINGS_URL)}
        dataTestId="knowledge_vectorization_bar_settings"
      >
        {t("Common:GoToSettings")}
      </Link>
    </>
  ) : (
    t("Common:KnowledgeRoomVectorizationOffUser")
  );

  return (
    <PublicRoomBar
      headerText={t("Common:KnowledgeRoomVectorizationOffTitle")}
      bodyText={bodyText}
      iconName={InfoReactSvgUrl}
      barIsVisible
      live
      dataTestId="knowledge_vectorization_bar"
    />
  );
};

export default inject(({ selectedFolderStore, settingsStore, userStore }: TStore) => ({
  isKnowledgeRoom: selectedFolderStore.roomType === RoomsType.KnowledgeRoom,
  // The AI config is read only while AI services are on; without it the
  // room is left as it is.
  vectorizationEnabled: settingsStore.aiConfig?.vectorizationEnabled !== false,
  isAdmin: !!(userStore.user?.isOwner || userStore.user?.isAdmin),
}))(observer(KnowledgeVectorizationBar));
