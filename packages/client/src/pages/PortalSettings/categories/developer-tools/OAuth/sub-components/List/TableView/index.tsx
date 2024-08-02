import React from "react";
import { inject, observer } from "mobx-react";
import elementResizeDetectorMaker from "element-resize-detector";

import { UserStore } from "@docspace/shared/store/UserStore";
import { TableBody } from "@docspace/shared/components/table";

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";

import Row from "./Row";
import Header from "./Header";

import { TableViewProps } from "./TableView.types";
import { TableWrapper } from "./TableView.styled";

const TABLE_VERSION = "1";
const COLUMNS_NAME = `oauthConfigColumnsSize_ver-${TABLE_VERSION}`;

const elementResizeDetector = elementResizeDetectorMaker({
  strategy: "scroll",
  callOnAdd: false,
});

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
  const tagRef = React.useRef<HTMLDivElement | null>(null);

  const [tagCount, setTagCount] = React.useState(0);

  React.useEffect(() => {
    return () => {
      if (!tagRef?.current) return;

      elementResizeDetector.uninstall(tagRef.current);
    };
  }, []);

  const onResize = React.useCallback(
    (node: HTMLElement) => {
      const element = tagRef?.current ? tagRef?.current : node;

      if (element) {
        const { width } = element.getBoundingClientRect();

        const columns = Math.floor(width / 120);

        if (columns !== tagCount) setTagCount(columns);
      }
    },
    [tagCount],
  );

  const onSetTagRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (node) {
        tagRef.current = node;
        onResize(node);

        elementResizeDetector.listenTo(node, onResize);
      }
    },
    [onResize],
  );

  const clickOutside = React.useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
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

  const columnStorageName = `${COLUMNS_NAME}=${userId}`;

  const fetchMoreFiles = React.useCallback(
    async ({ startIndex }: { startIndex: number; stopIndex: number }) => {
      await fetchNextClients?.(startIndex);
    },
    [fetchNextClients],
  );

  return (
    <TableWrapper forwardedRef={tableRef} useReactWindow>
      <Header
        sectionWidth={sectionWidth}
        tableRef={tableRef.current}
        columnStorageName={columnStorageName}
        tagRef={onSetTagRef}
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
            tagCount={tagCount}
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
    oauthStore: OAuthStoreProps;
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
  },
)(observer(TableView));