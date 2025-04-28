// (c) Copyright Ascensio System SIA 2009-2025
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
import { observer } from "mobx-react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { Scrollbar } from "../../../scrollbar";
import { DropDownItem } from "../../../drop-down-item";

import { useMessageStore } from "../../store/messageStore";

import ChatHeader from "../chat-header";

import styles from "./ChatBody.module.scss";
import { ChatBodyProps } from "./ChatBody.types";

const ChatBody = ({
  children,
  isFullScreen,
  currentDeviceType,
}: ChatBodyProps) => {
  const { preparedMessages, selectSession } = useMessageStore();

  const { t } = useTranslation(["Common"]);

  const onSelectAction = (session: string) => {
    selectSession(session);
  };

  return (
    <div className={styles.chatBody}>
      {isFullScreen &&
      currentDeviceType === "desktop" &&
      preparedMessages.length > 0 ? (
        <div className={styles.selectSessionContainer}>
          <ChatHeader
            isPanel
            isFullScreen={isFullScreen}
            currentDeviceType={currentDeviceType}
          />

          <Scrollbar className={styles.container}>
            <div className={styles.container}>
              {preparedMessages.map(({ title, value, isActive, isDate }) => {
                const currentTitle =
                  !isDate || title
                    ? title
                    : value === "today"
                      ? t("Common:Today")
                      : value === "yesterday"
                        ? t("Common:Yesterday")
                        : "";

                return (
                  <DropDownItem
                    key={value}
                    onClick={() => {
                      if (!isDate) onSelectAction(value);
                    }}
                    className={classNames("drop-down-item", {
                      [styles.dropDownItemDate]: isDate,
                    })}
                    isActive={isActive}
                    noHover={isDate}
                  >
                    {currentTitle}
                  </DropDownItem>
                );
              })}
            </div>
          </Scrollbar>
        </div>
      ) : null}
      <div className={styles.chatBodyContainer}>{children}</div>
    </div>
  );
};

export default observer(ChatBody);
