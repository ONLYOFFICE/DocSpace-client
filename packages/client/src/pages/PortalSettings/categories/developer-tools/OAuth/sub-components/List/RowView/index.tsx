import React from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";

//@ts-ignore
import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";

import OAuthRow from "./Row";

import { RowViewProps } from "./RowView.types";
import { StyledRowContainer } from "./RowView.styled";

const RowView = (props: RowViewProps) => {
  const {
    items,
    sectionWidth,
    viewAs,
    setViewAs,

    changeClientStatus,
    selection,
    setSelection,

    activeClients,
    getContextMenuItems,
    hasNextPage,
    totalElements,
    fetchNextClients,
  } = props;

  React.useEffect(() => {
    if (viewAs !== "table" && viewAs !== "row") return;

    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs && setViewAs("table");
    }
  }, [viewAs, setViewAs, sectionWidth]);

  return (
    <StyledRowContainer
      itemHeight={59}
      filesLength={items.length}
      fetchMoreFiles={({
        startIndex,
      }: {
        startIndex: number;
        stopIndex: number;
      }) => fetchNextClients && fetchNextClients(startIndex)}
      hasMoreFiles={hasNextPage}
      itemCount={totalElements}
      useReactWindow={true}
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

export default inject(
  ({ oauthStore }: { auth: any; oauthStore: OAuthStoreProps }) => {
    const {
      viewAs,
      setViewAs,
      selection,
      setSelection,
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
      changeClientStatus,
      selection,
      setSelection,
      activeClients,
      getContextMenuItems,
      hasNextPage,
      totalElements,
      fetchNextClients,
    };
  }
)(observer(RowView));
