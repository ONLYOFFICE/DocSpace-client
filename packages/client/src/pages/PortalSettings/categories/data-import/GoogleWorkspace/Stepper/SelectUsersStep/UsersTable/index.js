import { Consumer } from "@docspace/components/utils/context";
import { inject, observer } from "mobx-react";

import TableView from "./TableView";
import RowView from "./RowView";

const UsersTable = ({ t, viewAs, usersData }) => {
  return (
    <Consumer>
      {(context) =>
        viewAs === "table" ? (
          <TableView
            t={t}
            sectionWidth={context.sectionWidth}
            usersData={usersData}
          />
        ) : (
          <RowView
            t={t}
            sectionWidth={context.sectionWidth}
            usersData={usersData}
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
})(observer(UsersTable));
