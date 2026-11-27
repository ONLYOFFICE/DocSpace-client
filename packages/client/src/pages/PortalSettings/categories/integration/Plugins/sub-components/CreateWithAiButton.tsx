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

import { observer } from "mobx-react";
import { useLocation, useNavigate } from "react-router";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea } from "@docspace/shared/enums";
import type { TTranslation } from "@docspace/shared/types";

import { useStore } from "SRC_DIR/store/useStore";

import styles from "../Plugins.module.scss";

/**
 * "Create with AI": opens the AI chat fullscreen, over the agents list, in a
 * new conversation whose composer already asks for a plugin. The chat's
 * model then asks what the plugin is to do and builds it with its plugin
 * tools, which the server offers to the owner and DocSpace admins only.
 *
 * Shown where AI can be used at all: the services on, the plan paid and AI
 * not known to be unconfigured. Whether the installation runs a plugin agent
 * is not something the client is told.
 */
const CreateWithAiButton = ({ t }: { t: TTranslation }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { aiServicesEnabled, aiReady } = useStore("settingsStore");
  const { isNotPaidPeriod } = useStore("currentTariffStatusStore");
  const { requestAiChatPage } = useStore("dialogsStore");
  const userId = useStore("userStore").user?.id;

  if (!aiServicesEnabled || isNotPaidPeriod || aiReady === false || !userId)
    return null;

  const onClick = () => {
    // The chat opens once this page is left: the settings have no chat.
    requestAiChatPage(
      "chat",
      location.key,
      undefined,
      t("WebPlugins:CreateWithAIPrompt"),
    );
    const filter = RoomsFilter.getDefault(userId, RoomSearchArea.AiHub);
    filter.searchArea = RoomSearchArea.AiHub;
    navigate(`/ai-rooms/filter?${filter.toUrlParams(userId, false)}`);
  };

  return (
    <Button
      className={styles.createWithAiButton}
      label={t("WebPlugins:CreateWithAI")}
      size={ButtonSize.small}
      onClick={onClick}
      testId="create_plugin_with_ai_button"
    />
  );
};

export default observer(CreateWithAiButton);
