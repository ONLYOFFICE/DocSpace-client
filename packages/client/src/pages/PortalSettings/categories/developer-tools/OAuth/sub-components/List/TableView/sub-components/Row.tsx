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

import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { TableCell } from "@docspace/shared/components/table";
import { Tags } from "@docspace/shared/components/tags";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import getCorrectDate from "@docspace/shared/utils/getCorrectDate";
import { getCookie } from "@docspace/shared/utils/cookie";
import { toastr } from "@docspace/shared/components/toast";

import NameCell from "../columns/name";
import CreatorCell from "../columns/creator";

import { StyledRowWrapper, StyledTableRow } from "../TableView.styled";
import { RowProps } from "../TableView.types";

const Row = (props: RowProps) => {
  const {
    item,
    changeClientStatus,
    isChecked,
    inProgress,
    getContextMenuItems,
    setSelection,
    tagCount,
    setBufferSelection,
    setDisableDialogVisible,
  } = props;
  const navigate = useNavigate();

  const { t } = useTranslation(["OAuth", "Common", "Files"]);

  const editClient = () => {
    navigate(`${item.clientId}`);
  };

  const handleToggleEnabled = async () => {
    if (!changeClientStatus) return;
    try {
      if (item.enabled && setDisableDialogVisible) {
        setBufferSelection!(item.clientId);
        setDisableDialogVisible(true);
        return;
      }
      await changeClientStatus(item.clientId, !item.enabled);

      if (!item.enabled) {
        toastr.success(t("ApplicationEnabledSuccessfully"));
      } else {
        toastr.success(t("ApplicationDisabledSuccessfully"));
      }
    } catch (e) {
      toastr.error(e as string);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    if (
      target.closest(".checkbox") ||
      target.closest(".table-container_row-checkbox") ||
      target.closest(".advanced-tag") ||
      target.closest(".tag") ||
      e.detail === 0
    ) {
      return;
    }

    if (
      target.closest(".type-combobox") ||
      target.closest(".table-container_row-context-menu-wrapper") ||
      target.closest(".toggleButton")
    ) {
      return setSelection && setSelection("");
    }

    editClient();
  };

  const contextOptions = getContextMenuItems?.(t, item);

  const getContextMenuModel = () =>
    getContextMenuItems ? getContextMenuItems(t, item) : [];

  const locale = getCookie("asc_language");

  const modifiedDate = getCorrectDate(locale || "", item.modifiedOn || "");

  return (
    <StyledRowWrapper className="handle">
      <StyledTableRow
        contextOptions={contextOptions || []}
        onClick={handleRowClick}
        fileContextClick={(isRightClick) => {
          if (isRightClick) return;
          setSelection!("");
          setBufferSelection!(item.clientId);
        }}
        getContextModel={getContextMenuModel}
        isIndexEditingMode={false}
        badgeUrl=""
        dataTestId={`${item.name}_table_row`}
      >
        <TableCell className="table-container_file-name-cell">
          <NameCell
            name={item.name}
            icon={item.logo}
            isChecked={isChecked}
            inProgress={inProgress}
            clientId={item.clientId}
            setSelection={setSelection}
          />
        </TableCell>
        <TableCell className="author-cell">
          <CreatorCell
            avatar={item.creatorAvatar || ""}
            displayName={item.creatorDisplayName || ""}
          />
        </TableCell>
        <TableCell className="">
          <Text
            as="span"
            fontWeight={400}
            className="mr-8 textOverflow description-text"
            dataTestId="app_modified_date_cell"
          >
            {modifiedDate}
          </Text>
        </TableCell>
        <TableCell className="">
          <Text
            as="span"
            fontWeight={400}
            className="mr-8 textOverflow description-text"
            dataTestId="app_scopes_tags_cell"
          >
            <Tags
              tags={item.scopes}
              removeTagIcon
              columnCount={tagCount}
              onSelectTag={() => {}}
            />
          </Text>
        </TableCell>
        <TableCell className="">
          <ToggleButton
            className="toggle toggleButton"
            isChecked={item.enabled}
            onChange={handleToggleEnabled}
            dataTestId={`${item.name}_toggle_button`}
          />
        </TableCell>
      </StyledTableRow>
    </StyledRowWrapper>
  );
};

export default Row;
