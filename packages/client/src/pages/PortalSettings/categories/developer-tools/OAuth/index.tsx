// (c) Copyright Ascensio System SIA 2009-2025
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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import OAuthStore from "SRC_DIR/store/OAuthStore";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import { OAuthContainer } from "./OAuth.styled";
import { OAuthProps } from "./OAuth.types";

import InfoDialog from "./sub-components/InfoDialog";
import PreviewDialog from "./sub-components/PreviewDialog";
import GenerateDeveloperTokenDialog from "./sub-components/GenerateDeveloperTokenDialog";
import RevokeDeveloperTokenDialog from "./sub-components/RevokeDeveloperTokenDialog";
import DisableDialog from "./sub-components/DisableDialog";
import DeleteDialog from "./sub-components/DeleteDialog";

import List from "./sub-components/List";

const MIN_LOADER_TIME = 0;

const OAuth = ({
  clientList,
  viewAs,

  setViewAs,
  fetchClients,
  fetchScopes,

  currentDeviceType,

  isInit,
  setIsInit,

  infoDialogVisible,
  previewDialogVisible,
  disableDialogVisible,
  deleteDialogVisible,
  generateDeveloperTokenDialogVisible,
  revokeDeveloperTokenDialogVisible,
  apiOAuthLink,
  logoText,
}: OAuthProps) => {
  const { t } = useTranslation(["OAuth"]);

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<null | Error>(null);

  const startLoadingRef = React.useRef<null | Date>(null);

  const getData = React.useCallback(async () => {
    if (startLoadingRef.current) return;
    const actions: Promise<void>[] = [];

    try {
      if (!isInit) {
        actions.push(fetchScopes());
      }

      actions.push(fetchClients());

      startLoadingRef.current = new Date();

      await Promise.all(actions);
    } catch (e) {
      setError(e as Error);
    }

    if (startLoadingRef.current) {
      const currentDate = new Date();

      const ms = Math.abs(
        startLoadingRef.current.getTime() - currentDate.getTime(),
      );

      if (ms < MIN_LOADER_TIME)
        return setTimeout(() => {
          setIsLoading(false);
          setIsInit(true);
        }, MIN_LOADER_TIME - ms);
    }

    setIsLoading(false);
    startLoadingRef.current = null;
    setIsInit(true);
  }, [fetchClients, fetchScopes, isInit, setIsInit]);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  React.useEffect(() => {
    if (startLoadingRef.current) return;
    setIsLoading(true);
    getData();
  }, [getData]);

  React.useEffect(() => {
    setDocumentTitle(t("OAuth"));
  }, [t]);

  return (
    <OAuthContainer>
      {/* {false ? (
        <OAuthLoader viewAs={viewAs} currentDeviceType={currentDeviceType} />
      ) : isEmptyClientList ? (
        <OAuthEmptyScreen apiOAuthLink={apiOAuthLink} logoText={logoText} />
      ) : ( */}
      <List
        clients={clientList}
        viewAs={viewAs}
        currentDeviceType={currentDeviceType}
        apiOAuthLink={apiOAuthLink}
        logoText={logoText}
        isLoading={isLoading}
        isError={!!error}
      />
      {infoDialogVisible ? <InfoDialog visible={infoDialogVisible} /> : null}
      {disableDialogVisible ? <DisableDialog /> : null}
      {previewDialogVisible ? (
        <PreviewDialog visible={previewDialogVisible} />
      ) : null}
      {deleteDialogVisible ? <DeleteDialog /> : null}
      {generateDeveloperTokenDialogVisible ? (
        <GenerateDeveloperTokenDialog />
      ) : null}
      {revokeDeveloperTokenDialogVisible ? (
        <RevokeDeveloperTokenDialog />
      ) : null}
    </OAuthContainer>
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
    const { currentDeviceType, apiOAuthLink, logoText } = settingsStore;
    const {
      isEmptyClientList,
      clientList,
      viewAs,

      setViewAs,
      fetchClients,
      fetchScopes,

      isInit,
      setIsInit,

      infoDialogVisible,
      previewDialogVisible,
      disableDialogVisible,
      deleteDialogVisible,
      generateDeveloperTokenDialogVisible,
      revokeDeveloperTokenDialogVisible,
    } = oauthStore;
    return {
      isEmptyClientList,
      clientList,
      viewAs,

      setViewAs,
      fetchClients,
      fetchScopes,

      currentDeviceType,

      isInit,
      setIsInit,

      infoDialogVisible,
      previewDialogVisible,
      disableDialogVisible,
      deleteDialogVisible,
      generateDeveloperTokenDialogVisible,
      revokeDeveloperTokenDialogVisible,
      apiOAuthLink,
      logoText,
    };
  },
)(observer(OAuth));
