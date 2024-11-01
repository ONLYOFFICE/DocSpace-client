// (c) Copyright Ascensio System SIA 2009-2024
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

import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import ActionsHeaderTouchReactSvgUrl from "PUBLIC_DIR/images/actions.header.touch.react.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import styled, { css, useTheme } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { withTranslation } from "react-i18next";
import Headline from "@docspace/shared/components/headline/Headline";
import { IconButton } from "@docspace/shared/components/icon-button";
import { TableGroupMenu } from "@docspace/shared/components/table";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import LoaderSectionHeader from "../loaderSectionHeader";
import { mobile, tablet, desktop, isMobile } from "@docspace/shared/utils";
import withLoading from "SRC_DIR/HOCs/withLoading";
import { Badge } from "@docspace/shared/components/badge";
import { globalColors } from "@docspace/shared/themes";
import {
  getKeyByLink,
  settingsTree,
  getTKeyByKey,
  checkPropertyByLink,
} from "../../../utils";
import TariffBar from "SRC_DIR/components/TariffBar";
import { IMPORT_HEADER_CONST } from "SRC_DIR/pages/PortalSettings/utils/settingsTree";

export const HeaderContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  max-width: calc(100vw - 32px);
  .settings-section_header {
    display: flex;
    align-items: center;
    .settings-section_badge {
      margin-inline-start: 8px;
      cursor: auto;
    }

    .header {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      color: ${(props) => props.theme.client.settings.headerTitleColor};
    }
  }
  .action-wrapper {
    flex-grow: 1;

    .action-button {
      margin-inline-start: auto;
    }
  }

  .arrow-button {
    flex-shrink: 0;
    margin-inline-end: 12px;

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }
  }

  @media ${tablet} {
    h1 {
      line-height: 61px;
      font-size: 21px;
    }
  }

  @media ${desktop} {
    h1 {
      font-size: 18px;
      line-height: 59px !important;
    }
  }

  @media ${mobile} {
    h1 {
      line-height: 53px;
      font-size: 18px;
    }
  }

  .tariff-bar {
    margin-inline-start: auto;
  }
`;

export const StyledContainer = styled.div`
  .table-container_group-menu {
    margin-block: 0;
    margin-inline: -20px 0;
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};

    width: calc(100% + 40px);
    height: 68px;

    @media ${tablet} {
      height: 61px;
      margin-block: 0;
      margin-inline: -16px 0;
      width: calc(100% + 32px);
    }

    @media ${mobile} {
      height: 52px !important;
      margin-block: 0;
      margin-inline: -16px 0;
      width: calc(100% + 32px);
    }
  }
