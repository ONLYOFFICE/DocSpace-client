// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { Text } from "@docspace/shared/components/text";

import MultipleSpaces from "./sub-components/MultipleSpaces";
import ConfigurationSection from "./sub-components/ConfigurationSection";
import ChangeDomainDialog from "./sub-components/dialogs/ChangeDomainDialog";
import CreatePortalDialog from "./sub-components/dialogs/CreatePortalDialog";
import DeletePortalDialog from "./sub-components/dialogs/DeletePortalDialog";
import { SpacesLoader } from "./sub-components/SpacesLoader";
import { SpaceContainer } from "./StyledSpaces";

import { useStore } from "SRC_DIR/store";
import { setDocumentTitle } from "SRC_DIR/utils";

const Spaces = () => {
  const { t } = useTranslation(["Management", "Common", "Settings"]);

  const { spacesStore, settingsStore } = useStore();

  const {
    isConnected,
    domainDialogVisible,
    createPortalDialogVisible,
    deletePortalDialogVisible,
  } = spacesStore;

  const { portals, logoText } = settingsStore;

  React.useEffect(() => {
    setDocumentTitle(t("Common:Spaces"), logoText);
  }, []);

  if (!(portals.length > 0))
    return <SpacesLoader isConfigurationSection={!isConnected} />;

  return (
    <SpaceContainer>
      {deletePortalDialogVisible && (
        <DeletePortalDialog key="delete-portal-dialog" />
      )}
      {domainDialogVisible && <ChangeDomainDialog key="change-domain-dialog" />}
      {createPortalDialogVisible && (
        <CreatePortalDialog key="create-portal-dialog" />
      )}
      <div className="spaces-header">
        <Text fontSize="12px" fontWeight={400}>
          {t("Subheader")}
        </Text>
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
