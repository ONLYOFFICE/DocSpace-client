import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Consumer } from "@docspace/components/utils/context";

import TableView from "./TableView";
import RowView from "./RowView";

const AccountsTable = (props) => {
  const { t, viewAs, accountsData, changeGroupType, UserTypes } = props;

  const setTypeDocspaceAdmin = () => changeGroupType(UserTypes.DocSpaceAdmin);
  const setTypeRoomAdmin = () => changeGroupType(UserTypes.RoomAdmin);
  const setTypeUser = () => changeGroupType(UserTypes.User);

  const typeOptions = [
    {
      key: UserTypes.DocSpaceAdmin,
      label: t(`Common:${UserTypes.DocSpaceAdmin}`),
      onClick: setTypeDocspaceAdmin,
    },
    {
      key: UserTypes.RoomAdmin,
      label: t(`Common:${UserTypes.RoomAdmin}`),
      onClick: setTypeRoomAdmin,
    },
    {
      key: UserTypes.User,
      label: t(`Common:PowerUser`),
      onClick: setTypeUser,
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
})(withTranslation(["ChangeUserTypeDialog", "People"])(observer(AccountsTable)));
