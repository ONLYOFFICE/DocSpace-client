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

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import styled, { css } from "styled-components";

import { Error520Component } from "../../../../components/Error520Wrapper";
import { inject, observer } from "mobx-react";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";
import PersonalSettings from "./CommonSettings";
import GeneralSettings from "./AdminSettings";
import { tablet } from "@docspace/shared/utils";

const StyledContainer = styled.div`
  margin-top: -22px;

  @media ${tablet} {
    margin-top: 0px;
  }
`;

const SectionBodyContent = ({ isErrorSettings, user }) => {
  const { t } = useTranslation(["FilesSettings", "Common"]);

  // const commonSettings = {
  //   id: "personal",
  //   name: t("Common:SettingsPersonal"),
  //   content: <PersonalSettings t={t} />,
  // };

  // const adminSettings = {
  //   id: "general",
  //   name: t("Common:SettingsGeneral"),
  //   content: <GeneralSettings t={t} />,
  // };

  // const data = [commonSettings];

  // const showAdminSettings = user.isAdmin || user.isOwner;

  // if (showAdminSettings) {
  //   data.unshift(adminSettings);
  // }

  // const onSelect = useCallback(
  //   (e) => {
  //     const { id } = e;

  //     if (id === setting) return;

  //     navigate(
  //       combineUrl(
  //         window.ClientConfig?.proxy?.url,
  //         config.homepage,
  //         `/settings/${id}`
  //       )
  //     );
  //   },
  //   [setting, navigate]
  // );

  //const showAdminSettings = user.isAdmin || user.isOwner;

  return isErrorSettings ? (
    <Error520Component />
  ) : (
    <StyledContainer>
      <PersonalSettings
        t={t}
        showTitle={true}
        showAdminSettings={false} //showAdminSettings
      />
    </StyledContainer>
  );
};

export default inject(({ userStore, filesSettingsStore }) => {
  const { settingsIsLoaded } = filesSettingsStore;

  return {
    settingsIsLoaded,
    user: userStore.user,
  };
})(observer(SectionBodyContent));
