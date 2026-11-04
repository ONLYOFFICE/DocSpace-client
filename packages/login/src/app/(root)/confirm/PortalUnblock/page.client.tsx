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

import { Link } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { unblockPortal } from "@docspace/shared/api/portal";

import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import styles from "../confirm.module.scss";

const UnblockPortalForm = () => {
  const { t } = useTranslation(["Confirm", "Common"]);
  const { linkData } = useContext(ConfirmRouteContext);

  const [isUnblocking, setIsUnblocking] = useState(false);
  const [isUnblocked, setIsUnblocked] = useState(false);
  const [linkError, setLinkError] = useState<Error | null>(null);

  // Thrown from render, so that a link the server refuses ends on the same
  // page as one ConfirmRoute finds invalid up front.
  if (linkError) throw linkError;

  const onUnblockClick = async () => {
    if (isUnblocking) return;

    setIsUnblocking(true);

    try {
      await unblockPortal(linkData.confirmHeader);
      setIsUnblocked(true);
      setTimeout(() => (window.location.href = "/"), 10000);
    } catch (error) {
      const knownError = error as TError;
      const status =
        typeof knownError === "object" ? knownError?.response?.status : null;

      console.error(error);

      // 401: the link was mailed for an earlier block, or the portal is no
      // longer blocked - unblocked from another tab or by support meanwhile.
      if (status === 401) {
        setLinkError(new Error(t("Common:InvalidLink")));
        return;
      }

      // 403 means the call went out with a sign-in token instead of the link,
      // which this page never does, so it gets the generic error with the rest.
      toastr.error(t("Common:UnexpectedError"));
      setIsUnblocking(false);
    }
  };

  const onCancelClick = () => {
    window.location.href = "/";
  };

  return isUnblocked ? (
    <Text>
      <Trans t={t} i18nKey="SuccessUnblock" ns="Confirm">
        Your workspace has been successfully unblocked. In 10 seconds you will
        be redirected to the
        <Link isHovered href="/" dataTestId="redirect_portal_link">
          workspace
        </Link>
      </Trans>
    </Text>
  ) : (
    <>
      <Text className="subtitle">{t("PortalUnblockTitle")}</Text>
      <div className={styles.buttonsWrapper}>
        <Button
          primary
          scale
          size={ButtonSize.medium}
          label={t("Unblock")}
          tabIndex={1}
          isLoading={isUnblocking}
          onClick={onUnblockClick}
          testId="unblock_portal_button"
        />
        <Button
          scale
          size={ButtonSize.medium}
          label={t("Common:CancelButton")}
          tabIndex={1}
          isDisabled={isUnblocking}
          onClick={onCancelClick}
          testId="unblock_cancel_button"
        />
      </div>
    </>
  );
};

export default UnblockPortalForm;
