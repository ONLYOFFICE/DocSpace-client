import React from "react";
import styled from "styled-components";

import Button from "@docspace/components/button";

import { PluginComponent } from "SRC_DIR/helpers/plugins/WrappedComponent";

const StyledContainer = styled.div`
  width: 100%;

  display: flex;
  align-items: space-between;
  gap: 10px;
`;

const Footer = ({
  t,

  pluginName,

  saveButtonProps,
  modalRequestRunning,
  setModalRequestRunning,
  onCloseAction,
  updatePlugin,
}) => {
  return (
    <StyledContainer>
      <PluginComponent
        component={{
          ...saveButtonProps,
          props: {
            ...saveButtonProps?.props,
            scale: true,
            isSaveButton: true,
            primary: true,
            size: "normal",
            label: t("Common:SaveButton"),
            modalRequestRunning,
            setSettingsModalRequestRunning: setModalRequestRunning,
            onCloseAction,
          },
        }}
        pluginName={pluginName}
        updatePlugin={updatePlugin}
      />
      <Button
        scale={true}
        size={"normal"}
        onClick={onCloseAction}
        label={t("Common:CancelButton")}
      />
    </StyledContainer>
  );
};

export default Footer;
