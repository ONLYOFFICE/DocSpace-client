import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Consumer } from "@docspace/components/utils/context";

import TableView from "./TableView";
import RowView from "./RowView";

const AccountsTable = ({ t, viewAs, accountsData }) => {
  const typeOptions = [
    {
      key: "DocSpaceAdmin",
      label: t("Common:DocSpaceAdmin"),
      onClick: () => console.log("changed-type"),
    },
    {
      key: "RoomAdmin",
      label: t("Common:RoomAdmin"),
      onClick: () => console.log("changed-type"),
    },
    {
      key: "PowerUser",
      label: t("Common:PowerUser"),
      onClick: () => console.log("changed-type"),
    },
  ];

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
})(withTranslation(["ChangeUserTypeDialog"])(observer(AccountsTable)));

// export default withTranslation(["Common, Settings"])(GoogleWorkspace);
