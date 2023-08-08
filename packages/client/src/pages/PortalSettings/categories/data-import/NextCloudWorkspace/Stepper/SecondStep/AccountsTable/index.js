import React from "react";

import { inject, observer } from "mobx-react";
import { Consumer } from "@docspace/components/utils/context";

import TableView from "./TableView";
import RowView from "./RowView";

const AccountsTable = (props) => {
  const { viewAs, accountsData } = props;

  return (
    <Consumer>
      {(context) =>
        viewAs === "table" ? (
          <TableView sectionWidth={context.sectionWidth} accountsData={accountsData} />
        ) : (
          <RowView sectionWidth={context.sectionWidth} />
        )
      }
    </Consumer>
  );
};
export default inject(({ setup }) => {
  const { viewAs } = setup;

  return {
    viewAs,
  };
})(observer(AccountsTable));
