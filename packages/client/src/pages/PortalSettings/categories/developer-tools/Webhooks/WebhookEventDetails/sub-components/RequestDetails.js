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

import React from "react";
import { Text } from "@docspace/ui-kit/components/text";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import { inject, observer } from "mobx-react";

import { useTranslation } from "react-i18next";
import { StatusMessage } from "@docspace/ui-kit/components/status-message";
import { isJSON } from "@docspace/shared/utils/json";

import styles from "../WebhookEventDetails.styled.module.scss";

const RequestDetails = ({ eventDetails }) => {
  const { t } = useTranslation(["Webhooks"]);

  return (
    <div className={styles.messageDetailsWrapper}>
      {eventDetails.status === 0 ? (
        <StatusMessage message={t("FailedToConnect")} />
      ) : null}
      <Text as="h3" fontWeight={600} className="mb-4 mt-7">
        {t("RequestPostHeader")}
      </Text>
      {!eventDetails.requestHeaders ? (
        <Textarea isDisabled />
      ) : (
        <Textarea
          classNameCopyIcon="request-header-copy"
          value={eventDetails.requestHeaders}
          enableCopy
          hasNumeration
          isFullHeight
          isJSONField
          copyInfoText={t("RequestHeaderCopied")}
        />
      )}

      <Text as="h3" fontWeight={600} className="mb-4 mt-16">
        {t("RequestPostBody")}
      </Text>
      {isJSON(eventDetails.requestPayload) ? (
        <Textarea
          classNameCopyIcon="request-body-copy"
          value={eventDetails.requestPayload}
          isJSONField
          enableCopy
          hasNumeration
          isFullHeight
          copyInfoText={t("RequestBodyCopied")}
        />
      ) : (
        <Textarea
          value={eventDetails.requestPayload}
          heightScale
          className="textareaBody"
        />
      )}
    </div>
  );
};

export default inject(({ webhooksStore }) => {
  const { eventDetails } = webhooksStore;

  return { eventDetails };
})(observer(RequestDetails));
