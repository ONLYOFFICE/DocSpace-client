import React from "react";
import { inject, observer } from "mobx-react";
import { Consumer } from "@docspace/ui-kit/utils";
import { DeviceType } from "@docspace/shared/enums";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import TableView from "./TableView";
import RowView from "./RowView";

type ModelSettingsTableProps = {
  viewAs?: string;
  setViewAs?: (view: string) => void;
  currentDeviceType?: DeviceType;
  isDisabled: boolean;
};

const ModelSettingsTable = ({
  viewAs,
  setViewAs,
  currentDeviceType,
  isDisabled,
}: ModelSettingsTableProps) => {
  useViewEffect({
    view: viewAs!,
    setView: setViewAs!,
    currentDeviceType: currentDeviceType!,
  });

  return (
    <Consumer>
      {(context) =>
        viewAs === "table" ? (
          <TableView
            sectionWidth={context.sectionWidth || 0}
            isDisabled={isDisabled}
          />
        ) : (
          <RowView
            sectionWidth={context.sectionWidth || 0}
            isDisabled={isDisabled}
          />
        )
      }
    </Consumer>
  );
};

export default inject(({ setup, settingsStore }: TStore) => {
  const { viewAs, setViewAs } = setup;
  const { currentDeviceType } = settingsStore;

  return {
    viewAs,
    setViewAs,
    currentDeviceType,
  };
})(observer(ModelSettingsTable));
