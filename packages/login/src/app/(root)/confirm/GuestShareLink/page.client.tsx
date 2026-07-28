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

import { useContext } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Text } from "@docspace/ui-kit/components/text";
import { FormWrapper } from "@docspace/ui-kit/components/form-wrapper";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { useGuestShareLink } from "@/hooks/useGuestShareLink";
import styles from "../confirm.module.scss";

type GuestShareLinkFormProps = {
  guestDisplayName?: string;
  guestAvatar?: string;
};

const GuestShareLinkForm = ({
  guestDisplayName,
  guestAvatar,
}: GuestShareLinkFormProps) => {
  const { linkData, confirmLinkResult } = useContext(ConfirmRouteContext);
  const { confirmHeader = "" } = linkData;
  const { email = "" } = confirmLinkResult;
  const { t } = useTranslation(["Confirm", "Common"]);

  const { onApproveInvite, onDenyInvite, isLoading } = useGuestShareLink();

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
      <div className={classNames(styles.buttonsWrapper, styles.buttonsGuest)}>
        <Button
          primary
          scale
          size={ButtonSize.medium}
          label={t("Common:Approve")}
          tabIndex={2}
          isDisabled={isLoading}
          onClick={() => onApproveInvite(email, confirmHeader)}
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
      </div>
      <Text fontSize="12px" fontWeight="400" className="guest-info">
        {t("Common:GuestApprovalNote", { sectionName: t("Common:Contacts") })}
      </Text>
    </FormWrapper>
  );
};

export default GuestShareLinkForm;
