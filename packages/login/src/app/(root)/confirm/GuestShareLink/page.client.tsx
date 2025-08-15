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
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";

import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { ButtonsWrapper } from "@/components/Confirm.styled";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { addGuest } from "@docspace/shared/api/people";
import Filter from "@docspace/shared/api/people/filter";

type GuestShareLinkFormProps = {
  guestDisplayName?: string;
  guestAvatar?: string;
};

const GuestShareLinkForm = ({
  guestDisplayName,
  guestAvatar,
}: GuestShareLinkFormProps) => {
  const { linkData } = useContext(ConfirmRouteContext);
  const { confirmHeader = "", email = "" } = linkData;
  const { t } = useTranslation(["Confirm", "Common"]);

  const [isLoading, setIsLoading] = useState(false);

  const onApproveInvite = async () => {
    setIsLoading(true);

    try {
      setIsLoading(false);

      await addGuest(email, confirmHeader);
      const newFilter = Filter.getDefault();
      newFilter.area = "guests";
      newFilter.group = null;

      window.location.replace(
        `/accounts/guests/filter?${newFilter.toUrlParams()}`,
      );
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

  const onDenyInvite = () => {
    window.location.replace("/");
  };

  return (
    <FormWrapper>
      <Avatar
        className="guest-avatar"
        role={AvatarRole.guest}
        source={guestAvatar ?? ""}
        size={AvatarSize.big}
        isDefaultSource
      />
      <div className="guest-info-wrapper">
        <Text fontSize="16px" fontWeight="700" className="guest-name">
          {guestDisplayName}
        </Text>
        <Text fontSize="13px" fontWeight="400" className="guest-email">
          {email}
        </Text>
      </div>
      <ButtonsWrapper className="buttons-guest">
        <Button
          primary
          scale
          size={ButtonSize.medium}
          label={t("Common:Approve")}
          tabIndex={2}
          isDisabled={isLoading}
          onClick={onApproveInvite}
          testId="approve_button"
        />
        <Button
          scale
          size={ButtonSize.medium}
          label={t("Common:Deny")}
          tabIndex={2}
          isDisabled={isLoading}
          onClick={onDenyInvite}
          testId="deny_button"
        />
      </ButtonsWrapper>
      <Text fontSize="12px" fontWeight="400" className="guest-info">
        {t("Common:GuestApprovalNote", { sectionName: t("Common:Contacts") })}
      </Text>
    </FormWrapper>
  );
};

export default GuestShareLinkForm;
