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

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useTheme } from "styled-components";

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";

import { Tabs } from "@docspace/shared/components/tabs";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";

import { DeviceType } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { isManagement } from "@docspace/shared/utils/common";
import { SECTION_HEADER_HEIGHT } from "@docspace/shared/components/section/Section.constants";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/shared/utils/socket";

import config from "../../../../../package.json";

import ManualBackup from "./backup/manual-backup";
import AutoBackup from "./backup/auto-backup";
import useBackup from "./backup/useBackup";
import { createDefaultHookSettingsProps } from "../../utils/createDefaultHookSettingsProps";

const DataManagementWrapper = (props) => {
  const {
    dataBackupUrl,
    automaticBackupUrl,
    buttonSize,
    t,

    currentDeviceType,
    standalone,

    backup,
    authStore,
    currentQuotaStore,
    paymentStore,
    currentTariffStatusStore,
    settingsStore,
    clearAbortControllerArr,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [currentTabId, setCurrentTabId] = useState();

  const { interfaceDirection } = useTheme();
  const directionTooltip = interfaceDirection === "rtl" ? "left" : "right";

  const defaultProps = createDefaultHookSettingsProps({
    backupStore: backup,
    authStore,
    currentQuotaStore,
    paymentStore,
    currentTariffStatusStore,
    settingsStore,
  });

  const {
    getManualBackupData,
    getAutoBackupData,

    isEmptyContentBeforeLoader,
    isInitialLoading,
    isInitialError,
    setIsEmptyContentBeforeLoader,
  } = useBackup(defaultProps.backup);

  const renderTooltip = (helpInfo, className) => {
    const isAutoBackupPage = window.location.pathname.includes(
      "portal-settings/backup/auto-backup",
    );

    return (
      <HelpButton
        size={12}
        offsetRight={5}
        place={directionTooltip}
        className={className}
        iconName={HelpReactSvgUrl}
        tooltipContent={
          <Text fontSize="12px">
            <Trans t={t} i18nKey={`${helpInfo}`} ns="Settings">
              {helpInfo}
            </Trans>
            <span style={{ margin: "10px 0 0" }}>
              {(isAutoBackupPage ? automaticBackupUrl : dataBackupUrl) ? (
                <Link
                  id="link-tooltip"
                  fontSize="13px"
                  href={isAutoBackupPage ? automaticBackupUrl : dataBackupUrl}
                  target="_blank"
                  isBold
                  isHovered
                >
                  {t("Common:LearnMore")}
                </Link>
              ) : null}
            </span>
          </Text>
        }
      />
    );
  };

  const data = [
    {
      id: "data-backup",
      name: t("Common:DataBackup"),
      content: (
        <ManualBackup
          buttonSize={buttonSize}
          renderTooltip={renderTooltip}
          isEmptyContentBeforeLoader={isEmptyContentBeforeLoader}
          setIsEmptyContentBeforeLoader={setIsEmptyContentBeforeLoader}
          isInitialLoading={isInitialLoading}
          isInitialError={isInitialError}
        />
      ),
      onClick: async () => {
        clearAbortControllerArr();
        await getManualBackupData();
      },
    },
    {
      id: "auto-backup",
      name: t("Common:AutoBackup"),
      content: (
        <AutoBackup
          buttonSize={buttonSize}
          renderTooltip={renderTooltip}
          isEmptyContentBeforeLoader={isEmptyContentBeforeLoader}
          isInitialLoading={isInitialLoading}
          isInitialError={isInitialError}
        />
      ),
      onClick: async () => {
        clearAbortControllerArr();
        await getAutoBackupData();
      },
    },
  ];

  useEffect(() => {
    const path = location.pathname;
    const currentTab = data.find((item) => path.includes(item.id));
    if (currentTab && data.length) setCurrentTabId(currentTab.id);
  }, [location.pathname]);

  useEffect(() => {
    const { socketSubscribers } = SocketHelper;

    if (!socketSubscribers.has("backup")) {
      if (!isManagement()) {
        SocketHelper?.emit(SocketCommands.Subscribe, {
          roomParts: "backup",
        });
      }

      if (standalone && isManagement()) {
        SocketHelper?.emit(SocketCommands.SubscribeInSpaces, {
          roomParts: "backup",
        });
      }
    }

    return () => {
      SocketHelper?.off(SocketEvents.BackupProgress);

      if (!isManagement()) {
        SocketHelper?.emit(SocketCommands.Unsubscribe, {
          roomParts: "backup",
        });
      }

      if (standalone && isManagement()) {
        SocketHelper?.emit(SocketCommands.UnsubscribeInSpaces, {
          roomParts: "backup",
        });
      }
    };
  }, []);

  const onSelect = (e) => {
    const url = isManagement()
      ? `/management/settings/backup/${e.id}`
      : `/portal-settings/backup/${e.id}`;

    navigate(
      combineUrl(window.DocSpaceConfig?.proxy?.url, config.homepage, url),
    );
    setCurrentTabId(e.id);
  };

  return (
    <Tabs
      items={data}
      selectedItemId={currentTabId}
      onSelect={(e) => onSelect(e)}
      stickyTop={SECTION_HEADER_HEIGHT[currentDeviceType]}
      withAnimation
    />
  );
};

export const Component = inject(
  ({
    settingsStore,
    paymentStore,
    currentTariffStatusStore,
    currentQuotaStore,
    backup,
    authStore,
  }) => {
    const {
      dataBackupUrl,
      automaticBackupUrl,

      currentDeviceType,
      standalone,
      clearAbortControllerArr,
    } = settingsStore;

    const buttonSize =
      currentDeviceType !== DeviceType.desktop ? "normal" : "small";
    return {
      dataBackupUrl,
      automaticBackupUrl,
      buttonSize,

      currentDeviceType,
      standalone,

      backup,
      authStore,
      currentQuotaStore,
      paymentStore,
      currentTariffStatusStore,
      settingsStore,
      clearAbortControllerArr,
    };
  },
)(withTranslation(["Settings", "Common"])(observer(DataManagementWrapper)));
