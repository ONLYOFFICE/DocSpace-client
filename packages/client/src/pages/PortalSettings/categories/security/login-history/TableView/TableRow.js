import React from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";
import { convertTime } from "@docspace/common/utils/convertTime";

const StyledPeopleRow = styled(TableRow)`
  .table-container_cell {
    height: 46px;
    max-height: 46px;
  }

  .table-container_row-checkbox-wrapper {
    padding-left: 4px;
    min-width: 46px;

    .table-container_row-checkbox {
      margin-left: -4px;
      padding: 16px 0px 16px 12px;
    }
  }

  .link-with-dropdown-group {
    margin-right: 12px;
  }

  .table-cell_username {
    margin-right: 12px;
  }
`;

const PeopleTableRow = (props) => {
  const { item, contextOptionsProps, onEmailClick, locale } = props;
  const { email, position } = item;
  const dateStr = convertTime(item.date, locale);

  return (
    <StyledPeopleRow key={item.id} {...contextOptionsProps}>
      <TableCell>
        <Text
          type="page"
          title={position}
          fontSize="12px"
          fontWeight={600}
          truncate
        >
          {item.user}
        </Text>
      </TableCell>
      <TableCell>
        <Text
          type="page"
          title={position}
          fontSize="12px"
          fontWeight={600}
          truncate
        >
          {dateStr}
        </Text>
      </TableCell>

      <TableCell>
        <Text
          type="page"
          title={email}
          fontSize="12px"
          fontWeight={600}
          onClick={onEmailClick}
          isTextOverflow
        >
          {item.action}
        </Text>
      </TableCell>
    </StyledPeopleRow>
  );
};

export default inject(({ auth }) => {
  const { culture } = auth.settingsStore;
  const { user } = auth.userStore;
  const locale = (user && user.cultureName) || culture || "en";

  return {
    locale,
  };
})(observer(PeopleTableRow));
