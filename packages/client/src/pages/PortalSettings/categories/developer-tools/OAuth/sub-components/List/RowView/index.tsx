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
import { inject, observer } from "mobx-react";

import OAuthStore from "SRC_DIR/store/OAuthStore";

import { RowContainer } from "@docspace/ui-kit/components/rows";

import { OAuthRow } from "./Row";

import { RowViewProps } from "./RowView.types";
import styles from "./RowView.styled.module.scss";

const RowView = (props: RowViewProps) => {
  const {
    items,
    sectionWidth,

    changeClientStatus,
    selection,
    setSelection,
    setBufferSelection,

    activeClients,
    getContextMenuItems,
    hasNextPage,
    itemCount,
    fetchNextClients,
  } = props;

  const fetchMoreFiles = React.useCallback(
    async ({ startIndex }: { startIndex: number; stopIndex: number }) => {
      await fetchNextClients?.(startIndex);
    },
    [fetchNextClients],
  );

  React.useEffect(() => {
    return () => {
      setSelection!("");
    };
  }, [setSelection]);

  if (!items.length) return null;

  return (
    <RowContainer
      className={styles.styledRowContainer}
      itemHeight={59}
      filesLength={items.length}
      fetchMoreFiles={fetchMoreFiles}
      hasMoreFiles={hasNextPage || false}
      itemCount={itemCount || 0}
      useReactWindow
      onScroll={() => {}}
    >
      {items.map((item) => (
        <OAuthRow
          key={item.clientId}
          item={item}
          isChecked={selection?.includes(item.clientId) || false}
          inProgress={activeClients?.includes(item.clientId) || false}
          setSelection={setSelection}
          setBufferSelection={setBufferSelection}
          changeClientStatus={changeClientStatus}
          getContextMenuItems={getContextMenuItems}
          sectionWidth={sectionWidth}
        />
      ))}
    </RowContainer>
  );
};

export default inject(({ oauthStore }: { oauthStore: OAuthStore }) => {
  const {
    viewAs,
    setViewAs,
    selection,
    setBufferSelection,
    setSelection,
    changeClientStatus,
    getContextMenuItems,
    activeClients,
    hasNextPage,
    itemCount,
    fetchNextClients,
  } = oauthStore;

  return {
    viewAs,
    setViewAs,
    changeClientStatus,
    selection,
    setSelection,
    setBufferSelection,
    activeClients,
    getContextMenuItems,
    hasNextPage,
    itemCount,
    fetchNextClients,
  };
})(observer(RowView));
