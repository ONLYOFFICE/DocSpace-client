import React from "react";
import DynamicComponent from "./DynamicComponent";
import { CLIENT_REMOTE_ENTRY_URL, CLIENT_SCOPE } from "../helpers/constants";

const SelectRoomPanel = ({ isVisible, mfReady, successAuth }) => {
  return (
    (mfReady && isVisible && successAuth && (
      <DynamicComponent
        system={{
          scope: CLIENT_SCOPE,
          url: CLIENT_REMOTE_ENTRY_URL,
          module: "./SelectRoomPanel",
          name: "SelectRoomPanel",
        }}
        isVisible={isVisible}
      />
    )) ||
    null
  );
};

export default SelectRoomPanel;
