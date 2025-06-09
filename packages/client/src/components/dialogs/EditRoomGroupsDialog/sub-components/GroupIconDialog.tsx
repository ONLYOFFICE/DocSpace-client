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
import uniqueId from "lodash/uniqueId";
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import {
  mobile,
  tablet,
  isMobile,
  isDesktop,
  isTablet,
  size,
} from "@docspace/shared/utils";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import { CoverDialogProps } from "./RoomLogoCoverDialog.types";
import { SelectIcon } from "./SelectIcon";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import styles from "../EditRoomGroupsDialog.module.scss";

const RoomLogoCoverContainer = styled.div`
  color: ${(props) => props.theme.logoCover.textColor};
  .room-logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
    padding-right: 16px;
  }

  .color-select-container {
    margin-bottom: 16px;
  }

  .color-name {
    font-weight: 600;
    font-size: 13px;
    line-height: 20px;
    padding-bottom: 8px;
  }
  .colors-container {
    flex-wrap: nowrap;
  }

  .colors-container,
  .cover-icon-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    box-sizing: border-box;
    width: 390px;
  }

  @media ${mobile} {
    .cover-icon-container {
      width: 100%;
      align-items: center;
      text-align: center;
    }

    .color-name {
      text-align: center;
    }

    .room-logo-container {
      padding-right: 0px;
    }

    .icon-select-container {
      text-align: center;
    }
    .colors-container {
      width: 100%;
    }

    .colors-container,
    .cover-icon-container {
      gap: 16px;
    }
  }

  .cover-icon-container,
  .color-name {
    user-select: none;
  }
`;

const GroupIconDialog = ({
  getCovers,
  covers,
  currentColorScheme,
  arrIdsRooms,
  setArrRoomGroups,
  setIsOpenGroupIcon,
  onCloseEditRoomGroupsDialog,
}: CoverDialogProps) => {
  const { t } = useTranslation(["Common", "RoomLogoCover"]);

  const [roomIcon, setRoomIcon] = React.useState({
    data: '<svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7a1 1 0 0 1-.832-.445L7.465 3H3zM.879 1.879A3 3 0 0 1 3 1h5a1 1 0 0 1 .832.445L10.535 4H17a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V4a3 3 0 0 1 .879-2.121z" fill="#657077"/></svg>',
    id: "folder",
  });

  const [groupName, setGroupName] = React.useState(null);

  React.useEffect(() => {
    getCovers();
  }, [getCovers]);

  const coverId = roomIcon?.id;

  const onChangeGroupName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setGroupName(value);
  };

  const onClose = () => {
    setIsOpenGroupIcon(false);
  };

  const handleSubmit = () => {
    if (!groupName) return;

    const newGroup = {
      id: uniqueId(),
      groupName,
      icon: roomIcon,
      arrIdsRooms,
    };

    setArrRoomGroups(newGroup);
    console.log("newGroup", newGroup);
    onCloseEditRoomGroupsDialog();
  };

  console.log("roomIcon groupName", roomIcon, groupName);

  return (
    <ModalDialog
      className={styles.groupIconDialog}
      visible
      autoMaxHeight
      withBodyScroll
      displayType={isMobile() ? ModalDialogType.aside : ModalDialogType.modal}
      onClose={onClose}
    >
      <ModalDialog.Header>{"Group icon "}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.name}>
          <Text
            fontWeight={600}
            fontSize="13px"
            lineHeight="20px"
            noSelect
            truncate
            className={styles.nameText}
          >
            {"Group name "}
          </Text>
          <span className={styles.symbol}>*</span>
          <TextInput
            className={styles.nameInput}
            type={InputType.text}
            size={InputSize.base}
            value={groupName}
            scale
            placeholder="Enter name"
            isAutoFocussed
            onChange={onChangeGroupName}
          />
        </div>
        <RoomLogoCoverContainer>
          <SelectIcon
            t={t}
            $currentColorScheme={currentColorScheme}
            coverId={coverId}
            setIcon={(icon) => setRoomIcon(icon)}
            covers={covers}
          />
        </RoomLogoCoverContainer>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          scale
          primary
          tabIndex={0}
          size={ButtonSize.normal}
          label={"Create"}
          onClick={handleSubmit}
        />
        <Button
          scale
          tabIndex={0}
          onClick={onClose}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default GroupIconDialog;
