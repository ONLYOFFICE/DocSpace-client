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

import { ContextMenuModel } from "@docspace/shared/components/context-menu";
import type { TData } from "@docspace/shared/components/rows/row/Row.types";

import withContent from "SRC_DIR/HOCs/withPeopleContent";

import UserContent from "./UserContent";

import { StyledSimpleUserRow, StyledWrapper } from "./RowView.styled";
import type { SimpleUserRowProps } from "./RowView.types";

const SimpleUserRow = (props: SimpleUserRowProps) => {
  const {
    item,
    getContextModel,
    checkedProps,
    onContentRowSelect,
    onUserContextClick,
    element,
    isActive,
    value,
    inProgress,
    contactsTab,
    itemIndex,
  } = props;

  const isGuests = contactsTab === "guests";

  const isChecked = checkedProps!.checked;

  const onRowContextClick = React.useCallback(
    (rightMouseButtonClick?: boolean) => {
      onUserContextClick?.(item, !rightMouseButtonClick);
    },
    [item, onUserContextClick],
  );

  return (
    <StyledWrapper
      className={`user-item row-wrapper ${
        isChecked || isActive ? "row-selected" : ""
      } ${item.id}`}
      value={value}
      checked={isChecked}
      isActive={isActive}
    >
      <div className="user-item user-row-container">
        <StyledSimpleUserRow
          key={item.id}
          data={item as unknown as TData}
          element={element}
          onSelect={onContentRowSelect!}
          checked={isChecked}
          isActive={isActive}
          mode="modern"
          className="user-row"
          onContextClick={onRowContextClick!}
          contextOptions={item.options as unknown as ContextMenuModel[]}
          getContextModel={getContextModel!}
          onRowClick={() => {}}
          isIndexEditingMode={false}
          inProgress={inProgress}
          dataTestId={
            isGuests
              ? `contacts_guests_row_${itemIndex}`
              : `contacts_users_row_${itemIndex}`
          }
        >
          <UserContent {...props} />
        </StyledSimpleUserRow>
      </div>
    </StyledWrapper>
  );
};

export default withContent(SimpleUserRow);
