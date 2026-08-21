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

// Per-app promo content. The generic `AppPromoDialog` is layout-only; each app
// drops an entry here. To add another app's promo, import its four feature
// icons + light/dark illustration and append a new key — nothing else changes.
// Feature icons are SVG-as-component; the previews are PNGs, imported as URLs
// and rendered as an `<img>`.
// `tourLabel` is what marks an app as having an onboarding tour to offer; leave
// it out for an app that has none.
//
// Texts are localized here via literal `t("Common:Key")` calls so the locales
// scanner captures the keys; the dialog receives already-resolved strings.

import type { TTranslation } from "@docspace/shared/types";

import FilesManagementIcon from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg";
import FilesSearchIcon from "PUBLIC_DIR/images/search.react.svg";
import FilesPermissionsIcon from "PUBLIC_DIR/images/edit.index.react.svg";
import FilesAccessIcon from "PUBLIC_DIR/images/security.react.svg";
import FilesPreviewLight from "PUBLIC_DIR/images/app-promo/files.preview.light.png";
import FilesPreviewDark from "PUBLIC_DIR/images/app-promo/files.preview.dark.png";

import CollaborationRoomIcon from "PUBLIC_DIR/images/pencil.react.svg";
import PublicRoomIcon from "PUBLIC_DIR/images/universe.react.svg";
import VDRRoomIcon from "PUBLIC_DIR/images/vdr.room.react.svg";
import CustomRoomIcon from "PUBLIC_DIR/images/icons/16/catalog.favorites.react.svg";
import RoomsPreviewLight from "PUBLIC_DIR/images/app-promo/rooms.preview.light.png";
import RoomsPreviewDark from "PUBLIC_DIR/images/app-promo/rooms.preview.dark.png";

import AIPoweredIcon from "PUBLIC_DIR/images/icons/16/catalog.ai-agents.react.svg";
import SharingIcon from "PUBLIC_DIR/images/icons/16/catalog.shared.outline.svg";
import DataIcon from "PUBLIC_DIR/images/data.icon.react.svg";
import BuiltInIcon from "PUBLIC_DIR/images/stats.react.svg";
import FormsPreviewLight from "PUBLIC_DIR/images/app-promo/forms.preview.light.png";
import FormsPreviewDark from "PUBLIC_DIR/images/app-promo/forms.preview.dark.png";

import GenerateIcon from "PUBLIC_DIR/images/form.fill.rect.svg";
import SharedAgentsIcon from "PUBLIC_DIR/images/icons/16/catalog.accounts.react.svg";
import CustomStackIcon from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg";
import MCPIcon from "PUBLIC_DIR/images/icons/16/catalog.devtools-api.react.svg";
import AgentsPreviewLight from "PUBLIC_DIR/images/app-promo/agents.preview.light.png";
import AgentsPreviewDark from "PUBLIC_DIR/images/app-promo/agents.preview.dark.png";

import type { AppPromoContentMap } from "./AppPromoDialog.types";

