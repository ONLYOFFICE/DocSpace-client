import React from "react";
import { inject, observer } from "mobx-react";

import { TableBody } from "@docspace/shared/components/table";
import { UserStore } from "@docspace/shared/store/UserStore";

import OAuthStore from "SRC_DIR/store/OAuthStore";

import Row from "./Row";
import Header from "./Header";

import { TableViewProps } from "./TableView.types";
import { TableWrapper } from "./TableView.styled";

const TABLE_VERSION = "1";
const COLUMNS_SIZE = `consentColumnsSize_ver-${TABLE_VERSION}`;

const TableView = ({
  items,
  sectionWidth,
  selection,
  activeClients,
  setSelection,
  getContextMenuItems,
  changeClientStatus,
  userId,
  hasNextPage,
  itemCount,
  fetchNextConsents,
}: TableViewProps) => {
  const tableRef = React.useRef<HTMLDivElement>(null);

  const clickOutside = React.useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(".checkbox") ||
        target.closest(".table-container_row-checkbox") ||
        e.detail === 0
      ) {
        return;
      }

      setSelection?.("");
    },
    [setSelection],
  );

  React.useEffect(() => {
    window.addEventListener("click", clickOutside);

    return () => {
      window.removeEventListener("click", clickOutside);
    };
  }, [clickOutside, setSelection]);

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;

  const fetchMoreFiles = React.useCallback(
    async ({ startIndex }: { startIndex: number; stopIndex: number }) => {
      await fetchNextConsents?.(startIndex);
    },
    [fetchNextConsents],
  );

  return (
    <TableWrapper
      forwardedRef={tableRef as React.RefObject<HTMLDivElement>}
      useReactWindow
    >
      <Header
        sectionWidth={sectionWidth}
        tableRef={tableRef.current}
        columnStorageName={columnStorageName}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName=" "
        filesLength={items.length}
        fetchMoreFiles={fetchMoreFiles}
        hasMoreFiles={hasNextPage || false}
        itemCount={itemCount || 0}
        isIndexEditingMode={false}
      >
        {items.map((item) => (
          <Row
            key={item.clientId}
            item={item}
            isChecked={selection?.includes(item.clientId) || false}
            inProgress={activeClients?.includes(item.clientId) || false}
            setSelection={setSelection}
            changeClientStatus={changeClientStatus}
            getContextMenuItems={getContextMenuItems}
          />
        ))}
      </TableBody>
    </TableWrapper>
  );
};

export default inject(
  ({
    userStore,
    oauthStore,
  }: {
    userStore: UserStore;
    oauthStore: OAuthStore;
  }) => {
    const userId = userStore.user?.id;

    const {
      viewAs,
      setViewAs,
      selection,
      setSelection,
      setBufferSelection,
      changeClientStatus,
      getContextMenuItems,
      activeClients,
      consentHasNextPage,
      consentItemCount,
      fetchNextConsents,
    } = oauthStore;

    return {
      viewAs,
      setViewAs,
      userId,
      changeClientStatus,
      selection,
      setSelection,
      setBufferSelection,
      activeClients,
      getContextMenuItems,
      hasNextPage: consentHasNextPage,
      itemCount: consentItemCount,
      fetchNextConsents,
    };
  },
)(observer(TableView));
