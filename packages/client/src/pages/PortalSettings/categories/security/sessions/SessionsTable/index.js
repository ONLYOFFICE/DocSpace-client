import { inject, observer } from "mobx-react";
import { Consumer } from "@docspace/components/utils/context";

import TableView from "./TableView";
import RowView from "./RowView";

const SessionsTable = ({ t, viewAs, sessionsData }) => {
  return (
    <Consumer>
      {(context) =>
        viewAs === "table" ? (
          <TableView
            t={t}
            sectionWidth={context.sectionWidth}
            sessionsData={sessionsData}
          />
        ) : (
          <RowView
            t={t}
            sectionWidth={context.sectionWidth}
            sessionsData={sessionsData}
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
})(observer(SessionsTable));
