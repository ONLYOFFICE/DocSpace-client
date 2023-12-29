import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";
import Avatar from "@docspace/components/avatar";
import SettingsIcon from "PUBLIC_DIR/images/catalog.settings.react.svg?url";
import styled from "styled-components";

const StyledTableRow = styled(TableRow)`
  .avatar {
    margin-right: 6px;
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
}) => {
  const contextOptions = [
    {
      key: "ViewSessions",
      label: t("Settings:ViewSessions"),
      icon: SettingsIcon,
      onClick: () => console.log("view session"),
    },
    {
      key: "LogoutAllSessions",
      label: t("Settings:LogoutAllSessions"),
      icon: SettingsIcon,
      onClick: () => console.log("logout session"),
    },
    {
      key: "Separator",
      isSeparator: true,
    },
    {
      key: "Disable",
      label: t("PeopleTranslations:DisableUserButton"),
      icon: SettingsIcon,
      onClick: () => console.log("disable"),
    },
  ];

  return (
    <StyledTableRow
      onClick={() => console.log("selected row")}
      contextOptions={contextOptions}
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
