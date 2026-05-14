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

