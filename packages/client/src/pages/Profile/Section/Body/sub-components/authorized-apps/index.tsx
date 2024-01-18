import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { IClientProps } from "@docspace/common/utils/oauth/interfaces";

//@ts-ignore
import { DeviceUnionType } from "SRC_DIR/Hooks/useViewEffect";
//@ts-ignore
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
//@ts-ignore
import { Consumer } from "@docspace/components/utils/context";
import { Text } from "@docspace/shared/components/text";

//@ts-ignore
import { OAuthStoreProps, ViewAsType } from "SRC_DIR/store/OAuthStore";
//@ts-ignore
import InfoDialog from "SRC_DIR/pages/PortalSettings/categories/developer-tools/OAuth/sub-components/InfoDialog";

import { StyledContainer } from "./styled-authorized-apps";

import TableView from "./sub-components/TableView";
import RowView from "./sub-components/RowView";
import RevokeDialog from "./sub-components/RevokeDialog";
import EmptyScreen from "./sub-components/EmptyScreen";

interface AuthorizedAppsProps {
  consents?: IClientProps[];
  fetchConsents?: () => Promise<void>;

  viewAs: ViewAsType;
  setViewAs: (value: ViewAsType) => void;

  currentDeviceType: DeviceUnionType;

  infoDialogVisible: boolean;
  fetchScopes?: () => Promise<void>;

  revokeDialogVisible: boolean;
  setRevokeDialogVisible: (value: boolean) => void;
  selection: string[];
  bufferSelection: IClientProps;
  revokeClient: (value: string[]) => Promise<void>;
}

const AuthorizedApps = ({
  consents,
  fetchConsents,
  viewAs,
  setViewAs,
  currentDeviceType,
  infoDialogVisible,
  fetchScopes,
  revokeDialogVisible,
  setRevokeDialogVisible,
  selection,
  bufferSelection,
  revokeClient,
}: AuthorizedAppsProps) => {
  const { t } = useTranslation(["OAuth"]);

  const getConsentList = React.useCallback(async () => {
    fetchScopes?.();
    await fetchConsents?.();
  }, []);

  React.useEffect(() => {
    if (!!consents?.length) return;

    getConsentList();
  }, []);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  return (
    <StyledContainer>
      {consents && consents?.length > 0 ? (
        <>
          {/* @ts-ignore */}
          <Text fontSize={"12px"} fontWeight={"400"} lineHeight={"16px"}>
            {t("ProfileDescription")}
          </Text>

          <Consumer>
            {(context: { sectionWidth: number; sectionHeight: number }) => (
              <>
                {viewAs === "table" ? (
                  <TableView
                    items={consents || []}
                    sectionWidth={context.sectionWidth}
                  />
                ) : (
                  <RowView
                    items={consents || []}
                    sectionWidth={context.sectionWidth}
                  />
                )}
              </>
            )}
          </Consumer>
        </>
      ) : (
        <EmptyScreen t={t} />
      )}
      {infoDialogVisible && (
        <InfoDialog visible={infoDialogVisible} isProfile />
      )}
      {revokeDialogVisible && (
        <RevokeDialog
          visible={revokeDialogVisible}
          onClose={() => setRevokeDialogVisible(false)}
          currentDeviceType={currentDeviceType}
          onRevoke={revokeClient}
          selection={selection}
          bufferSelection={bufferSelection}
        />
      )}
    </StyledContainer>
  );
};

export default inject(
  ({ oauthStore, auth }: { oauthStore: OAuthStoreProps; auth: any }) => {
    const {
      consents,
      fetchConsents,
      fetchScopes,
      viewAs,
      setViewAs,
      infoDialogVisible,
      revokeDialogVisible,
      setRevokeDialogVisible,

      selection,
      bufferSelection,
      revokeClient,
    } = oauthStore;

    const { currentDeviceType } = auth.settingsStore;

    return {
      consents,
      fetchConsents,
      viewAs,
      setViewAs,
      currentDeviceType,
      infoDialogVisible,
      fetchScopes,
      revokeDialogVisible,
      setRevokeDialogVisible,
      selection,
      bufferSelection,
      revokeClient,
    };
  }
)(observer(AuthorizedApps));
