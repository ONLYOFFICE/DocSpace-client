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
    },
    {
      key: "RoomAdmin",
      label: t("Common:RoomAdmin"),
    },
    {
      key: "User",
      label: t("Common:PowerUser"),
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
