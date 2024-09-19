// (c) Copyright Ascensio System SIA 2009-2024
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

import { Text } from "@docspace/shared/components/text";
import { TTranslation } from "@docspace/shared/types";
import RoundedArrowSvgUrl from "PUBLIC_DIR/images/rounded arrow.react.svg?url";
import CrossIconSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";
import { IconButton } from "@docspace/shared/components/icon-button";
import { StyledTableIndexMenu } from "./StyledIndexHeader";

export interface IndexMenuProps {
  t: TTranslation;
  onCloseIndexMenu: () => void;
  onIndexReorder: () => void;
}

const IndexMenu = ({ t, onCloseIndexMenu, onIndexReorder }: IndexMenuProps) => {
  return (
    <StyledTableIndexMenu>
      <div className="table-header_index-container">
        <Text fontSize="14px" lineHeight="16px" fontWeight={600}>
          {t("Common:SortingIndex")}
        </Text>

        <div className="table-header_index-separator" />
        <div
          className="table-header_reorder-container"
          onClick={onIndexReorder}
        >
          <IconButton
            className="table-header_reorder-icon"
            size={16}
            iconName={RoundedArrowSvgUrl}
            isFill
            isClickable={false}
          />
          <Text fontSize="12px" lineHeight="16px" fontWeight={600}>
            {t("Files:Reorder")}
          </Text>
        </div>
      </div>
      <IconButton
        className="table-header_cross-icon"
        size={16}
        onClick={onCloseIndexMenu}
        iconName={CrossIconSvgUrl}
        isFill
        isClickable={false}
      />
    </StyledTableIndexMenu>
  );
};

export default IndexMenu;
