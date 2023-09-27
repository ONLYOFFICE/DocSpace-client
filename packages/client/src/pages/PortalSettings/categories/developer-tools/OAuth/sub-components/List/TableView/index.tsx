import React from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import styled from "styled-components";

import { ClientProps } from "@docspace/common/utils/oauth/interfaces";

//@ts-ignore
import TableContainer from "@docspace/components/table-container/TableContainer";
//@ts-ignore
import TableBody from "@docspace/components/table-container/TableBody";
//@ts-ignore
import { OAuthStoreProps, ViewAsType } from "SRC_DIR/store/OAuthStore";

import Row from "./Row";
import Header from "./Header";

const TableWrapper = styled(TableContainer)`
  margin-top: 0px;

  .header-container-text {
    font-size: 12px;
  }

  .table-container_header {
    position: absolute;
  }
`;

const TABLE_VERSION = "1";
const COLUMNS_SIZE = `oauthConfigColumnsSize_ver-${TABLE_VERSION}`;

interface TableViewProps {
  items: ClientProps[];
  sectionWidth: number;
  viewAs?: ViewAsType;
  setViewAs?: (value: ViewAsType) => void;
  userId?: string;
  selection?: string[];
  setSelection?: (clientId: string) => void;

  bufferSelection?: ClientProps | null;
  currentClient?: ClientProps | null;
  setBufferSelection?: (clientId: string) => void;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}

const TableView = ({
  items,

  sectionWidth,

  viewAs,
  setViewAs,

  selection,
  bufferSelection,

  setSelection,

  changeClientStatus,

  userId,
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
        fetchMoreFiles={() => console.log("call")}
        hasMoreFiles={false}
        itemCount={items.length}
      >
        {items.map((item, index) => (
          <Row
            key={item.clientId}
            item={item}
            isChecked={selection?.includes(item.clientId) || false}
            inProgress={false}
            setSelection={setSelection}
            changeClientStatus={changeClientStatus}
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
      bufferSelection,

      setSelection,
      setBufferSelection,

      changeClientStatus,

      currentClient,
    } = oauthStore;
    return {
      viewAs,
      setViewAs,
      userId,
      changeClientStatus,
      selection,
      bufferSelection,

      setSelection,
      setBufferSelection,
      currentClient,
    };
  }
)(observer(TableView));
