import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Consumer } from "@docspace/shared/utils/context";
import { Text } from "@docspace/shared/components/text";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import OAuthStore from "SRC_DIR/store/OAuthStore";
import InfoDialog from "SRC_DIR/pages/PortalSettings/categories/developer-tools/OAuth/sub-components/InfoDialog";

import { StyledContainer } from "./AuthorizedApps.styled";
import { AuthorizedAppsProps } from "./AuthorizedApps.types";

import TableView from "./sub-components/TableView";
import RowView from "./sub-components/RowView";
import RevokeDialog from "./sub-components/RevokeDialog";
import EmptyScreen from "./sub-components/EmptyScreen";

const AuthorizedApps = ({
  consents,

  viewAs,
  setViewAs,
  currentDeviceType,
  infoDialogVisible,

  revokeDialogVisible,
  setRevokeDialogVisible,
  selection,
  bufferSelection,
  revokeClient,
  logoText,
}: AuthorizedAppsProps) => {
  const { t } = useTranslation(["OAuth"]);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  return (
    <StyledContainer>
      {consents && consents?.length > 0 ? (
        <>
          <Text fontSize="12px" fontWeight="400" lineHeight="16px">
            {t("ProfileDescription")}
          </Text>

          <Consumer>
            {(context) =>
              viewAs === "table" ? (
                <TableView
                  items={consents || []}
                  sectionWidth={context.sectionWidth || 0}
                />
              ) : (
                <RowView
                  items={consents || []}
                  sectionWidth={context.sectionWidth || 0}
                />
              )
            }
          </Consumer>
        </>
      ) : (
        <EmptyScreen t={t} />
      )}
      {infoDialogVisible ? (
        <InfoDialog visible={infoDialogVisible} isProfile />
      ) : null}
      {revokeDialogVisible ? (
        <RevokeDialog
          visible={revokeDialogVisible}
          onClose={() => setRevokeDialogVisible(false)}
          currentDeviceType={currentDeviceType}
          onRevoke={revokeClient}
          selection={selection}
          bufferSelection={bufferSelection}
          logoText={logoText}
        />
      ) : null}
    </StyledContainer>
  );
};

export default inject(
  ({
    oauthStore,
    settingsStore,
  }: {
    oauthStore: OAuthStore;
    settingsStore: SettingsStore;
  }) => {
    const {
      consents,
      viewAs,
      setViewAs,
      infoDialogVisible,
      revokeDialogVisible,
      setRevokeDialogVisible,
      selection,
      bufferSelection,
      revokeClient,
    } = oauthStore;

    const { currentDeviceType, logoText } = settingsStore;

    return {
      consents,
      viewAs,
      setViewAs,
      currentDeviceType,
      infoDialogVisible,
      revokeDialogVisible,
      setRevokeDialogVisible,
      selection,
      bufferSelection,
      revokeClient,
      logoText,
    };
  },
)(observer(AuthorizedApps));
