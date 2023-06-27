import React from "react";

import { inject, observer } from "mobx-react";
import { Consumer } from "@docspace/components/utils/context";

import TableView from "./TableView";

const List = ({ viewAs, openSettingsModal, openDeleteModal, projects }) => {
  return (
    <Consumer>
      {(context) => (
        <TableView
          items={projects}
          sectionWidth={context.sectionWidth}
          openSettingsModal={openSettingsModal}
          openDeleteModal={openDeleteModal}
        />
      )}
    </Consumer>
  );
};
export default inject(({ setup, oauthStore }) => {
  const { viewAs } = setup;
  const { projects } = oauthStore;

  return {
    viewAs,
    projects,
  };
})(observer(List));
