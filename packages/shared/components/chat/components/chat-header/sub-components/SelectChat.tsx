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
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import SelectSessionReactSvg from "PUBLIC_DIR/images/select.session.react.svg";

import { DropDown } from "../../../../drop-down";
import { DropDownItem } from "../../../../drop-down-item";

import { useMessageStore } from "../../../store/messageStore";
import { SelectChatProps } from "../../../types";
import { getChateTranslationDate } from "../../../utils";

import styles from "../ChatHeader.module.scss";

const SelectChat = ({ isFullScreen, currentDeviceType }: SelectChatProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const {
    selectSession,
    isSelectSessionOpen,
    setIsSelectSessionOpen,
    preparedMessages,
    isRequestRunning,
  } = useMessageStore();

  const { t } = useTranslation(["Common"]);

  const toggleOpen = () => {
    if (isRequestRunning) return;

    if (isFullScreen && currentDeviceType === "desktop") {
      setIsSelectSessionOpen(!isSelectSessionOpen);

      return;
    }

    setIsOpen((value) => !value);
  };

  const onSelectAction = (session: string) => {
    if (isRequestRunning) return;

    selectSession(session);
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.selectChat} onClick={toggleOpen} ref={parentRef}>
        <SelectSessionReactSvg />
      </div>
      {isOpen ? (
        <DropDown
          open={isOpen}
          // isDefaultMode
          zIndex={500}
          clickOutsideAction={() => setIsOpen(false)}
          directionY="bottom"
          directionX="right"
          topSpace={16}
          forwardedRef={parentRef}
          maxHeight={300}
          manualWidth="280px"
          isNoFixedHeightOptions
        >
          {preparedMessages.map(({ title, value, isActive, isDate }) => {
            const currentTitle =
              !isDate || title ? title : getChateTranslationDate(t, value);

            if (!currentTitle) return null;

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
        </DropDown>
      ) : null}
    </>
  );
};

export default observer(SelectChat);
