import React from "react";
import { inject, observer } from "mobx-react";

import { TableBody } from "@docspace/shared/components/table";
//@ts-ignore
import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";

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
  fetchNextClients,
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

      setSelection && setSelection("");
    },
    [setSelection]
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
      await fetchNextClients?.(startIndex);
    },
    []
  );

  return (
    <TableWrapper forwardedRef={tableRef} useReactWindow>
      <Header
        sectionWidth={sectionWidth}
        tableRef={tableRef.current}
        columnStorageName={columnStorageName}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        columnStorageName={columnStorageName}
        filesLength={items.length}
        fetchMoreFiles={fetchMoreFiles}
        hasMoreFiles={hasNextPage || false}
        itemCount={itemCount || 0}
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
  ({ auth, oauthStore }: { auth: any; oauthStore: OAuthStoreProps }) => {
    const { id: userId } = auth.userStore.user;

    const {
      viewAs,
      setViewAs,
      selection,
      setSelection,
      setBufferSelection,
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
      userId,
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
  }
)(observer(TableView));
