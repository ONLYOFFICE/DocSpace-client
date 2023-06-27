import React from "react";

import { inject, observer } from "mobx-react";
import { Consumer } from "@docspace/components/utils/context";

import TableView from "./TableView";

const List = ({ viewAs, openSettingsModal, openDeleteModal, clients }) => {
  return (
    <Consumer>
      {(context) => (
        <TableView
          items={clients}
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
  const { clients } = oauthStore;

  return {
    viewAs,
    clients,
  };
})(observer(List));
