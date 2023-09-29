import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Consumer } from "@docspace/components/utils/context";

import TableView from "./TableView";
import RowView from "./RowView";

const AccountsTable = (props) => {
  const { t, viewAs, accountsData, changeTypeGroup } = props;

  const onChangeType = (key) => {
    changeTypeGroup(key);
  };

  const typeOptions = [
    {
      key: "DocSpaceAdmin",
      label: t("Common:DocSpaceAdmin"),
      onClick: () => onChangeType("DocSpaceAdmin"),
    },
    {
      key: "RoomAdmin",
      label: t("Common:RoomAdmin"),
      onClick: () => onChangeType("RoomAdmin"),
    },
    {
      key: "User",
      label: t("Common:PowerUser"),
      onClick: () => onChangeType("User"),
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
export default inject(({ setup, importAccountsStore }) => {
  const { viewAs } = setup;
  const { changeTypeGroup } = importAccountsStore;

  return {
    viewAs,
    changeTypeGroup,
  };
})(
  withTranslation(["ChangeUserTypeDialog", "People"])(observer(AccountsTable))
);
