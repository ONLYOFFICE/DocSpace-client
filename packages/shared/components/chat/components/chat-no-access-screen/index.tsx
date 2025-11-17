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

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import ChatNoAccessRightsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.chat.access.rights.dark.svg";
import ChatNoAccessRightsLightIcon from "PUBLIC_DIR/images/emptyview/empty.chat.access.rights.light.svg";

import { EmptyView } from "../../../empty-view";
import { useTheme } from "../../../../hooks/useTheme";
import { match, P } from "ts-pattern";

type Props = {
  aiReady: boolean;
  standalone: boolean;
  isPortalAdmin: boolean;
};

export const ChatNoAccessScreen = ({
  aiReady,
  isPortalAdmin,
  standalone,
}: Props) => {
  const { t } = useTranslation("Common");
  const { isBase } = useTheme();
  const navigate = useNavigate();

  const icon = isBase ? (
    <ChatNoAccessRightsLightIcon />
  ) : (
    <ChatNoAccessRightsDarkIcon />
  );

  const title =
    isPortalAdmin && standalone
      ? t("Common:EmptyAIAgentsAIDisabledStandaloneAdminTitle", {
          aiProvider: t("Common:AIProvider"),
        })
      : t("Common:AIFeaturesAreCurrentlyDisabled");

  const description = match([standalone, isPortalAdmin])
    // standalone admin
    .with([true, true], () =>
      t("Common:EmptyAIAgentsAIDisabledStandaloneAdminDescription", {
        productName: t("Common:ProductName"),
      }),
    )
    // saas admin
    .with([false, true], () =>
      t("Common:EmptyChatAIDisabledSaasAdminDescription", {
        productName: t("Common:ProductName"),
      }),
    )
    // standalone/saas user
    .with([P._, false], () =>
      t("Common:EmptyChatAIDisabledUserDescription", {
        productName: t("Common:ProductName"),
      }),
    )
    .otherwise(() => "");

  const onGoToServices = useCallback(() => {
    return navigate("/portal-settings/services");
  }, []);

  const onGoToAIProviderSettings = useCallback(() => {
    return navigate("/portal-settings/ai-settings/providers");
  }, []);

  const goToServices = {
    type: "button",
    title: t("Common:GoToSettings"),
    key: "go-to-services",
    onClick: onGoToServices,
  } as const;

  const goToAIProviderSettings = {
    type: "button",
    title: t("Common:GoToSettings"),
    key: "go-to-ai-provider-settings",
    onClick: onGoToAIProviderSettings,
  } as const;

  const options = !isPortalAdmin
    ? []
    : standalone
      ? [goToAIProviderSettings]
      : [goToServices];

  return (
    <EmptyView
      title={title}
      description={description}
      icon={icon}
      options={options}
    />
  );
};
