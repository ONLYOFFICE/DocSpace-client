import React from "react";
import { useTranslation } from "react-i18next";
import Text from "@docspace/components/text";
import MultipleSpaces from "./sub-components/MultipleSpaces";
import { SpaceContainer } from "./StyledSpaces";
import ConfigurationSection from "./sub-components/ConfigurationSection";
import { observer } from "mobx-react";
import { useStore } from "SRC_DIR/store";
import ChangeDomainDialog from "./sub-components/dialogs/ChangeDomainDialog";
import CreatePortalDialog from "./sub-components/dialogs/CreatePortalDialog";
import DeletePortalDialog from "./sub-components/dialogs/DeletePortalDialog";
import { SpacesLoader } from "./sub-components/SpacesLoader";


const Spaces = () => {
  const { t } = useTranslation(["Management", "Common", "Settings"]);

  const { spacesStore, authStore } = useStore();

  const { isConnected, domainDialogVisible, createPortalDialogVisible, deletePortalDialogVisible } =
    spacesStore;
  const { setDocumentTitle } = authStore;
  const { portals } = authStore.settingsStore;

  React.useEffect(() => {
    setDocumentTitle(t("Common:Spaces"));
  }, []);

  if (!(portals.length > 0))
    return <SpacesLoader isConfigurationSection={!isConnected} />;

  return (
    <SpaceContainer>
      {deletePortalDialogVisible && <DeletePortalDialog key="delete-portal-dialog" />}
      {domainDialogVisible && <ChangeDomainDialog key="change-domain-dialog" />}
      {createPortalDialogVisible && (
        <CreatePortalDialog key="create-portal-dialog" />
      )}
      <div className="spaces-header">
        <Text fontSize="12px" fontWeight={400} >{t("Subheader")}</Text>
      </div>
      {isConnected && portals.length > 0 ? (
        <MultipleSpaces t={t} />
      ) : (
        <ConfigurationSection t={t} />
      )}
    </SpaceContainer>
  );
};

export default observer(Spaces);
