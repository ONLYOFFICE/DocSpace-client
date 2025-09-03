/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Heading, HeadingLevel } from "@docspace/shared/components/heading";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import type {
  TAiProvider,
  TProviderTypeWithUrl,
} from "@docspace/shared/api/ai/types";
import { getAvailableProviderUrls } from "@docspace/shared/api/ai";
import { type TData, toastr } from "@docspace/shared/components/toast";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import styles from "../../AISettings.module.scss";
import { AiProviderTile } from "../tiles/ai-provider-tile";
import { AddAIProviderDialog } from "./dialogs/add-ai-provider";

type AIProviderProps = {
  aiProviders?: AISettingsStore["aiProviders"];
  deleteAIProvider?: AISettingsStore["deleteAIProvider"];
};

const AIProviderComponent = ({
  aiProviders,
  deleteAIProvider,
}: AIProviderProps) => {
  const { t } = useTranslation(["Common", "AISettings"]);
  const [addAIProviderDialogVisible, setAddAIProviderDialogVisible] =
    useState(false);
  const [aiProviderTypesWithUrls, setAiProviderTypesWithUrls] = useState<
    TProviderTypeWithUrl[]
  >([]);

  const showAddProviderDialog = () => setAddAIProviderDialogVisible(true);

  const hideAddProviderDialog = () => setAddAIProviderDialogVisible(false);

  const onDeleteAIProvider = async (id: TAiProvider["id"]) => {
    try {
      await deleteAIProvider?.(id);

      toastr.success(t("AISettings:ProviderRemovedSuccess"));
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  useEffect(() => {
    const init = async () => {
      const res = await getAvailableProviderUrls?.();

      setAiProviderTypesWithUrls(res);
    };

    init();
  }, []);

  return (
    <div className={styles.aiProvider}>
      <Heading
        className={styles.heading}
        level={HeadingLevel.h3}
        fontSize="16px"
        fontWeight={700}
        lineHeight="22px"
      >
        {t("AISettings:AIProvider")}
      </Heading>
      <Text className={styles.description}>
        {t("AISettings:AIProviderSettingDescription", {
          productName: t("Common:ProductName"),
        })}
      </Text>
      <Link
        className={styles.learnMoreLink}
        target={LinkTarget.blank}
        type={LinkType.page}
        fontWeight={600}
        isHovered
        href=""
        color="accent"
      >
        {t("Common:LearnMore")}
      </Link>
      <Button
        primary
        size={ButtonSize.small}
        label={t("AISettings:AddAIProvider")}
        scale={false}
        className={styles.addProviderButton}
        onClick={showAddProviderDialog}
      />

      <div className={styles.providerList}>
        {aiProviders?.map((provider) => (
          <AiProviderTile
            key={provider.id}
            item={provider}
            onDelete={onDeleteAIProvider}
          />
        ))}
      </div>

      {addAIProviderDialogVisible ? (
        <AddAIProviderDialog
          onClose={hideAddProviderDialog}
          aiProviderTypesWithUrls={aiProviderTypesWithUrls}
        />
      ) : null}
    </div>
  );
};

export const AIProvider = inject(({ aiSettingsStore }: TStore) => {
  return {
    aiProviders: aiSettingsStore.aiProviders,
    deleteAIProvider: aiSettingsStore.deleteAIProvider,
  };
})(observer(AIProviderComponent));
