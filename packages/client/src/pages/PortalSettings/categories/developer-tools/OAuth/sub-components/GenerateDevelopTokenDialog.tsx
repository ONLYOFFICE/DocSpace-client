import React from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";

const GenerateDeveloperTokenDialog = () => {
  return <div></div>;
};

export default inject(({ oauthStore }: { oauthStore: OAuthStoreProps }) => {
  const {
    setInfoDialogVisible,
    bufferSelection,
    scopeList,
    getContextMenuItems,
  } = oauthStore;

  return {
    setInfoDialogVisible,
    client: bufferSelection,
    scopeList,
    getContextMenuItems,
  };
})(observer(GenerateDeveloperTokenDialog));
