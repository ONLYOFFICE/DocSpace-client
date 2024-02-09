import React from "react";
import { inject, observer } from "mobx-react";

import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";
import { PluginComponents } from "SRC_DIR/helpers/plugins/enums";

const Plugin = ({ boxProps, pluginName }) => {
  return (
    <WrappedComponent
      pluginName={pluginName}
      component={{ component: PluginComponents.box, props: boxProps }}
    />
  );
};

export default inject(({ pluginStore }, { isRooms, fileView, roomsView }) => {
  const { infoPanelItemsList } = pluginStore;

  const currentView = isRooms ? roomsView : fileView;

  const itemKey = currentView.replace("info_plugin-", "");

  const { value } = infoPanelItemsList.find((i) => i.key === itemKey);

  return {
    boxProps: value.body,

    pluginName: value.name,
  };
})(observer(Plugin));
