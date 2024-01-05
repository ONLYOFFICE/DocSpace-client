import { useRef } from "react";
import styled, { css } from "styled-components";

import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";
import Avatar from "@docspace/components/avatar";
import Checkbox from "@docspace/components/checkbox";

import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    text-overflow: ellipsis;
  }

  .table-container_row-checkbox {
    padding: 16px 8px 16px 12px;
  }

  .avatar {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 8px;
          `
        : css`
            margin-right: 8px;
          `}
  }

  .session-info {
    font-weight: 600;
    color: #a3a9ae;
  }

  .session-online {
    font-weight: 600;
    color: #35ad17;
  }
`;

const SessionsTableRow = ({
  t,
  avatar,
  role,
  displayName,
  status,
  browser,
  platform,
  country,
  city,
  ip,
  hideColumns,
  isChecked,
  toggleSession,
}) => {
  const tableRef = useRef();

  const contextOptions = [
    {
      key: "ViewSessions",
      label: t("Settings:ViewSessions"),
      icon: HistoryFinalizedReactSvgUrl,
      onClick: () => console.log("view session"),
    },
    {
      key: "LogoutAllSessions",
      label: t("Settings:LogoutAllSessions"),
      icon: RemoveSvgUrl,
      onClick: () => console.log("logout session"),
    },
    {
      key: "Separator",
      isSeparator: true,
    },
    {
      key: "Disable",
      label: t("Common:DisableUserButton"),
      icon: TrashReactSvgUrl,
      onClick: () => console.log("disable"),
    },
  ];

  const handleSessionToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    tableRef.current?.contains(e.target) || toggleSession(e);
  };

  const isOnline = status === "Online";

  return (
    <StyledTableRow
      hideColumns={hideColumns}
      contextOptions={contextOptions}
      checked={isChecked}
      onClick={handleSessionToggle}
    >
      <TableCell hasAccess={true}>
        <div className="table-container_element">
          <Avatar
            className="avatar"
            userName={displayName}
            role={role}
            source={avatar}
            size={"small"}
          />
        </div>

        <Checkbox
          className="table-container_row-checkbox"
          isChecked={isChecked}
          onChange={handleSessionToggle}
        />

        <Text fontWeight="600">{displayName}</Text>
      </TableCell>

      <TableCell>
        <Text className={isOnline ? "session-online" : "session-info"} truncate>
          {status}
        </Text>
      </TableCell>

      <TableCell>
        <Text className="session-info" truncate>
          {platform},&nbsp;
        </Text>
        <Text className="session-info" truncate>
          {browser}
        </Text>
      </TableCell>

      <TableCell>
        <Text className="session-info" truncate>
          {country},&nbsp;
        </Text>
        <Text className="session-info" truncate>
          {city}
        </Text>
      </TableCell>

      <TableCell>
        <Text className="session-info" truncate>
          {ip}
        </Text>
      </TableCell>
    </StyledTableRow>
  );
};

export default SessionsTableRow;
