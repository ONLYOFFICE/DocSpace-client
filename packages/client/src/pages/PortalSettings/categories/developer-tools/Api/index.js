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

import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { mobile } from "@docspace/shared/utils";
import { Button } from "@docspace/shared/components/button";
import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import ConfirmWrapper from "SRC_DIR/components/ConfirmWrapper";

import ApiSvgUrl from "PUBLIC_DIR/images/settings.api.svg?url";
import ApiDarkSvgUrl from "PUBLIC_DIR/images/settings.api.dark.svg?url";
import { DeviceType } from "@docspace/shared/enums";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const EmptyContainer = styled(EmptyScreenContainer)`
  .ec-header {
    font-size: 23px !important;
  }

  .ec-image {
    margin-inline-end: 22px;
    margin-top: 22px;

    @media ${mobile} {
      margin-bottom: 22px;
    }
  }

  .ec-desc {
    font-size: 13px !important;
    margin-top: 12px;
    margin-bottom: 22px;
  }
`;

const Api = (props) => {
  const {
    t,
    tReady,
    theme,
    apiBasicLink,
    currentDeviceType,
    logoText,
    isPortalSettingsLoading,
  } = props;

  const imgSrc = theme.isBase ? ApiSvgUrl : ApiDarkSvgUrl;

  useEffect(() => {
    if (tReady) setDocumentTitle(t("Api"));
  }, [tReady]);

  if (isPortalSettingsLoading || !tReady) return null;

  return (
    <ConfirmWrapper height="100%">
      <EmptyContainer
        buttons={
          <Button
            label={t("Common:LearnMore")}
            primary
            size="normal"
            minWidth="135px"
            testId="learn_more_button"
            onClick={() => window.open(apiBasicLink, "_blank")}
            scale={currentDeviceType === DeviceType.mobile}
          />
        }
        descriptionText={t("ApiPageDescription", {
          productName: t("Common:ProductName"),
          organizationName: logoText,
        })}
        headerText={t("ApiPageHeader")}
        imageAlt={t("ApiPageHeader")}
        imageSrc={imgSrc}
      />
    </ConfirmWrapper>
  );
};

export default inject(({ settingsStore }) => {
  const { theme, apiBasicLink, currentDeviceType, logoText } = settingsStore;

  return {
    theme,
    apiBasicLink,
    currentDeviceType,
    logoText,
  };
})(withTranslation(["Settings", "Common"])(observer(Api)));
