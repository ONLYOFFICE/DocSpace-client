import React from "react";
import { inject, observer } from "mobx-react";

import OAuthStore from "SRC_DIR/store/OAuthStore";

import { OAuthRow } from "./Row";

import { RowViewProps } from "./RowView.types";
import { StyledRowContainer } from "./RowView.styled";

const RowView = (props: RowViewProps) => {
  const {
    items,
    sectionWidth,

    changeClientStatus,
    selection,
    setSelection,

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

  return (
    <StyledRowContainer
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
          changeClientStatus={changeClientStatus}
          getContextMenuItems={getContextMenuItems}
          sectionWidth={sectionWidth}
        />
      ))}
    </StyledRowContainer>
  );
};

export default inject(({ oauthStore }: { oauthStore: OAuthStore }) => {
  const {
    viewAs,
    setViewAs,
    selection,
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
    activeClients,
    getContextMenuItems,
    hasNextPage,
    itemCount,
    fetchNextClients,
  };
})(observer(RowView));
