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
import { inject, observer } from "mobx-react";

import QuotaPerItemComponent from "./QuotaPerItem";
import { getBrandName } from "@docspace/shared/constants/brands";

type QuotaPerAIAgentComponentProps = {
  setAIAgentQuota: (size: number, t: (key: string) => string) => void;
  defaultAIAgentsQuota: number;
  isDefaultAIAgentsQuotaSet: boolean;
};

const QuotaPerAIAgentComponent = (props: QuotaPerAIAgentComponentProps) => {
  const { setAIAgentQuota, defaultAIAgentsQuota, isDefaultAIAgentsQuotaSet } =
    props;
  const { t } = useTranslation(["Settings", "Common"]);

  const initialSizeProp = isDefaultAIAgentsQuotaSet
    ? { initialSize: defaultAIAgentsQuota }
    : {};

  const saveQuota = (size: number) => setAIAgentQuota(size, t);
  const disableQuota = () => setAIAgentQuota(-1, t);

  return (
    <QuotaPerItemComponent
      type="agent"
      formLabel={t("QuotaPerAIAgent", {
        aiAgent: t("Common:AIAgent"),
      })}
      toggleLabel={t("DefineQuotaPerAIAgent", {
        aiAgent: t("Common:AIAgent"),
      })}
      disableQuota={disableQuota}
      saveQuota={saveQuota}
      {...initialSizeProp}
      isQuotaSet={isDefaultAIAgentsQuotaSet}
      tabIndex={3}
      dataTestId="quota_ai_agent"
      toggleDescription={t("SetDefaultAIAgentQuota", {
        productName: getBrandName("ProductName"),
        aiAgents: t("Common:AIAgents"),
        aiAgent: t("Common:AIAgent"),
      })}
    />
  );
};

export const QuotaPerAIAgentComponentSection = inject(
  ({ currentQuotaStore }: TStore) => {
    const { setAIAgentQuota, defaultAIAgentsQuota, isDefaultAIAgentsQuotaSet } =
      currentQuotaStore;

    return { setAIAgentQuota, defaultAIAgentsQuota, isDefaultAIAgentsQuotaSet };
  },
)(observer(QuotaPerAIAgentComponent));
