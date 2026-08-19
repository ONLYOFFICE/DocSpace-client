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

import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";

import {
  getTriggerTranslate
} from "../Webhooks.helpers";
import styles from "../Webhooks.styled.module.scss";

type TWebhookTrigger = {
  name: string;
  id: number;
  available: boolean;
};

type TProps = {
  isDisabled: boolean;
  triggers: bigint;
  toggleTrigger: (value: bigint) => void;
  triggerAll: boolean;
  onChange: (value: string) => void;
  webhookTriggers?: TWebhookTrigger[];
};

const TriggersForm = ({
  isDisabled,
  triggers,
  toggleTrigger,
  triggerAll,
  onChange,
  webhookTriggers = [],
}: TProps) => {
  const { t } = useTranslation(["Webhooks", "Files", "Common"]);

  const individualTriggers = webhookTriggers.filter(
    (trigger) => trigger.id !== 0,
  );

  return (
    <div className={styles.triggersWrapper}>
      <Text fontWeight={600} className={styles.triggersTitle}>
        {t("EventToTriggerThisWebhook")}
      </Text>
      <RadioButtonGroup
        fontSize="13px"
        fontWeight="400"
        name="ssl"
        onClick={(e) => onChange(e.target.value)}
        options={[
          {
            id: "enable-all",
            label: t("SendEverything"),
            value: "true",
            dataTestId: "enable_all_radio_button",
          },
          {
            id: "select-from-list",
            label: t("IndividualEvents"),
            value: "false",
            dataTestId: "select_from_list_radio_button",
          },
        ]}
        selected={triggerAll ? "true" : "false"}
        width="100%"
        orientation="vertical"
        spacing="8px"
        isDisabled={isDisabled}
        dataTestId="triggers_form_radio_button_group"
      />
      {!triggerAll ? (
        <div
          className={styles.triggersCheckboxGroup}
          data-testid="triggers_form_checkbox_group"
        >
          {individualTriggers.map((trigger) => {
            const value = BigInt(trigger.id);
            return (
              <Checkbox
                key={trigger.id}
                label={getTriggerTranslate(trigger.id, t)}
                isChecked={(triggers & value) !== 0n}
                onChange={() => toggleTrigger(value)}
                isDisabled={!trigger.available}
                dataTestId={`triggers_form_checkbox_${trigger.id}`}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default TriggersForm;

