import React from "react";
import DynamicComponent from "./DynamicComponent";
import { CLIENT_REMOTE_ENTRY_URL, CLIENT_SCOPE } from "../helpers/constants";

const StartFillingPanel = ({ isVisible, mfReady, successAuth, ...rest }) => {
  return (
    (mfReady && isVisible && successAuth && (
      <DynamicComponent
        {...rest}
        system={{
          scope: CLIENT_SCOPE,
          url: CLIENT_REMOTE_ENTRY_URL,
          module: "./StartFillingPanel",
        }}
        visible={isVisible}
      />
    )) ||
    null
  );
};

export default StartFillingPanel;