`;

const SectionHeaderContent = (props) => {
  const {
    isCustomizationAvailable,
    isRestoreAndAutoBackupAvailable,
    tReady,
    setIsLoadedSectionHeader,
    isSSOAvailable,
    workspace,
    standalone,
    getHeaderMenuItems,
    setSelections,
    setSessionsSelected,
    getSessionsHeaderMenuItems,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const isOAuth = location.pathname.includes("oauth");
  const isSessionsPage = location.pathname.includes("sessions");

  const [state, setState] = React.useState({
    header: "",
    isCategoryOrHeader: false,
    showSelector: false,
    isHeaderVisible: false,
  });

  const isAvailableSettings = (key) => {
    switch (key) {
      case "DNSSettings":
        return isCustomizationAvailable;
      case "RestoreBackup":
        return isRestoreAndAutoBackupAvailable;
      case "WhiteLabel":
        return isCustomizationAvailable || standalone;
      case "CompanyInfoSettings":
        return isCustomizationAvailable || standalone;
      case "AdditionalResources":
        return isCustomizationAvailable || standalone;
      case "SingleSignOn:ServiceProviderSettings":
      case "SingleSignOn:SpMetadata":
        return isSSOAvailable;
      default:
        return true;
    }
  };

  React.useEffect(() => {
    if (tReady) setIsLoadedSectionHeader(true);

    const arrayOfParams = getArrayOfParams();

    const key = getKeyByLink(arrayOfParams, settingsTree);

    const keysCollection = key.split("-");

    const currKey = keysCollection.length >= 3 ? key : keysCollection[0];

    const header = getTKeyByKey(currKey, settingsTree);
    const isCategory = checkPropertyByLink(
      arrayOfParams,
      settingsTree,
      "isCategory",
    );
    const isHeader = checkPropertyByLink(
      arrayOfParams,
      settingsTree,
      "isHeader",
    );
    const isCategoryOrHeader = isCategory || isHeader;

    const isNeedPaidIcon = !isAvailableSettings(header);

    state.isNeedPaidIcon !== isNeedPaidIcon &&
      setState((val) => ({ ...val, isNeedPaidIcon }));

    header !== state.header && setState((val) => ({ ...val, header }));

    isCategoryOrHeader !== state.isCategoryOrHeader &&
      setState((val) => ({ ...val, isCategoryOrHeader }));
  }, [
    tReady,
    setIsLoadedSectionHeader,
    getArrayOfParams,
    isAvailableSettings,
    state.isNeedPaidIcon,
    state.header,
    state.isCategoryOrHeader,
    location.pathname,
  ]);

  const onBackToParent = () => {
    let newArrayOfParams = getArrayOfParams();
    newArrayOfParams.splice(-1, 1);
    const newPath = newArrayOfParams.join("/");
    navigate(newPath);
  };

  const getArrayOfParams = () => {
    const resultPath = location.pathname;
    const arrayOfParams = resultPath.split("/").filter((param) => {
      return param !== "filter" && param && param !== "portal-settings";
    });

    return arrayOfParams;
  };

  const addUsers = (items) => {
    const { addUsers } = props;
    if (!addUsers) return;
    addUsers(items);
  };

  const onToggleSelector = (isOpen = !props.selectorIsOpen) => {
    const { toggleSelector } = props;
    toggleSelector(isOpen);
  };

  const onClose = () => {
    const { deselectUser } = props;
    deselectUser();
  };

  const onCheck = (checked) => {
    if (isOAuth) {
      setSelections(checked);
      return;
    }

    if (isSessionsPage) {
      setSessionsSelected(checked ? "all" : "none");
      return;
    }

    const { setSelected } = props;
    setSelected(checked ? "all" : "close");
  };

  const onSelectAll = () => {
    if (isSessionsPage) {
      setSessionsSelected("all");
      return;
    }

    const { setSelected } = props;
    setSelected("all");
  };

  const onSelectOnline = () => {
    setSessionsSelected("online");
  };
  const onSelectOffline = () => {
    setSessionsSelected("offline");
  };

  const removeAdmins = () => {
    const { removeAdmins } = props;
    if (!removeAdmins) return;
    removeAdmins();
  };

  const {
    t,
    isLoadedSectionHeader,

    isHeaderIndeterminate,
    isHeaderChecked,
    isHeaderVisible,
    selection,
  } = props;
  const { header, isCategoryOrHeader, isNeedPaidIcon } = state;
  const arrayOfParams = getArrayOfParams();

  const sessionsCheckboxOptions = (
    <>
      <DropDownItem
        key="all"
        label={t("Files:All")}
        data-index={1}
        onClick={onSelectAll}
      />
      <DropDownItem
        key="online"
        label={t("Common:online")}
        data-index={2}
        onClick={onSelectOnline}
      />
      <DropDownItem
        key="offline"
        label={t("Common:offline")}
        data-index={3}
        onClick={onSelectOffline}
      />
    </>
  );

  const menuItems = isSessionsPage ? (
    sessionsCheckboxOptions
  ) : (
    <>
      <DropDownItem
        key="all"
        label={t("Common:SelectAll")}
        data-index={1}
        onClick={onSelectAll}
      />
    </>
  );

  const headerMenu = isSessionsPage
    ? getSessionsHeaderMenuItems(t)
    : isOAuth
      ? getHeaderMenuItems(t, true)
      : [
          {
            label: t("Common:Delete"),
            disabled: !selection || !selection.length > 0,
            onClick: removeAdmins,
            iconUrl: DeleteReactSvgUrl,
          },
        ];

  const translatedHeader =
    header === IMPORT_HEADER_CONST
      ? workspace === "GoogleWorkspace"
        ? t("ImportFromGoogle")
        : workspace === "Nextcloud"
          ? t("ImportFromNextcloud")
          : workspace === "Workspace"
            ? t("ImportFromPortal", {
                organizationName: t("Common:OrganizationName"),
              })
            : t("DataImport")
      : t(header, { organizationName: t("Common:OrganizationName") });

  return (
    <StyledContainer isHeaderVisible={isHeaderVisible}>
      {isHeaderVisible ? (
        <TableGroupMenu
          checkboxOptions={menuItems}
          onChange={onCheck}
          isChecked={isHeaderChecked}
          isIndeterminate={isHeaderIndeterminate}
          headerMenu={headerMenu}
          withComboBox={isSessionsPage}
          withoutInfoPanelToggler={isSessionsPage}
          isMobileView={false}
        />
      ) : !isLoadedSectionHeader ? (
        <LoaderSectionHeader />
      ) : (
        <HeaderContainer>
          {!isCategoryOrHeader &&
            arrayOfParams[0] &&
            (isMobile() ||
              window.location.href.indexOf("/javascript-sdk/") > -1) && (
              <IconButton
                iconName={ArrowPathReactSvgUrl}
                size="17"
                isFill={true}
                onClick={onBackToParent}
                className="arrow-button"
              />
            )}
          <Headline type="content" truncate={true}>
            <div className="settings-section_header">
              <div className="header">{translatedHeader}</div>
              {isNeedPaidIcon ? (
                <Badge
                  backgroundColor={
                    theme.isBase
                      ? globalColors.favoritesStatus
                      : globalColors.favoriteStatusDark
                  }
                  label={t("Common:Paid")}
                  fontWeight="700"
                  className="settings-section_badge"
                  isPaidBadge={true}
                />
              ) : (
                ""
              )}
            </div>
          </Headline>
          <div className="tariff-bar">
            <TariffBar />
          </div>

          {props.addUsers && (
            <div className="action-wrapper">
              <IconButton
                iconName={ActionsHeaderTouchReactSvgUrl}
                size="17"
                isFill={true}
                onClick={onToggleSelector}
                className="action-button"
              />
            </div>
          )}
        </HeaderContainer>
      )}
    </StyledContainer>
  );
};

export default inject(
  ({
    currentQuotaStore,
    setup,
    common,
    importAccountsStore,
    settingsStore,
    oauthStore,
    sessionsStore,
  }) => {
    const {
      isCustomizationAvailable,
      isRestoreAndAutoBackupAvailable,
      isSSOAvailable,
    } = currentQuotaStore;
    const { addUsers, removeAdmins } = setup.headerAction;
    const { toggleSelector } = setup;
    const {
      selected,
      setSelected,
      isHeaderIndeterminate,
      isHeaderChecked,
      isHeaderVisible,
      deselectUser,
      selectAll,
      selection,
    } = setup.selectionStore;
    const { admins, selectorIsOpen } = setup.security.accessRight;
    const { isLoadedSectionHeader, setIsLoadedSectionHeader } = common;

    const { workspace } = importAccountsStore;
    const { standalone } = settingsStore;

    const { getHeaderMenuItems } = oauthStore;

    const {
      setSelected: setSessionsSelected,
      getHeaderMenuItems: getSessionsHeaderMenuItems,
      isHeaderVisible: isSessionsHeaderVisible,
      isHeaderChecked: isSessionsHeaderChecked,
      isHeaderIndeterminate: isSessionsHeaderIndeterminate,
    } = sessionsStore;

    return {
      addUsers,
      removeAdmins,
      selected,
      setSelected,
      admins,
      isHeaderIndeterminate:
        isHeaderIndeterminate ||
        oauthStore.isHeaderIndeterminate ||
        isSessionsHeaderIndeterminate,
      isHeaderChecked:
        isHeaderChecked ||
        oauthStore.isHeaderChecked ||
        isSessionsHeaderChecked,
      isHeaderVisible:
        isHeaderVisible ||
        oauthStore.isHeaderVisible ||
        isSessionsHeaderVisible,
      deselectUser,
      selectAll,
      toggleSelector,
      selectorIsOpen,
      selection,
      isLoadedSectionHeader,
      setIsLoadedSectionHeader,
      isCustomizationAvailable,
      isRestoreAndAutoBackupAvailable,
      isSSOAvailable,
      workspace,
      standalone,
      getHeaderMenuItems,
      setSelections: oauthStore.setSelections,
      setSessionsSelected,
      getSessionsHeaderMenuItems,
    };
  },
)(
  withLoading(
    withTranslation([
      "Settings",
      "SingleSignOn",
      "Common",
      "JavascriptSdk",
      "OAuth",
    ])(observer(SectionHeaderContent)),
  ),
);
