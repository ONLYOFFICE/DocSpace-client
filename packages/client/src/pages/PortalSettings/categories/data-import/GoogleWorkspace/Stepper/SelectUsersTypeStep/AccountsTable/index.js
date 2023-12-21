import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Consumer } from "@docspace/components/utils/context";

import TableView from "./TableView";
import RowView from "./RowView";

const AccountsTable = ({
  t,
  viewAs,
  accountsData,
  changeGroupType,
  UserTypes,
}) => {
  const typeOptions = [
    {
      key: "DocSpaceAdmin",
      label: t("Common:DocSpaceAdmin"),
      onClick: () => changeGroupType(UserTypes.DocSpaceAdmin),
    },
    {
      key: "RoomAdmin",
      label: t("Common:RoomAdmin"),
      onClick: () => changeGroupType(UserTypes.RoomAdmin),
    },
    {
      key: "User",
      label: t("Common:PowerUser"),
      onClick: () => changeGroupType(UserTypes.User),
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
  const { changeGroupType, UserTypes } = importAccountsStore;

  return {
    viewAs,
    changeGroupType,
    UserTypes,
  };
})(
  withTranslation(["ChangeUserTypeDialog", "People"])(observer(AccountsTable))
);
