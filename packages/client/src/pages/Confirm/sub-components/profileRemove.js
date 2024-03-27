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

import { withTranslation, Trans } from "react-i18next";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import { inject, observer } from "mobx-react";
import { deleteSelf } from "@docspace/shared/api/people";
import { toastr } from "@docspace/shared/components/toast";
import { StyledPage, StyledBody, StyledContent } from "./StyledConfirm";
import withLoader from "../withLoader";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import DocspaceLogo from "../../../components/DocspaceLogoWrapper";

const ProfileRemoveForm = (props) => {
  const { t, greetingTitle, linkData, legalTerms, currentColorScheme } = props;
  const [isProfileDeleted, setIsProfileDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log(legalTerms);

  const onDeleteProfile = () => {
    setIsLoading(true);

    deleteSelf(linkData.confirmHeader)
      .then((res) => {
        setIsLoading(false);
        setIsProfileDeleted(true);
      })
      .catch((e) => {
        setIsLoading(false);
        toastr.error(e);
      });
  };

  if (isProfileDeleted) {
    return (
      <StyledPage>
        <StyledContent>
          <StyledBody>
            <DocspaceLogo className="docspace-logo" />
            <Text fontSize="23px" fontWeight="700" className="title">
              {t("DeleteProfileSuccessMessage")}
            </Text>
            <Text fontSize="16px" fontWeight="600" className="confirm-subtitle">
              <Trans
                i18nKey="DeleteProfileSuccessMessageInfo"
                ns="Confirm"
                t={t}
              >
                See our
                <Link
                  fontSize="16px"
                  fontWeight="600"
                  type="page"
                  href={legalTerms}
                  color={currentColorScheme?.main?.accent}
                  target="_blank"
                >
                  Privacy policy
                </Link>
                to learn more about deleting your account and the data
                associated with it.
              </Trans>
            </Text>
          </StyledBody>
        </StyledContent>
      </StyledPage>
    );
  }

  return (
    <StyledPage>
      <StyledContent>
        <StyledBody>
          <DocspaceLogo className="docspace-logo" />
          <Text fontSize="23px" fontWeight="700" className="title">
            {greetingTitle}
          </Text>

          <FormWrapper>
            <div className="subtitle">
              <Text
                fontSize="16px"
                fontWeight="600"
                className="delete-profile-confirm"
              >
                {t("DeleteProfileConfirmation")}
              </Text>
              <Text>
                <Trans
                  i18nKey="DeleteProfileConfirmationInfo"
                  ns="Confirm"
                  t={t}
                >
                  By clicking \"Delete my account\" you agree with our Privacy
                  policy
                  <Link
                    type="page"
                    href={legalTerms}
                    color={currentColorScheme?.main?.accent}
                    target="_blank"
                  >
                    Privacy policy.
                  </Link>
                </Trans>
              </Text>
            </div>

            <Button
              primary
              scale
              size="medium"
              label={t("DeleteProfileBtn")}
              tabIndex={1}
              isDisabled={isLoading}
              onClick={onDeleteProfile}
            />
          </FormWrapper>
        </StyledBody>
      </StyledContent>
    </StyledPage>
  );
};

export default inject(({ settingsStore }) => ({
  greetingTitle: settingsStore.greetingSettings,
  theme: settingsStore.theme,
  legalTerms: settingsStore.legalTerms,
  currentColorScheme: settingsStore.currentColorScheme,
}))(withTranslation("Confirm")(withLoader(observer(ProfileRemoveForm))));
