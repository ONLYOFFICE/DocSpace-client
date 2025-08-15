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

"use client";

import { useContext, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { deleteSelf } from "@docspace/shared/api/people";

import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { GreetingContainer } from "@/components/GreetingContainer";

type ProfileRemoveFormProps = {
  legalTerms: string;
  greetingSettings: string;
};

const ProfileRemoveForm = ({
  legalTerms,
  greetingSettings,
}: ProfileRemoveFormProps) => {
  const { linkData } = useContext(ConfirmRouteContext);
  const { t } = useTranslation(["Confirm", "Common"]);
  const { currentColorScheme } = useTheme();

  const [isProfileDeleted, setIsProfileDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onDeleteProfile = async () => {
    setIsLoading(true);

    try {
      await deleteSelf(linkData.confirmHeader);

      setIsLoading(false);
      setIsProfileDeleted(true);
    } catch (error) {
      const knownError = error as TError;
      let errorMessage: string;

      if (typeof knownError === "object") {
        errorMessage =
          knownError?.response?.data?.error?.message ||
          knownError?.statusText ||
          knownError?.message ||
          "";
      } else {
        errorMessage = knownError;
      }
      console.error(errorMessage);

      setIsLoading(false);
      toastr.error(errorMessage);
    }
  };

  if (isProfileDeleted) {
    return (
      <>
        <GreetingContainer
          greetingText={t("Confirm:DeleteProfileSuccessMessage", {
            productName: t("Common:ProductName"),
          })}
        />
        <FormWrapper>
          <Text>
            {t("DeleteProfileSuccessDescription", {
              productName: t("Common:ProductName"),
            })}
            <Trans i18nKey="DeleteProfileSuccessMessageInfo" ns="Confirm" t={t}>
              Please check our
              <Link
                type={LinkType.page}
                href={legalTerms}
                color={currentColorScheme?.main?.accent}
                target={LinkTarget.blank}
                dataTestId="privacy_policy_link"
              >
                Privacy policy
              </Link>
              to learn more about deleting your account and associated data.
            </Trans>
          </Text>
        </FormWrapper>
      </>
    );
  }

  return (
    <>
      <GreetingContainer greetingText={greetingSettings} />
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
            <Trans i18nKey="DeleteProfileConfirmationInfo" ns="Confirm" t={t}>
              By clicking &quot;Disable my account&quot; you agree with our
              Privacy policy
              <Link
                type={LinkType.page}
                href={legalTerms}
                color={currentColorScheme?.main?.accent}
                target={LinkTarget.blank}
                dataTestId="privacy_policy_link"
              >
                Privacy policy.
              </Link>
            </Trans>
          </Text>
        </div>

        <Button
          primary
          scale
          size={ButtonSize.medium}
          label={t("DeleteProfileBtn")}
          tabIndex={1}
          isDisabled={isLoading}
          onClick={onDeleteProfile}
          testId="delete_profile_button"
        />
      </FormWrapper>
    </>
  );
};

export default ProfileRemoveForm;
