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

import type { TFunction } from "i18next";
import { inject, observer } from "mobx-react";

import {
  contextMenuColumn,
  type DataTableColumn,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import { Checkbox } from "@onlyoffice/apps-ui-kit/components/checkbox";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";

import type { TWebhookHistoryItem } from "SRC_DIR/store/WebhooksStore";

import StatusBadge from "../../../../sub-components/StatusBadge";
import { getTriggerTranslate } from "../../../../Webhooks.helpers";

type TEventCheckboxProps = {
  eventId: number;
  isIdChecked?: (id: number) => boolean;
  toggleEventId?: (id: number) => void;
};

/**
 * The event's checkbox, always shown, as the old row had it. An observer of
 * its own: the row does not track the selection its cells read.
 */
const EventCheckbox = inject(({ webhooksStore }: TStore) => ({
  isIdChecked: webhooksStore.isIdChecked,
  toggleEventId: webhooksStore.toggleEventId,
}))(
  observer(({ eventId, isIdChecked, toggleEventId }: TEventCheckboxProps) => (
    <Checkbox
      className="checkbox"
      onChange={() => toggleEventId!(eventId)}
      isChecked={isIdChecked!(eventId)}
    />
  )),
) as React.ComponentType<TEventCheckboxProps>;

/** The old header's columns, then the row menu. */
export const getHistoryColumns = (
  t: TFunction,
  language: string,
): DataTableColumn<TWebhookHistoryItem>[] => [
  {
    id: "Event ID",
    title: t("EventID"),
    width: { type: "fill" },
    cell: (item) => (
      <>
        <EventCheckbox eventId={item.id} />
        <Text fontWeight={600}>{item.id}</Text>
      </>
    ),
  },
  {
    id: "Status",
    title: t("People:UserStatus"),
    width: { type: "flex" },
    cell: (item) => <StatusBadge status={item.status} />,
  },
  {
    id: "Trigger",
    title: t("EventType"),
    width: { type: "flex" },
    cell: (item) => (
      <Text fontWeight={600} fontSize="11px" className="textOverflow">
        {getTriggerTranslate(item.trigger as number, t)}
      </Text>
    ),
  },
  {
    id: "Delivery",
    title: t("Delivery"),
    width: { type: "flex" },
    cell: (item) => (
      <Text fontWeight={600} fontSize="11px" className="textOverflow">
        {getCorrectDate(language, item.delivery as string | undefined)}
      </Text>
    ),
  },
  contextMenuColumn<TWebhookHistoryItem>(),
];
