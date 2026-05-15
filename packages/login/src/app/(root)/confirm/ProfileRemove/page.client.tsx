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

"use client";

import { useContext, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { FormWrapper } from "@docspace/ui-kit/components/form-wrapper";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";
import { deleteSelf } from "@docspace/shared/api/people";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { GreetingContainer } from "@/components/GreetingContainer";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { getBrandName } from "@docspace/shared/constants/brands";

type ProfileRemoveFormProps = {
  legalTerms: string;
  greetingSettings: string;

  avatar?: string;
  displayName?: string;
  email?: string;
};

const ProfileRemoveForm = ({
  legalTerms,
  greetingSettings,

  avatar,
  displayName,
  email,
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
            productName: getBrandName("ProductName"),
          })}
        />
        <FormWrapper>
          <Text>
            {t("DeleteProfileSuccessDescription", {
              productName: getBrandName("ProductName"),
            })}
            <br />
            <Trans i18nKey="DeleteProfileSuccessMessageInfo" ns="Confirm" t={t}>
              Please check our
              <Link
                type={LinkType.page}
                href={legalTerms}
                color={currentColorScheme?.main?.accent ?? undefined}
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

          <div className="user-info-wrapper">
            <Avatar
              role={AvatarRole.user}
              source={avatar ?? ""}
              size={AvatarSize.min}
              isDefaultSource
            />
            <div>
              <Text fontSize="14px" fontWeight="600" lineHeight="16px">
                {displayName}
              </Text>
              <Text
                fontSize="12px"
                fontWeight="400"
                lineHeight="16px"
                className="user-email"
              >
                {email}
              </Text>
            </div>
          </div>

          <Text>
            <Trans i18nKey="DeleteProfileConfirmationInfo" ns="Confirm" t={t}>
              By clicking &quot;Disable my account&quot; you agree with our
              Privacy policy
              <Link
                type={LinkType.page}
                href={legalTerms}
                color={currentColorScheme?.main?.accent ?? undefined}
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
