import React, { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import TextInput from "@docspace/components/text-input";
import Label from "@docspace/components/label";
import { inject, observer } from "mobx-react";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";
import Category from "../sub-components/Category";
import { Container, Property } from "../StyledOAuth";

const OAuthDetails = (props) => {
  const { t, setDocumentTitle, currentClient, theme } = props;

  setDocumentTitle("OAuth");

  return (
    <Container>
      <Category
        t={t}
        title={"Basic info"}
        tooltipTitle={"Test"}
        tooltipUrl={""}
        currentColorScheme={theme}
      />
      <Property>
        <Label htmlFor="name" text="App name:" title="Fill app name" />
        <TextInput id="name" value={currentClient.name} />
      </Property>
      <Property>
        <Label htmlFor="icon" text="App icon:" title="Fill app icon" />
        <TextInput id="icon" value={currentClient.logo_uri} />
      </Property>
      <Property>
        <Label
          htmlFor="description"
          text="Description:"
          title="Fill description"
        />
        <TextInput id="description" value={currentClient.description} />
      </Property>
      <StyledSettingsSeparator />
      <Category
        t={t}
        title={"Client ID"}
        tooltipTitle={"Test"}
        tooltipUrl={""}
        currentColorScheme={theme}
      />
      <Property>
        <Label htmlFor="id" text="Client ID:" title="Client ID" />
        <TextInput id="id" value={currentClient.client_id} isDisabled />
      </Property>
      <Property>
        <Label htmlFor="secret" text="Secret:" title="Client secret" />
        <TextInput id="secret" value={currentClient.client_secret} isDisabled />
      </Property>
      <StyledSettingsSeparator />
      <Category
        t={t}
        title={"OAuth urls"}
        tooltipTitle={"Test"}
        tooltipUrl={""}
        currentColorScheme={theme}
      />
      <Property>
        <Label
          htmlFor="redirectUris"
          text="Redirect uris:"
          title="Redirect uris"
        />
        <TextInput id="redirectUris" value={currentClient.redirect_uris} />
      </Property>
      <Property>
        <Label
          htmlFor="allowedOrigins"
          text="Allowed origins:"
          title="Allowed origins"
        />
        <TextInput id="allowedOrigins" value={currentClient.allowed_origins} />
      </Property>
      <StyledSettingsSeparator />
      <Category
        t={t}
        title={"Access scopes"}
        tooltipTitle={"Test"}
        tooltipUrl={""}
        currentColorScheme={theme}
      />
      <Property>
        <Label htmlFor="scopes" text="Scopes:" title="Scopes" />
        <TextInput id="scopes" value={currentClient.scopes} isReadOnly />
      </Property>
      <StyledSettingsSeparator />
      <Category
        t={t}
        title={"Support and legal info"}
        tooltipTitle={"Test"}
        tooltipUrl={""}
        currentColorScheme={theme}
      />
      <Property>
        <Label htmlFor="rootUrl" text="Website URL:" title="Root url" />
        <TextInput id="rootUrl" value={currentClient.root_url} />
      </Property>
      <Property>
        <Label htmlFor="policy" text="Privacy policy URL:" title="Policy" />
        <TextInput id="policy" value={currentClient.policy_uri} />
      </Property>
      <Property>
        <Label htmlFor="terms" text="Terms of Service URL:" title="Terms" />
        <TextInput id="terms" value={currentClient.terms_uri} />
      </Property>
    </Container>
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
