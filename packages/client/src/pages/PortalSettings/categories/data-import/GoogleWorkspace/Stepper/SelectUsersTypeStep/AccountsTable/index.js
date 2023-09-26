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
      onClick: (e) => console.log(e),
    },
    {
      key: "RoomAdmin",
      label: t("Common:RoomAdmin"),
      onClick: (e) => console.log(e),
    },
    {
      key: "User",
      label: t("Common:PowerUser"),
      onClick: (e) => console.log(e),
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
})(
  withTranslation(["ChangeUserTypeDialog", "People"])(observer(AccountsTable))
);
