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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import type { TByokKey } from "@docspace/shared/api/ai/types";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";
import type ServicesStore from "SRC_DIR/store/ServicesStore";

import ByokKeyForm from "./ByokKeyForm";
import ByokKeyCard from "./ByokKeyCard";
import ByokEditCard from "./ByokEditCard";
import ByokLoader from "./ByokLoader";
import styles from "./Byok.module.scss";

const ADD_FORM = "add";

type ByokKeysProps = {
  byokInitied?: AISettingsStore["byokInitied"];
  byokKeys?: AISettingsStore["byokKeys"];
  byokProviders?: AISettingsStore["byokProviders"];
  byokProviderNames?: AISettingsStore["byokProviderNames"];
  fetchByok?: AISettingsStore["fetchByok"];
  saveByokKey?: AISettingsStore["saveByokKey"];
  removeByokKey?: AISettingsStore["removeByokKey"];
  fetchAiPrices?: ServicesStore["fetchAiPrices"];
};

const ByokKeys = ({
  byokInitied,
  byokKeys = [],
  byokProviders = [],
  byokProviderNames = {},
  fetchByok,
  saveByokKey,
  removeByokKey,
  fetchAiPrices,
}: ByokKeysProps) => {
  const { t } = useTranslation(["Common"]);

  const [openForm, setOpenForm] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchByok?.();
  }, [fetchByok]);

  const closeForm = () => setOpenForm(null);

  const onSave = async (modelId: string, provider: string, key: string) => {
    await saveByokKey?.(modelId, provider, key);
    closeForm();
    toastr.success(t("Common:AIApiKeySaved"));
    fetchAiPrices?.();
  };

  const onDelete = async ({ id }: TByokKey) => {
    await removeByokKey?.(id);
    toastr.success(t("Common:AIApiKeyDeleted"));
    fetchAiPrices?.();
  };

  if (!byokInitied) return <ByokLoader />;

  return (
    <div>
      <Text className={styles.description}>
        {t("Common:AIApiKeysDescription")}
      </Text>
      {openForm === ADD_FORM ? (
        <ByokKeyForm
          providers={byokProviders}
          onSave={onSave}
          onCancel={closeForm}
        />
      ) : (
        <Button
          primary
          size={ButtonSize.small}
          label={t("Common:AddModel")}
          onClick={() => setOpenForm(ADD_FORM)}
          isDisabled={!byokProviders.length}
          testId="byok-add-button"
        />
      )}
      {byokKeys.length ? (
        <div className={styles.list}>
          {byokKeys.map((byokKey) => {
            const providerName =
              byokProviderNames[byokKey.provider] ?? byokKey.provider;

            return openForm === byokKey.id ? (
              <ByokEditCard
                key={byokKey.id}
                byokKey={byokKey}
                providerName={providerName}
                onSave={onSave}
                onDelete={onDelete}
                onCancel={closeForm}
              />
            ) : (
              <ByokKeyCard
                key={byokKey.id}
                byokKey={byokKey}
                providerName={providerName}
                onReplace={({ id }) => setOpenForm(id)}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default inject<TStore>(({ aiSettingsStore, servicesStore }) => {
  const {
    byokInitied,
    byokKeys,
    byokProviders,
    byokProviderNames,
    fetchByok,
    saveByokKey,
    removeByokKey,
  } = aiSettingsStore;
  const { fetchAiPrices } = servicesStore;

  return {
    byokInitied,
    byokKeys,
    byokProviders,
    byokProviderNames,
    fetchByok,
    saveByokKey,
    removeByokKey,
    fetchAiPrices,
  };
})(observer(ByokKeys));
