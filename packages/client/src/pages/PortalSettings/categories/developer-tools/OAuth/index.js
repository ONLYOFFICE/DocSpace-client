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

const OAuth = (props) => {
  const { t, setDocumentTitle } = props;

  setDocumentTitle("OAuth");

  return (
    <>
      {isMobile ? (
        <BreakpointWarning sectionName={"OAuth"} />
      ) : (
        <List openSettingsModal={() => {}} openDeleteModal={() => {}} />
      )}
    </>
  );
};

export default inject(({ setup, auth }) => {
  const { settingsStore, setDocumentTitle } = auth;
  const { theme } = settingsStore;

  return {
    theme,
    setDocumentTitle,
  };
})(withTranslation(["Common"])(observer(OAuth)));
