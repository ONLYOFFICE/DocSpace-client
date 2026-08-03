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

import React, { useEffect, useTransition, Suspense } from "react";

import { useParams } from "react-router";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";

import DetailsBar from "./sub-components/DetailsBar";
import MessagesDetails from "./sub-components/MessagesDetails";
import { WebhookDetailsLoader } from "../sub-components/Loaders";

import styles from "./WebhookEventDetails.styled.module.scss";

const WebhookEventDetails = (props) => {
  const { fetchEventData, fetchConfigName, configName } = props;
  const { id, eventId } = useParams();

  const [, startTransition] = useTransition();

  const handleDataFetch = async () => {
    fetchConfigName({
      configId: id,
    });
    fetchEventData(eventId);
  };

  useEffect(() => {
    startTransition(handleDataFetch);
  }, []);

  return (
    <Suspense fallback={WebhookDetailsLoader}>
      <div className={styles.detailsWrapper}>
        <main>
          <header className={styles.eventDetailsHeader}>
            <Text fontWeight={600}>{configName}</Text>
            <DetailsBar />
          </header>
          <MessagesDetails />
        </main>
      </div>
    </Suspense>
  );
};

export const Component = inject(({ webhooksStore }) => {
  const { fetchEventData, fetchConfigName, configName } = webhooksStore;

  return { fetchEventData, fetchConfigName, configName };
})(observer(WebhookEventDetails));
