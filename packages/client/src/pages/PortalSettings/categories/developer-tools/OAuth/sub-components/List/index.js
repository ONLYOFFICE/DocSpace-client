import React from "react";

import { inject, observer } from "mobx-react";
import { Consumer } from "@docspace/components/utils/context";

import TableView from "./TableView";
import RowView from "./RowView";

const List = (props) => {
  const { viewAs, openSettingsModal, openDeleteModal } = props;

  return (
    <Consumer>
      {(context) =>
        viewAs === "table" ? (
          <TableView
            sectionWidth={context.sectionWidth}
            openSettingsModal={openSettingsModal}
            openDeleteModal={openDeleteModal}
          />
        ) : (
          <RowView
            sectionWidth={context.sectionWidth}
            openSettingsModal={openSettingsModal}
            openDeleteModal={openDeleteModal}
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
})(observer(List));
