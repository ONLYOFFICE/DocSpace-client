import React from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";

//@ts-ignore
import TableBody from "@docspace/components/table-container/TableBody";
//@ts-ignore
import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";

import Row from "./Row";
import Header from "./Header";

import { TableViewProps } from "./TableView.types";
import { TableWrapper } from "./TableView.styled";

const TABLE_VERSION = "1";
const COLUMNS_SIZE = `oauthConfigColumnsSize_ver-${TABLE_VERSION}`;

const TableView = ({
  items,
  sectionWidth,
  viewAs,
  setViewAs,
  selection,
  activeClients,
  setSelection,
  getContextMenuItems,
  changeClientStatus,
  userId,
  hasNextPage,
  totalElements,
  fetchNextClients,
}: TableViewProps) => {
  const tableRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!sectionWidth || !setViewAs) return;
    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
  }, [sectionWidth, viewAs, setViewAs]);

  const clickOutside = React.useCallback(
    (e: any) => {
      if (
        e.target.closest(".checkbox") ||
        e.target.closest(".table-container_row-checkbox") ||
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

  return (
    <TableWrapper forwardedRef={tableRef} useReactWindow>
      <Header
        sectionWidth={sectionWidth}
        //@ts-ignore
        tableRef={tableRef}
        columnStorageName={columnStorageName}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        columnStorageName={columnStorageName}
        filesLength={items.length}
        fetchMoreFiles={({
          startIndex,
        }: {
          startIndex: number;
          stopIndex: number;
        }) => fetchNextClients && fetchNextClients(startIndex)}
        hasMoreFiles={hasNextPage}
        itemCount={totalElements}
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
      totalElements,
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
      totalElements,
      fetchNextClients,
    };
  }
)(observer(TableView));
