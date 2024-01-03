import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";
import Avatar from "@docspace/components/avatar";

import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

import styled, { css } from "styled-components";

const StyledTableRow = styled(TableRow)`
  .avatar {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 6px;
          `
        : css`
            margin-right: 6px;
          `}
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
  userId,
  hideColumns,
}) => {
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

  return (
    <StyledTableRow
      onClick={() => console.log("selected row")}
      contextOptions={contextOptions}
      hideColumns={hideColumns}
    >
      <TableCell>
        <Avatar
          className="avatar"
          userName={displayName}
          role={role}
          source={avatar}
          size={"small"}
        />
        <Text>{displayName}</Text>
      </TableCell>

      <TableCell>
        <Text>{status}</Text>
      </TableCell>

      <TableCell>
        <Text>{platform},&nbsp;</Text>
        <Text>{browser}</Text>
      </TableCell>

      <TableCell>
        <Text>{country},&nbsp;</Text>
        <Text>{city}</Text>
      </TableCell>

      <TableCell>
        <Text>{ip}</Text>
      </TableCell>
    </StyledTableRow>
  );
};

export default SessionsTableRow;
