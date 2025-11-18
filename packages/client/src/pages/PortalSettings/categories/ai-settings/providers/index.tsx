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

import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import type {
  TAiProvider,
  TProviderTypeWithUrl,
} from "@docspace/shared/api/ai/types";
import { getAvailableProviderUrls } from "@docspace/shared/api/ai";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import styles from "../AISettings.module.scss";

import { AddUpdateProviderDialog } from "./dialogs/add-update";
import { DeleteAIProviderDialog } from "./dialogs/delete";

import { AiProviderTile } from "./Tile";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

type TDeleteDialogData =
  | {
      visible: false;
      providerId: null;
    }
  | {
      visible: true;
      providerId: TAiProvider["id"];
    };

type TUpdateDialogData =
  | {
      visible: false;
      provider: null;
    }
  | {
      visible: true;
      provider: TAiProvider;
    };

type AIProviderProps = {
  aiProviders?: AISettingsStore["aiProviders"];
  aiProvidersInitied?: AISettingsStore["aiProvidersInitied"];
  checkUnavailableProviders?: AISettingsStore["checkUnavailableProviders"];
  isProviderAvailable?: AISettingsStore["isProviderAvailable"];
  cancelAvailabilityCheck?: AISettingsStore["cancelAvailabilityCheck"];
  aiSettingsUrl?: string;
};

const AIProviderComponent = ({
  aiProviders,
  aiProvidersInitied,
  checkUnavailableProviders,
  isProviderAvailable,
  cancelAvailabilityCheck,
  aiSettingsUrl,
}: AIProviderProps) => {
  const { t } = useTranslation(["Common", "AISettings"]);
  const [addDialogVisible, setaddDialogVisible] = useState(false);
  const [updateDialogData, setUpdateDialogData] = useState<TUpdateDialogData>({
    visible: false,
    provider: null,
  });
  const [deleteDialogData, setDeleteDialogData] = useState<TDeleteDialogData>({
    visible: false,
    providerId: null,
  });
  const [aiProviderTypesWithUrls, setAiProviderTypesWithUrls] = useState<
    TProviderTypeWithUrl[]
  >([]);

  const showAddProviderDialog = () => setaddDialogVisible(true);

  const hideAddProviderDialog = () => setaddDialogVisible(false);
  const hideUpdateDialog = () =>
    setUpdateDialogData({ visible: false, provider: null });

  const hideDeleteProviderDialog = () =>
    setDeleteDialogData({ visible: false, providerId: null });

  const onDeleteAIProvider = async (id: TAiProvider["id"]) => {
    setDeleteDialogData({ visible: true, providerId: id });
  };

  const onUpdateAIProvider = async (provider: TAiProvider) => {
    setUpdateDialogData({ visible: true, provider });
  };

  useEffect(() => {
    const init = async () => {
      const res = await getAvailableProviderUrls?.();

      setAiProviderTypesWithUrls(res);
    };

    init();
  }, []);

  useEffect(() => {
    if (!aiProvidersInitied) return;

    checkUnavailableProviders?.();
  }, [aiProvidersInitied, checkUnavailableProviders]);

  useEffect(() => {
    return () => {
      cancelAvailabilityCheck?.();
    };
  }, [cancelAvailabilityCheck]);

  if (!aiProvidersInitied)
    return (
      <div className={styles.aiProvider}>
        <RectangleSkeleton
          className={styles.description}
          width="700px"
          height="36px"
        />
        <RectangleSkeleton
          className={styles.learnMoreLink}
          width="100px"
          height="19px"
        />
        <RectangleSkeleton
          className={styles.addProviderButton}
          width="155px"
          height="32px"
        />
      </div>
    );

  return (
    <div className={styles.aiProvider}>
      <Text className={styles.description}>
        {t("AISettings:AIProviderSettingDescription", {
          productName: t("Common:ProductName"),
        })}
      </Text>
      {aiSettingsUrl ? (
        <Link
          className={styles.learnMoreLink}
          target={LinkTarget.blank}
          type={LinkType.page}
          fontWeight={600}
          isHovered
          href={aiSettingsUrl}
          color="accent"
        >
          {t("Common:LearnMore")}
        </Link>
      ) : null}
      <Button
        primary
        size={ButtonSize.small}
        label={t("AISettings:AddAIProvider", {
          aiProvider: t("Common:AIProvider"),
        })}
        scale={false}
        className={styles.addProviderButton}
        onClick={showAddProviderDialog}
      />

      <div className={styles.providerList}>
        {aiProviders?.map((provider) => (
          <AiProviderTile
            key={provider.id}
            item={provider}
            onDeleteClick={onDeleteAIProvider}
            onSettingsClick={onUpdateAIProvider}
            isAvailable={isProviderAvailable?.(provider.id)}
          />
        ))}
      </div>

      {addDialogVisible ? (
        <AddUpdateProviderDialog
          variant="add"
          onClose={hideAddProviderDialog}
          aiProviderTypesWithUrls={aiProviderTypesWithUrls}
        />
      ) : null}

      {updateDialogData.visible ? (
        <AddUpdateProviderDialog
          variant="update"
          onClose={hideUpdateDialog}
          aiProviderTypesWithUrls={aiProviderTypesWithUrls}
          providerData={updateDialogData.provider}
        />
      ) : null}

      {deleteDialogData.visible ? (
        <DeleteAIProviderDialog
          onClose={hideDeleteProviderDialog}
          providerId={deleteDialogData.providerId}
        />
      ) : null}
    </div>
  );
};

export const AIProvider = inject(
  ({ aiSettingsStore, settingsStore }: TStore) => {
    return {
      aiProviders: aiSettingsStore.aiProviders,
      aiProvidersInitied: aiSettingsStore.aiProvidersInitied,
      checkUnavailableProviders: aiSettingsStore.checkUnavailableProviders,
      isProviderAvailable: aiSettingsStore.isProviderAvailable,
      cancelAvailabilityCheck: aiSettingsStore.cancelAvailabilityCheck,
      aiSettingsUrl: settingsStore.aiSettingsUrl,
    };
  },
)(observer(AIProviderComponent));
