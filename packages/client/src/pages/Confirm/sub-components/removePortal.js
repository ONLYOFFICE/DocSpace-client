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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";

import { deletePortal } from "@docspace/shared/api/portal";
import {
  StyledPage,
  StyledBody,
  StyledContent,
  ButtonsWrapper,
} from "./StyledConfirm";

import withLoader from "../withLoader";

import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import DocspaceLogo from "../../../components/DocspaceLogoWrapper";

const RemovePortal = (props) => {
  const { t, greetingTitle, linkData, companyInfoSettingsData } = props;
  const [isRemoved, setIsRemoved] = useState(false);
  const navigate = useNavigate();

  const url = companyInfoSettingsData?.site
    ? companyInfoSettingsData.site
    : "https://onlyoffice.com";

  const onDeleteClick = async () => {
    try {
      await deletePortal(linkData.confirmHeader);
      setIsRemoved(true);
      setTimeout(() => (location.href = url), 10000);
    } catch (e) {
      toastr.error(e);
    }
  };

  const onCancelClick = () => {
    navigate("/");
  };

  return (
    <StyledPage>
      <StyledContent>
        <StyledBody>
          <DocspaceLogo className="docspace-logo" />
          <Text fontSize="23px" fontWeight="700" className="title">
            {greetingTitle}
          </Text>

          <FormWrapper>
            {isRemoved ? (
              <Text>
                <Trans t={t} i18nKey="SuccessRemoved" ns="Confirm">
                  Your account has been successfully removed. In 10 seconds you
                  will be redirected to the
                  <Link isHovered href={url}>
                    site
                  </Link>
                </Trans>
              </Text>
            ) : (
              <>
                <Text className="subtitle">{t("PortalRemoveTitle")}</Text>
                <ButtonsWrapper>
                  <Button
                    primary
                    scale
                    size="medium"
                    label={t("Common:Delete")}
                    tabIndex={1}
                    onClick={onDeleteClick}
                  />
                  <Button
                    scale
                    size="medium"
                    label={t("Common:CancelButton")}
                    tabIndex={1}
                    onClick={onCancelClick}
                  />
                </ButtonsWrapper>
              </>
            )}
          </FormWrapper>
        </StyledBody>
      </StyledContent>
    </StyledPage>
  );
};

export default inject(({ settingsStore }) => ({
  greetingTitle: settingsStore.greetingSettings,
  theme: settingsStore.theme,
  companyInfoSettingsData: settingsStore.companyInfoSettingsData,
}))(withTranslation(["Confirm", "Common"])(withLoader(observer(RemovePortal))));
