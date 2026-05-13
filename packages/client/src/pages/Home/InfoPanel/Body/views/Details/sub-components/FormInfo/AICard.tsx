// (c) Copyright Ascensio System SIA 2009-2026
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