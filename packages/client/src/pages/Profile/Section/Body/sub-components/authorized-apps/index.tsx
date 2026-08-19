/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Consumer } from "@docspace/ui-kit/utils/context";
import { Text } from "@docspace/ui-kit/components/text";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";
import OAuthStore from "SRC_DIR/store/OAuthStore";
import InfoDialog from "SRC_DIR/pages/PortalSettings/categories/developer-tools/OAuth/sub-components/InfoDialog";

import { AuthorizedAppsProps } from "./AuthorizedApps.types";

import TableView from "./sub-components/TableView";
import RowView from "./sub-components/RowView";
import RevokeDialog from "./sub-components/RevokeDialog";
import EmptyScreen from "./sub-components/EmptyScreen";
import styles from "./authorized-apps.module.scss";

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
    view: viewAs!,
    setView: setViewAs!,
    currentDeviceType: currentDeviceType!,
  });

  return (
    <div className={styles.container} data-testid="profile-authorized-apps">
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
          onClose={() => setRevokeDialogVisible!(false)}
          currentDeviceType={currentDeviceType!}
          onRevoke={revokeClient!}
          selection={selection!}
          bufferSelection={bufferSelection!}
          logoText={logoText!}
        />
      ) : null}
    </div>
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
