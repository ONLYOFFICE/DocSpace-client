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
import SecuritySvgUrl from "PUBLIC_DIR/images/security.svg?url";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { injectDefaultTheme, NoUserSelect } from "@docspace/shared/utils";
import { RoomIcon } from "@docspace/shared/components/room-icon";
import { TLogo } from "@docspace/shared/api/rooms/types";
import { TModel } from "@docspace/shared/components/room-icon/RoomIcon.types";

type ItemIconProps = {
  icon?: string;
  fileExst?: string;
  isPrivacy?: boolean;
  isRoom?: boolean;
  title: string;
  logo?: TLogo | string;
  color?: string;
  isArchive?: boolean;
  badgeUrl?: string;
  size?: string;
  radius?: string;
  withEditing?: boolean;
  showDefault?: boolean;
  imgClassName?: string;
  model?: TModel[];
  onChangeFile?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className: string;
  isTemplate?: boolean;
  dataTestId?: string;
};

const IconWrapper = styled.div.attrs(injectDefaultTheme)<{ isRoom?: boolean }>`
  ${(props) =>
    props.isRoom &&
    css`
      position: relative;
      border-radius: 6px;

      &::before {
        content: "";
        position: absolute;
        inset: 0;
        /* border: ${({ theme }) => theme.itemIcon.borderColor}; */
        border: 1px solid transparent;
        border-radius: 5px;
        overflow: hidden;
      }
    `}

  .react-svg-icon {
    ${NoUserSelect}
    ${(props) =>
      props.isRoom &&
      css`
        vertical-align: middle;
      `}
  }
`;

const EncryptedFileIcon = styled.div`
  background: url(${SecuritySvgUrl}) no-repeat 0 0 / 16px 16px transparent;
  height: 16px;
  position: absolute;
  width: 16px;
  margin-top: 14px;
  margin-inline-start: 12px;
`;

const ItemIcon = ({
  icon,
  fileExst,
  isPrivacy,
  isRoom,
  title,
  logo,
  color,
  isArchive,
  badgeUrl,
  size,
  radius,
  withEditing,
  showDefault,
  imgClassName,
  model,
  onChangeFile,
  className,
  isTemplate,
  dataTestId,
}: ItemIconProps) => {
  const isLoadedRoomIcon = !!logo;
  const showDefaultRoomIcon = !isLoadedRoomIcon && isRoom;

  return (
    <>
      <IconWrapper isRoom={isRoom}>
        <RoomIcon
          color={color}
          title={title}
          size={size}
          radius={radius}
          isArchive={isArchive}
          showDefault={showDefault || showDefaultRoomIcon}
          imgClassName={imgClassName || "react-svg-icon"}
          logo={isRoom ? logo : icon}
          badgeUrl={badgeUrl || ""}
          isTemplate={isTemplate}
          withEditing={withEditing}
          model={model}
          onChangeFile={onChangeFile}
          className={className}
          dataTestId={dataTestId}
        />
      </IconWrapper>
      {isPrivacy && fileExst ? <EncryptedFileIcon /> : null}
    </>
  );
};

export default inject(({ treeFoldersStore }: TStore) => {
  return { isPrivacy: treeFoldersStore.isPrivacyFolder };
})(observer(ItemIcon));
