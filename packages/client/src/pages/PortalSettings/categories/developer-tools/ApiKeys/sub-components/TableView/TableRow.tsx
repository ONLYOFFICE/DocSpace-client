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

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";
import DefaultUserPhotoSize32PngUrl from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";
import {
  TableRow as TableRowComponent,
  TableCell,
} from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { TableRowProps } from "../../types";
import { getCookie, getCorrectDate } from "@docspace/shared/utils";
import { LANGUAGE } from "@docspace/shared/constants";

const StyledWrapper = styled.div`
  display: contents;

  .toggleButton {
    display: flex;
    align-items: center;
  }
`;

const StyledTableRow = styled(TableRowComponent)`
  .table-container_cell {
    padding-inline-end: 30px;
    text-overflow: ellipsis;
  }

  .api-keys_text {
    color: ${({ theme }) => theme.filesSection.rowView.sideColor};
  }

  .api-keys_text-overflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .author-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .author-avatar-cell {
    width: 16px;
    height: 16px;
    min-width: 16px;
  }
`;

const TableRow = (props: TableRowProps) => {
  const { item, hideColumns, onChangeApiKeyStatus, onDeleteApiKey, culture } =
    props;

  const { t } = useTranslation(["Common"]);

  const contextOptions = [
    {
      key: "Settings dropdownItem",
      label: t("Common:Delete"),
      icon: CatalogTrashReactSvgUrl,
      onClick: () => onDeleteApiKey(item.id),
    },
  ];

  const avatarSource = item.createBy?.hasAvatar
    ? item.createBy?.avatarSmall
    : DefaultUserPhotoSize32PngUrl;

  const getStatusByDate = (date: string) => {
    const locale = getCookie(LANGUAGE) || culture;
    const dateLabel = getCorrectDate(locale, date);
    return dateLabel;
  };

  const createOnDate = getStatusByDate(item.createOn);
  const lastUsedDate = getStatusByDate(item.lastUsed);
  const expiresAtDate = getStatusByDate(item.expiresAt);

  return (
    <StyledWrapper>
      <StyledTableRow contextOptions={contextOptions} hideColumns={hideColumns}>
        <TableCell>
          <Text fontWeight={600}>{item.name}</Text>
        </TableCell>
        <TableCell>
          <Text
            className="api-keys_text api-keys_text-overflow"
            fontWeight={600}
          >
            {item.keyPrefix}
          </Text>
        </TableCell>
        <TableCell>
          <Text
            className="api-keys_text api-keys_text-overflow"
            fontWeight={600}
          >
            {createOnDate}
          </Text>
        </TableCell>
        <TableCell className="author-cell">
          <Avatar
            source={avatarSource}
            className="author-avatar-cell"
            role={AvatarRole.user}
            size={AvatarSize.small}
          />
          <Text
            fontSize="12px"
            fontWeight={600}
            title={item.createBy?.displayName}
            truncate
          >
            {item.createBy?.displayName}
          </Text>
        </TableCell>
        <TableCell>
          <Text
            className="api-keys_text api-keys_text-overflow"
            fontWeight={600}
          >
            {lastUsedDate}
          </Text>
        </TableCell>
        <TableCell>
          <Text
            className="api-keys_text api-keys_text-overflow"
            fontWeight={600}
          >
            {expiresAtDate}
          </Text>
        </TableCell>
        <TableCell>
          <div>
            <ToggleButton
              className="toggle toggleButton"
              isChecked={item.isActive}
              onChange={() => onChangeApiKeyStatus(item.id)}
            />
          </div>
        </TableCell>
      </StyledTableRow>
    </StyledWrapper>
  );
};

export default TableRow;
