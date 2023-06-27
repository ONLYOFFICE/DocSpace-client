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

const Container = styled.div`
  width: 100%;
  margin-top: 5px;
`;

const Property = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const OAuthDetails = (props) => {
  const { t, setDocumentTitle, currentClient } = props;

  setDocumentTitle("OAuth");

  return (
    <>
      <Container>
        <Property>
          <Label htmlFor="name" text="Name:" title="Fill the client name" />
          <TextInput id="name" value={currentClient.name} />
        </Property>
        <Property>
          <Label
            htmlFor="description"
            text="Description:"
            title="Fill the client description"
          />
          <TextInput id="description" value={currentClient.description} scale />
        </Property>
        <Property>
          <Label htmlFor="id" text="Id:" title="Client id" />
          <TextInput id="id" value={currentClient.client_id} isDisabled scale />
        </Property>
        <Property>
          <Label htmlFor="secret" text="Secret:" title="Client secret" />
          <TextInput
            id="secret"
            value={currentClient.client_secret}
            isDisabled
            scale
          />
        </Property>
        <Property>
          <Label htmlFor="rootUrl" text="Root url:" title="Root url" />
          <TextInput
            id="rootUrl"
            value={currentClient.root_url}
            isReadOnly
            scale
          />
        </Property>
        <Property>
          <Label
            htmlFor="redirectUris"
            text="Redirect uris:"
            title="Redirect uris"
          />
          <TextInput
            id="redirectUris"
            value={currentClient.redirect_uris}
            isReadOnly
            scale
          />
        </Property>
        <Property>
          <Label
            htmlFor="allowedOrigins"
            text="Allowed origins:"
            title="Allowed origins"
          />
          <TextInput
            id="allowedOrigins"
            value={currentClient.allowed_origins}
            isReadOnly
            scale
          />
        </Property>
        <Property>
          <Label htmlFor="scopes" text="Scopes:" title="Scopes" />
          <TextInput
            id="scopes"
            value={currentClient.scopes}
            isReadOnly
            scale
          />
        </Property>
      </Container>
    </>
  );
};

export default inject(({ setup, auth, oauthStore }) => {
  const { settingsStore, setDocumentTitle } = auth;
  const { theme } = settingsStore;
  const { currentClient } = oauthStore;

  return {
    theme,
    setDocumentTitle,
    currentClient,
  };
})(withTranslation(["Common"])(observer(OAuthDetails)));
