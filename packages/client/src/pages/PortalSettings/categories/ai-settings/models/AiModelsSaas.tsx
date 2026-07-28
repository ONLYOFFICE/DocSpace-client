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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Consumer } from "@docspace/ui-kit/utils/context";
import { DeviceType } from "@docspace/shared/enums";
import { EmptyView } from "@docspace/shared/components/empty-view";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import EmptyScreenServerErrorLightSvg from "PUBLIC_DIR/images/emptyview/empty.server.error.light.svg";
import EmptyScreenServerErrorDarkSvg from "PUBLIC_DIR/images/emptyview/empty.server.error.dark.svg";
import ReloadArrowsSvg from "PUBLIC_DIR/images/icons/10/reload.arrows.svg";

import type ServicesStore from "SRC_DIR/store/ServicesStore";

import TableView from "./TableView";
import RowView from "./RowView";
import { TableViewLoader } from "./TableView/TableViewLoader";
import { RowViewLoader } from "./RowView/RowViewLoader";

type AiModelsSaasProps = {
  currentDeviceType?: DeviceType;
  aiToolsPrices?: ServicesStore["aiToolsPrices"];
  isAiToolsPricesLoading?: ServicesStore["isAiToolsPricesLoading"];
};

const AiModelsSaas = ({
  currentDeviceType,
  aiToolsPrices,
  isAiToolsPricesLoading,
}: AiModelsSaasProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const isDesktop = currentDeviceType === DeviceType.desktop;

  if (isAiToolsPricesLoading)
    return isDesktop ? <TableViewLoader /> : <RowViewLoader />;

  if (!aiToolsPrices) {
    const icon = isBase ? (
      <EmptyScreenServerErrorLightSvg />
    ) : (
      <EmptyScreenServerErrorDarkSvg />
    );

    return (
      <EmptyView
        icon={icon}
        title={t("Common:SomethingWentWrong")}
        description={t("Common:ServerErrorEmptyDescription")}
        options={[
          {
            to: "",
            key: "reload",
            title: t("Common:ReloadPage"),
            description: t("Common:ReloadPage"),
            icon: <ReloadArrowsSvg />,
            onClick: () => window.location.reload(),
          },
        ]}
      />
    );
  }

  return (
    <Consumer>
      {(context) =>
        isDesktop ? (
          <TableView sectionWidth={context.sectionWidth ?? 0} />
        ) : (
          <RowView sectionWidth={context.sectionWidth ?? 0} />
        )
      }
    </Consumer>
  );
};

export default inject<TStore>(({ settingsStore, servicesStore }) => ({
  currentDeviceType: settingsStore.currentDeviceType,
  aiToolsPrices: servicesStore.aiToolsPrices,
  isAiToolsPricesLoading: servicesStore.isAiToolsPricesLoading,
}))(observer(AiModelsSaas));

