import React from "react";
import { inject, observer } from "mobx-react";

import { RowContainer } from "@docspace/shared/components/rows";

import OAuthStore from "SRC_DIR/store/OAuthStore";

import { OAuthRow } from "./Row";

import { RowViewProps } from "./RowView.types";
import styles from "../../authorized-apps.module.scss";

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
    fetchNextConsents,
  } = props;

  const fetchMoreFiles = React.useCallback(
    async ({ startIndex }: { startIndex: number; stopIndex: number }) => {
      await fetchNextConsents?.(startIndex);
    },
    [fetchNextConsents],
  );

  return (
    <RowContainer
      className={styles.rowContainer}
      itemHeight={59}
      filesLength={items.length}
      fetchMoreFiles={fetchMoreFiles}
      hasMoreFiles={hasNextPage || false}
      itemCount={itemCount || 0}
      useReactWindow
      onScroll={() => {}}
    >
      {items.map((item, index) => (
        <OAuthRow
          key={item.clientId}
          item={item}
          isChecked={selection?.includes(item.clientId) || false}
          inProgress={activeClients?.includes(item.clientId) || false}
          setSelection={setSelection}
          changeClientStatus={changeClientStatus}
          getContextMenuItems={getContextMenuItems}
          sectionWidth={sectionWidth}
          dataTestId={`auth_row_${index}`}
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
    setSelection,
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
    changeClientStatus,
    selection,
    setSelection,
    activeClients,
    getContextMenuItems,
    hasNextPage: consentHasNextPage,
    itemCount: consentItemCount,
    fetchNextConsents,
  };
})(observer(RowView));
