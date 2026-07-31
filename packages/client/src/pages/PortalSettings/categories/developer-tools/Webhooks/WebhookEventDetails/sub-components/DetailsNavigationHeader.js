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

import { observer } from "mobx-react";

import { retryWebhook } from "@docspace/shared/api/settings";

import { toastr } from "@docspace/ui-kit/components/toast";

import { useNavigate, useParams, useLocation } from "react-router";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import RetryIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";

import { Heading } from "@docspace/ui-kit/components/heading";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import { useTranslation } from "react-i18next";

import styles from "../WebhookEventDetails.styled.module.scss";

const DetailsNavigationHeader = () => {
  const { id, eventId } = useParams();

  const { t } = useTranslation(["Webhooks", "Common"]);
  const navigate = useNavigate();

  const onBack = () => {
    navigate(`/developer-tools/webhooks/${id}`);
  };

  const handleRetryEvent = async () => {
    await retryWebhook(eventId);
    toastr.success(t("WebhookRedilivered"), <b>{t("Common:Done")}</b>);
  };

  return (
    <div className={styles.headerContainer}>
      <div className="headerNavigation">
        <IconButton
          iconName={ArrowPathReactSvgUrl}
          size="17"
          isFill
          onClick={onBack}
          className="arrow-button"
        />
        <Heading type="content" truncate className="headline">
          {t("WebhookDetails")}
        </Heading>
      </div>

      <IconButton
        className="retry"
        iconName={RetryIcon}
        size="17"
        isFill
        onClick={handleRetryEvent}
      />
    </div>
  );
};

export default observer(DetailsNavigationHeader);
