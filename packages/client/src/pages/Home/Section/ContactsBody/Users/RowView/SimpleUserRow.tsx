/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import classNames from "classnames";

import { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import { Row } from "@docspace/ui-kit/components/rows";
import type { TData } from "@docspace/ui-kit/components/rows/row/Row.types";

import withContent from "SRC_DIR/HOCs/withPeopleContent";

import UserContent from "./UserContent";

import type { SimpleUserRowProps } from "./RowView.types";
import styles from "./RowView.module.scss";

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
    <div
      className={classNames(
        styles.styledWrapper,
        "user-item row-wrapper",
        { "row-selected": isChecked || isActive },
        String(item.id),
      )}
      {...({ value } as unknown as { value?: string })}
    >
      <div className="user-item user-row-container">
        <Row
          key={item.id}
          data={item as unknown as TData}
          element={element}
          onSelect={onContentRowSelect!}
          checked={isChecked}
          mode="modern"
          className={classNames(styles.styledSimpleUserRow, "user-row", {
            [styles.checked]: isChecked,
            [styles.active]: isActive,
          })}
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
        </Row>
      </div>
    </div>
  );
};

export default withContent(SimpleUserRow);
