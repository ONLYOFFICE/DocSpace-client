import { inject, observer } from "mobx-react";
import { Consumer } from "@docspace/components/utils/context";

import TableView from "./TableView";
import RowView from "./RowView";

const typeOptions = [
  {
    key: "docspace-admin",
    label: "DocSpace admin",
    onClick: () => console.log("changed-type"),
  },
  {
    key: "room-admin",
    label: "Room admin",
    onClick: () => console.log("changed-type"),
  },
  {
    key: "power-user",
    label: "Power user",
    onClick: () => console.log("changed-type"),
  },
];

const AccountsTable = ({ t, viewAs, accountsData }) => {
  return (
    <Consumer>
      {(context) =>
        viewAs === "table" ? (
          <TableView
            t={t}
            sectionWidth={context.sectionWidth}
            accountsData={accountsData}
            typeOptions={typeOptions}
          />
        ) : (
          <RowView
            t={t}
            sectionWidth={context.sectionWidth}
            accountsData={accountsData}
            typeOptions={typeOptions}
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
