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

const StyledModalDialog = styled(ModalDialog)<{
  heightProp?: string;
  scrollBodyHeight?: null | number;
}>`
  #modal-dialog {
    width: 422px;
    height: ${(props) => props.heightProp};

    @media ${tablet} {
      width: 464px;
    }

    .modal-header {
      height: 54px;
      min-height: 54px;
    }
    .modal-body {
      padding: 0;
      padding-inline-start: 16px;

      ${(props) =>
        props.scrollBodyHeight &&
        css`
          height: ${`${props.scrollBodyHeight}px`};

          .room-logo-container {
            padding-left: 15px;
          }

          .icon-container {
            padding-right: 1px;
          }
        `}
    }

    .modal-footer {
      margin-top: 8px;
    }

    @media ${mobile} {
      margin-bottom: 16px;
      width: 100vw;

      .modal-body {
        padding: 0px 16px 8px;
      }

      .modal-footer {
        margin-top: 0px;
      }

      .modal-header {
        margin-bottom: 16px;
      }
    }
  }
`;

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
  }
  .colors-container {
    flex-wrap: nowrap;
  }

  .colors-container,
  .cover-icon-container {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    box-sizing: border-box;
    width: 390px;
  }

  @media ${tablet} {
    .select-container {
      text-align: center;
    }
    .select-color-container {
      margin-bottom: 16px;
    }

    .cover-icon-container {
      flex-wrap: wrap;
      gap: 3px;
      width: 432px;
    }
  }
  @media ${mobile} {
    .cover-icon-container {
      width: 100%;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .color-select-container {
      display: flex;
      align-items: center;
      justify-content: center;
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
  }

  .cover-icon-container,
  .color-name {
    user-select: none;
  }
`;

const GroupIconDialog = ({
  getCovers,
  covers,
  roomLogoCoverDialogVisible,
  currentColorScheme,
}: CoverDialogProps) => {
  const { t } = useTranslation(["Common", "RoomLogoCover"]);

  const [roomCoverDialogProps, setRoomCoverDialogProps] = React.useState({
    icon: null,
    title: null,
  });

  React.useEffect(() => {
    getCovers();
  }, [getCovers]);

  const coverId = roomCoverDialogProps.icon?.id;

  console.log("covers", covers);

  return (
    <StyledModalDialog
      visible
      autoMaxHeight
      // autoMaxHeight
      // heightProp={"498px"}
      //   onClose={onCloseRoomLogo}
      displayType={isMobile() ? ModalDialogType.aside : ModalDialogType.modal}
      //   withBodyScroll
      //   scrollBodyHeight={scrollBodyHeight}
      //   withBodyScrollForcibly={!!scrollBodyHeight}
      //   isScrollLocked={openColorPicker}
    >
      <ModalDialog.Header>{"Group icon"}</ModalDialog.Header>
      <ModalDialog.Body>
        <div>
          <Text
            fontWeight={600}
            fontSize="13px"
            lineHeight="20px"
            noSelect
            truncate
          >
            {"Group name"}
          </Text>
          <TextInput
            type={InputType.text}
            size={InputSize.base}
            value={"baseDomain"}
            scale
            placeholder="Enter name"
          />
        </div>
        <RoomLogoCoverContainer>
          <SelectIcon
            t={t}
            $currentColorScheme={currentColorScheme}
            coverId={coverId}
            setIcon={(icon) =>
              setRoomCoverDialogProps({
                ...roomCoverDialogProps,
                icon,
              })
            }
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
          //   onClick={handleSubmit}
        />
        <Button
          scale
          tabIndex={0}
          //   onClick={onCloseRoomLogo}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default GroupIconDialog;
