import React, { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import styled from "styled-components";
import Box from "@docspace/components/box";
import TextInput from "@docspace/components/text-input";
import Textarea from "@docspace/components/textarea";
import Label from "@docspace/components/label";
import Checkbox from "@docspace/components/checkbox";
import Button from "@docspace/components/button";
import ComboBox from "@docspace/components/combobox";
import Heading from "@docspace/components/heading";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";
import List from "./sub-components/List";
import DeleteDialog from "./sub-components/DeleteDialog";

const OAuth = (props) => {
  const {
    t,
    setDocumentTitle,
    getClients,
    deleteClient,
    currentClient,
  } = props;

  const [isDeleteOpened, setIsDeleteOpened] = useState(false);

  const closeDeleteModal = () => setIsDeleteOpened(false);
  const openDeleteModal = () => setIsDeleteOpened(true);

  useEffect(() => getClients(), []);

  setDocumentTitle("OAuth");

  return (
    <>
      <List openDeleteModal={openDeleteModal} />
      <DeleteDialog
        visible={isDeleteOpened}
        onClose={closeDeleteModal}
        handleSubmit={deleteClient}
        currentClient={currentClient}
      />
    </>
  );
};

export default inject(({ setup, auth, oauthStore }) => {
  const { settingsStore, setDocumentTitle } = auth;
  const { getClients, deleteClient, currentClient } = oauthStore;
  const { theme } = settingsStore;

  return {
    theme,
    setDocumentTitle,
    getClients,
    deleteClient,
    currentClient,
  };
})(withTranslation(["Common"])(observer(OAuth)));
