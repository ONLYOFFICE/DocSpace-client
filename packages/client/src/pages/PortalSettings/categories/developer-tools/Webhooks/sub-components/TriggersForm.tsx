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

import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { Checkbox } from "@docspace/shared/components/checkbox";

import { WebhookTriggers } from "@docspace/shared/enums";

import { getTriggerTranslate } from "../Webhooks.helpers";

type TProps = {
  isDisabled: boolean;
  triggers: number;
  toggleTrigger: (value: number) => void;
  triggerAll: boolean;
  onChange: (value: string) => void;
};

const triggersList = Object.values(WebhookTriggers)
  .filter(
    (value) => !Number.isNaN(Number(value)) && value !== WebhookTriggers.All,
  )
  .map(Number);

const TriggersForm = ({
  isDisabled,
  triggers,
  toggleTrigger,
  triggerAll,
  onChange,
}: TProps) => {
  const { t } = useTranslation(["Webhooks", "Common"]);

  return (
    <div style={{ marginTop: "22px" }}>
      <Text fontWeight={600} style={{ marginBottom: "10px" }}>
        {t("Trigger")}
      </Text>
      <RadioButtonGroup
        fontSize="13px"
        fontWeight="400"
        name="ssl"
        onClick={(e) => onChange(e.target.value)}
        options={[
          {
            id: "enable-all",
            label: t("Common:All"),
            value: "true",
          },
          {
            id: "select-from-list",
            label: t("SelectFromList"),
            value: "false",
          },
        ]}
        selected={triggerAll ? "true" : "false"}
        width="100%"
        orientation="vertical"
        spacing="8px"
        isDisabled={isDisabled}
      />
      {!triggerAll ? (
        <div
          style={{
            display: "grid",
            gap: "8px",
            gridTemplateColumns: "repeat(2, 1fr)",
            marginTop: "10px",
          }}
        >
          {triggersList.map((value) => (
            <Checkbox
              key={value}
              label={getTriggerTranslate(value, t)}
              isChecked={(triggers & value) !== 0}
              onChange={() => toggleTrigger(value)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default TriggersForm;