export const getAppPromoContent = (t: TTranslation): AppPromoContentMap => ({
  "ai-files": {
    title: t("Common:Files"),
    subtitle: t("Common:FilesPromoSubtitle"),
    description: t("Common:FilesPromoDescription"),
    features: [
      {
        Icon: FilesManagementIcon,
        title: t("Common:FileManagementPromoTitle"),
        description: t("Common:FileManagementPromoDescription"),
      },
      {
        Icon: FilesSearchIcon,
        title: t("Common:FilesQuickSearchTitle"),
        description: t("Common:FilesQuickSearchDescription"),
      },
      {
        Icon: FilesPermissionsIcon,
        title: t("Common:FilesPermissionsTitle"),
        description: t("Common:FilesPermissionsDescription"),
      },
      {
        Icon: FilesAccessIcon,
        title: t("Common:AccessControlTitle"),
        description: t("Common:AccessControlDescription"),
      },
    ],
    illustrationLight: FilesPreviewLight,
    illustrationDark: FilesPreviewDark,
    openLabel: t("Common:Open"),
    tourLabel: t("Common:WelcomeStartTour"),
    githubLabel: t("Common:ViewOnGithub"),
    githubUrl: "https://github.com/ONLYOFFICE/DocSpace",
  },
  "ai-rooms": {
    title: t("Common:Rooms"),
    subtitle: t("Common:RoomsPromoSubtitle"),
    description: t("Common:RoomsPromoDescription"),
    features: [
      {
        Icon: CollaborationRoomIcon,
        title: t("Common:ColloborationRooms"),
        description: t("Common:ColloborationRoomsDescription"),
      },
      {
        Icon: PublicRoomIcon,
        title: t("Common:PublicRooms"),
        description: t("Common:PublicRoomsDescription"),
      },
      {
        Icon: VDRRoomIcon,
        title: t("Common:VDRRooms"),
        description: t("Common:VDRRoomsDescription"),
      },
      {
        Icon: CustomRoomIcon,
        title: t("Common:CustomRoomsTitle"),
        description: t("Common:CustomRoomsDesctiprion"),
      },
    ],
    illustrationLight: RoomsPreviewLight,
    illustrationDark: RoomsPreviewDark,
    openLabel: t("Common:Open"),
    tourLabel: t("Common:WelcomeStartTour"),
    githubLabel: t("Common:ViewOnGithub"),
    githubUrl: "https://github.com/ONLYOFFICE/DocSpace",
  },
  "ai-forms": {
    title: t("Common:Forms"),
    subtitle: t("Common:FormsPromoSubtitle"),
    description: t("Common:FormsPromoDescription"),
    features: [
      {
        Icon: AIPoweredIcon,
        title: t("Common:AIPowered"),
        description: t("Common:AIPoweredDescription"),
      },
      {
        Icon: SharingIcon,
        title: t("Common:EasySharing"),
        description: t("Common:EasySharingDescription"),
      },
      {
        Icon: DataIcon,
        title: t("Common:CentralizedData"),
        description: t("Common:CentralizedDataDescription"),
      },
      {
        Icon: BuiltInIcon,
        title: t("Common:BuiltInInsights"),
        description: t("Common:BuiltInInsightsDescription"),
      },
    ],
    illustrationLight: FormsPreviewLight,
    illustrationDark: FormsPreviewDark,
    openLabel: t("Common:Open"),
    tourLabel: t("Common:WelcomeStartTour"),
    githubLabel: t("Common:ViewOnGithub"),
    githubUrl: "https://github.com/ONLYOFFICE/DocSpace",
  },
  "ai-agents": {
    title: t("Common:AIAgents"),
    subtitle: t("Common:AIAgentsPromoSubtitle"),
    description: t("Common:AIAgentsPromoDescription"),
    features: [
      {
        Icon: GenerateIcon,
        title: t("Common:GenerateAndSummarize"),
        description: t("Common:GenerateAndSummarizeDescription"),
      },
      {
        Icon: DataIcon,
        title: t("Common:DocumentAwareAI"),
        description: t("Common:DocumentAwareAIDescription"),
      },
      {
        Icon: SharedAgentsIcon,
        title: t("Common:SharedAgents"),
        description: t("Common:SharedAgentsDescription"),
      },
      {
        Icon: CustomStackIcon,
        title: t("Common:CustomAIStack"),
        description: t("Common:CustomAIStackDescription"),
      },
      {
        Icon: MCPIcon,
        title: t("Common:MCPIntegration"),
        description: t("Common:MCPIntegrationDescription"),
      },
    ],
    illustrationLight: AgentsPreviewLight,
    illustrationDark: AgentsPreviewDark,
    openLabel: t("Common:Open"),
    tourLabel: t("Common:WelcomeStartTour"),
    githubLabel: t("Common:ViewOnGithub"),
    githubUrl: "https://github.com/ONLYOFFICE/DocSpace",
  },
});

