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

import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import AiSvg from "@docspace/ui-kit/assets/icons/16/AI.svg";
import AIAgentsSelector from "@docspace/ui-kit/selectors/AIAgent";
import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { Events } from "@docspace/ui-kit/enums";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";

import { InfoPanelEvents } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { Nullable } from "@docspace/shared/types";

import styles from "./AIAgentsDialog.module.scss";

type RoomEditEvent = Event & {
  item: TRoom;
  cb: (updatedRoom: TRoom) => void;
};

type AIAgentsDialogOwnProps = {
  onClose: () => void;
  onSubmit: (items: TSelectorItem[]) => void;
  withPadding?: boolean;
  withSearch?: boolean;
};

type AIAgentsDialogInjectedProps = {
  infoPanelRoomSelection: Nullable<TRoom>;
};

type AIAgentsDialogProps = AIAgentsDialogOwnProps & AIAgentsDialogInjectedProps;

const AIAgentsDialogComponent = ({
  onClose,
  onSubmit,
  infoPanelRoomSelection,
  ...rest
}: AIAgentsDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const [connectDbBannerDismissed, setConnectDbBannerDismissed] =
    useState(false);

  const room = infoPanelRoomSelection;
  const showConnectDb =
    !connectDbBannerDismissed &&
    Boolean(room?.security?.EditRoom) &&
    !room?.sendFormToExternalDB;

  const handleConnectDatabase = () => {
    if (!room) return;

    const event = new Event(Events.ROOM_EDIT) as RoomEditEvent;
    event.item = room;
    event.cb = (updatedRoom) => {
      window.dispatchEvent(
        new CustomEvent(InfoPanelEvents.setInfoPanelSelectedRoom, {
          detail: { room: updatedRoom },
        }),
      );
    };
    window.dispatchEvent(event);
  };

  const externalInfoBarData = showConnectDb
    ? {
        icon: <AiSvg className={styles.aiIcon} />,
        title: t("AIFeature"),
        onClose: () => setConnectDbBannerDismissed(true),
        description: (
          <>
            <Text className={styles.text}>{t("AnalyzeResponsesFaster")}</Text>
            <Link
              textDecoration="underline"
              fontWeight={600}
              color="accent"
              onClick={handleConnectDatabase}
            >
              {t("ConnectDatabase")}
            </Link>
          </>
        ),
      }
    : undefined;

  return (
    <AIAgentsSelector
      {...rest}
      onClose={onClose}
      onSubmit={onSubmit}
      externalInfoBarData={externalInfoBarData}
    />
  );
};

export const AIAgentsDialog = inject<
  TStore,
  AIAgentsDialogOwnProps,
  AIAgentsDialogInjectedProps
>(({ infoPanelStore }) => ({
  infoPanelRoomSelection: infoPanelStore.infoPanelRoomSelection,
}))(observer(AIAgentsDialogComponent));

