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

import { Link } from "react-router";
import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Card } from "@docspace/ui-kit/components/card";
import { ActionButton } from "@docspace/ui-kit/components/action-button";
import { getBrandName } from "@docspace/ui-kit/constants/brands";

import SettingsSvg from "@docspace/ui-kit/assets/settings.desc.react.svg";

import AIReactSvg from "PUBLIC_DIR/images/icons/16/AI.svg";
import GridSvg from "PUBLIC_DIR/images/icons/12/grid.svg";
import ExternalLinkSvg from "PUBLIC_DIR/images/external.link.react.svg";

import styles from "./FormInfo.module.scss";
import { ConnectedBadge } from "./ConnectedBadge";
import { isFormFile } from "./FormInfo.utils";
import type {
  FormInfoState,
  InjectedFormInfoProps,
  Selection,
} from "./FormInfo.types";

type AICardProps = {
  selection: Selection;
  state: FormInfoState;
  isAdmin: boolean;
  aiReady: boolean;
  externalDbEnabled: boolean;
  askAIAction: InjectedFormInfoProps["askAIAction"];
  onConnect: () => void;
};

export const AICard = ({
  selection,
  state,
  isAdmin,
  aiReady,
  externalDbEnabled,
  askAIAction,
  onConnect,
}: AICardProps) => {
  const { t } = useTranslation(["InfoPanel", "Common"]);
  const { aiConnected, isFile, isDone, canEditRoom } = state;

  const title = (
    <span className={styles.cardTitle}>
      <AIReactSvg className={styles.cardIcon} />
      {aiConnected
        ? isFile
          ? t("InfoPanel:FormRoomAIAnalyzeTitle")
          : t("InfoPanel:FormRoomAIReadyTitle")
        : t("InfoPanel:FormRoomAIUnlockTitle")}
    </span>
  );

  const description = useMemo(() => {
    if (aiConnected) {
      if (isDone) return t("InfoPanel:FormRoomAIReadyDescriptionFolder");
      if (isFile) return t("InfoPanel:FormRoomAIReadyDescriptionFile");
      return t("InfoPanel:FormRoomAIReadyDescriptionRoom");
    }

    if (!aiReady) {
      if (isAdmin) {
        return t("InfoPanel:FormRoomAIProviderNotConnected", {
          productName: getBrandName("ProductName"),
        });
      }

      return (
        <Trans
          t={t}
          ns="InfoPanel"
          i18nKey="FormRoomAIProviderNotConnectedAskAdmin"
          components={{
            1: <strong />,
          }}
          values={{
            productName: getBrandName("ProductName"),
          }}
        />
      );
    }

    if (!externalDbEnabled) {
      if (isAdmin) return t("InfoPanel:FormRoomConnectDatabase");

      return (
        <Trans
          t={t}
          ns="InfoPanel"
          i18nKey="FormRoomConnectDatabaseAskAdmin"
          components={{
            1: <strong />,
          }}
          values={{
            productName: getBrandName("ProductName"),
          }}
        />
      );
    }

    return t("InfoPanel:FormRoomAINotConnectedDescription");
  }, [t, aiConnected, isFile, isDone, aiReady, externalDbEnabled, isAdmin]);

  const renderAction = () => {
    if (aiConnected) {
      if (isFormFile(selection) && selection.security?.AskAi) {
        return (
          <ActionButton
            icon={<AIReactSvg />}
            label={t("Common:AskAI")}
            className={styles.actionButton}
            onClick={() => askAIAction(selection)}
          />
        );
      }

      return null;
    }

    if (!aiReady) {
      if (!isAdmin) return null;

      return (
        <ActionButton
          as={Link}
          icon={<SettingsSvg />}
          label={t("Common:GoToSettings")}
          to="/portal-settings/ai-settings/providers"
        />
      );
    }

    if (!externalDbEnabled) {
      if (!isAdmin) return null;
      return (
        <ActionButton
          as={Link}
          reloadDocument
          icon={<GridSvg />}
          label={t("Common:ConnectDatabase")}
          to="/portal-settings/integration/third-party-services?consumer=externaldb"
        />
      );
    }

    if (!canEditRoom) return null;

    return (
      <ActionButton
        label={t("Common:Connect")}
        icon={<ExternalLinkSvg />}
        onClick={onConnect}
      />
    );
  };

  return (
    <Card
      title={title}
      footer={renderAction()}
      className={styles.block}
      extra={aiConnected ? <ConnectedBadge /> : undefined}
    >
      <p className={styles.cardDescription}>{description}</p>
    </Card>
  );
};