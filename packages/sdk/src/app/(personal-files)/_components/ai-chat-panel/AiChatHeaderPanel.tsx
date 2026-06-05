/**
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
 */

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { DeviceType } from "@docspace/shared/enums";
import { useStores } from "@docspace/ui-kit/ai-agent/providers";
import { AiChatPanelHeader } from "@docspace/ui-kit/ai-agent/ai-chat-panel";
import { useAiChatStore } from "@docspace/ui-kit/ai-agent/providers/ai-chat-store";

import useDeviceType from "@/hooks/useDeviceType";

export const DocsChatHeaderPanel = observer(() => {
  const { t } = useTranslation(["Common"]);
  const store = useAiChatStore();
  const stores = useStores();
  const goToChat = stores.useRouter((s) => s.goToChat);

  // On tablet/mobile the chat panel always occupies the full screen, so the
  // fullscreen toggle is redundant — omitting the handler hides the button.
  const { currentDeviceType } = useDeviceType();
  const isMobileOrTablet = currentDeviceType !== DeviceType.desktop;

  // On settings/initial-setup pages with profiles configured: drop back
  // to chat but keep the panel open. Without profiles: close the panel
  // (the setup CTA had nowhere left to send the user). On any other page
  // (chat/history/…): reset upstream router AND close the panel.
  const handleClose = () => {
    if (store.isOnSettingsPage) {
      if (store.hasProfiles) goToChat();
      else store.close();
      return;
    }
    goToChat();
    store.close();
  };

  return (
    <AiChatPanelHeader
      title={t("Common:AIChatButton")}
      onClose={handleClose}
      isFullscreen={store.effectiveFullscreen}
      onToggleFullscreen={
        isMobileOrTablet ? undefined : store.toggleFullscreen
      }
      isFullscreenToggleDisabled={store.isFullscreenToggleDisabled}
    />
  );
});

