import { Consumer } from "@docspace/components/utils/context";
import { inject, observer } from "mobx-react";

import TableView from "./TableView";
import RowView from "./RowView";

const AccountsTable = ({ t, viewAs, accountsData }) => {
  return (
    <Consumer>
      {(context) =>
        viewAs === "table" ? (
          <TableView
            t={t}
            sectionWidth={context.sectionWidth}
            accountsData={accountsData}
          />
        ) : (
          <RowView
            t={t}
            sectionWidth={context.sectionWidth}
            accountsData={accountsData}
          />
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
