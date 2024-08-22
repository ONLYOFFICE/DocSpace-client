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

"use client";

import { Trans, useTranslation } from "react-i18next";
import { useContext, useState } from "react";

import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { deletePortal } from "@docspace/shared/api/portal";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";

import { TError } from "@/types";
import { URL_ONLYOFFICE } from "@/utils/constants";

import { ConfirmRouteContext } from "../ConfirmRoute";
import { ButtonsWrapper } from "../Confirm.styled";

type RemovePortalFormProps = {
  siteUrl?: string;
};

const RemovePortalForm = ({ siteUrl }: RemovePortalFormProps) => {
  const { t } = useTranslation(["Confirm", "Common"]);
  const { linkData } = useContext(ConfirmRouteContext);

  const [isRemoved, setIsRemoved] = useState(false);

  const url = siteUrl ? siteUrl : URL_ONLYOFFICE;

  const onDeleteClick = async () => {
    try {
      const res = await deletePortal(linkData.confirmHeader);
      setIsRemoved(true);
      setTimeout(
        () => (location.href = res && typeof res === "string" ? res : url),
        10000,
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

      toastr.error(errorMessage);
      console.error(errorMessage);
    }
  };

  const onCancelClick = () => {
    location.href = "/";
  };

  return (
    <>
      {isRemoved ? (
        <Text>
          <Trans t={t} i18nKey="SuccessRemoved" ns="Confirm">
            Your account has been successfully removed. In 10 seconds you will
            be redirected to the
            <Link isHovered href={url}>
              site
            </Link>
          </Trans>
        </Text>
      ) : (
        <>
          <Text className="subtitle">
            {t("PortalRemoveTitle", {
              productName: t("Common:ProductName"),
            })}
          </Text>
          <ButtonsWrapper>
            <Button
              primary
              scale
              size={ButtonSize.medium}
              label={t("Common:Delete")}
              tabIndex={1}
              onClick={onDeleteClick}
            />
            <Button
              scale
              size={ButtonSize.medium}
              label={t("Common:CancelButton")}
              tabIndex={1}
              onClick={onCancelClick}
            />
          </ButtonsWrapper>
        </>
      )}
    </>
  );
};

export default RemovePortalForm;
