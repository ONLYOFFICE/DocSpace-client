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

import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import ActionsHeaderTouchReactSvgUrl from "PUBLIC_DIR/images/actions.header.touch.react.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import styled, { useTheme } from "styled-components";
import { useNavigate, useLocation } from "react-router";
import { withTranslation } from "react-i18next";
import { Heading } from "@docspace/shared/components/heading";
import { IconButton } from "@docspace/shared/components/icon-button";
import { TableGroupMenu } from "@docspace/shared/components/table";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { mobile, tablet, desktop, isMobile } from "@docspace/shared/utils";
import withLoading from "SRC_DIR/HOCs/withLoading";
import { Badge } from "@docspace/shared/components/badge";
import { globalColors } from "@docspace/shared/themes";
import { DeviceType } from "@docspace/shared/enums";

import TariffBar from "SRC_DIR/components/TariffBar";
import { IMPORT_HEADER_CONST } from "SRC_DIR/pages/PortalSettings/utils/settingsTree";

import Warning from "../../WarningComponent";
import {
  getKeyByLink,
  settingsTree,
  getTKeyByKey,
  checkPropertyByLink,
} from "../../../utils";
import LoaderSectionHeader from "../loaderSectionHeader";

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
  .settings-section_warning {
    margin-inline-start: 16px;
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
    selectorIsOpen,
    toggleSelector,
    removeAdmins,
    deviceType,
    isNotPaidPeriod,
    isBackupPaid,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const isOAuth = location.pathname.includes("oauth");

  const [state, setState] = React.useState({
    header: "",
    isCategoryOrHeader: false,
    showSelector: false,
    isHeaderVisible: false,
  });

  const getArrayOfParams = () => {
    const path = location.pathname;
    const arrayPath = path.split("/");
    const arrayOfParams = arrayPath.filter((param) => {
      return param && param !== "filter" && param !== "portal-settings";
    });

    return arrayOfParams;
  };

  const isAvailableSettings = (key) => {
    switch (key) {
      case "PortalRenaming":
        return isCustomizationAvailable;
      case "DNSSettings":
        return isCustomizationAvailable;
      case "Common:RestoreBackup":
        return isRestoreAndAutoBackupAvailable;
      case "BrandName":
        return isCustomizationAvailable || standalone;
      case "WhiteLabel":
        return isCustomizationAvailable || standalone;
      case "CompanyInfoSettings":
        return isCustomizationAvailable || standalone;
      case "AdditionalResources":
        return isCustomizationAvailable || standalone;
      case "SingleSignOn:ServiceProviderSettings":
      case "SingleSignOn:SpMetadata":
        return isSSOAvailable;
      case "Backup":
        if (isNotPaidPeriod) return true;
        return !isBackupPaid;
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

    // console.log(settingsTree, currKey);

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
    navigate(-1);
  };

  const onToggleSelector = (isOpen = !selectorIsOpen) => {
    toggleSelector(isOpen);
  };

  const onCheck = (checked) => {
    if (isOAuth) {
      setSelections(checked);
      return;
    }

    const { setSelected } = props;
    setSelected(checked ? "all" : "close");
  };

  const onSelectAll = () => {
    const { setSelected } = props;
    setSelected("all");
  };

  const onClick = () => {
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
    addUsers,
    logoText,
  } = props;

  const { header, isCategoryOrHeader, isNeedPaidIcon } = state;
  const arrayOfParams = getArrayOfParams();

  const menuItems = (
    <DropDownItem
      key="all"
      label={t("Common:SelectAll")}
      data-index={1}
      onClick={onSelectAll}
    />
  );

  const headerMenu = isOAuth
    ? getHeaderMenuItems(t, true)
    : [
        {
          label: t("Common:Delete"),
          disabled: !selection || !selection.length > 0,
          onClick,
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
                organizationName: logoText,
              })
            : t("DataImport")
      : t(header, {
          organizationName: logoText,
          license: t("Common:EnterpriseLicense"),
          productName: t("Common:ProductName"),
        });

  // console.log(translatedHeader, header);

  return (
    <StyledContainer isHeaderVisible={isHeaderVisible}>
      {isHeaderVisible ? (
        <TableGroupMenu
          checkboxOptions={menuItems}
          onChange={onCheck}
          isChecked={isHeaderChecked}
          isIndeterminate={isHeaderIndeterminate}
          headerMenu={headerMenu}
          withComboBox={false}
          withoutInfoPanelToggler
          isMobileView={false}
        />
      ) : !isLoadedSectionHeader ? (
        <LoaderSectionHeader />
      ) : (
        <HeaderContainer>
          {!isCategoryOrHeader &&
          arrayOfParams[0] &&
          (isMobile() ||
            window.location.href.indexOf("/javascript-sdk/") > -1) ? (
            <IconButton
              iconName={ArrowPathReactSvgUrl}
              size="17"
              isFill
              onClick={onBackToParent}
              className="arrow-button"
              dataTestId="back_parent_icon_button"
            />
          ) : null}
          <Heading type="content" truncate>
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
                  isPaidBadge
                />
              ) : (
                ""
              )}
            </div>
          </Heading>
          {deviceType === DeviceType.desktop ? (
            <div className="settings-section_warning">
              <Warning />
            </div>
          ) : null}
          {arrayOfParams[0] !== "payments" && arrayOfParams.length < 3 ? (
            <div className="tariff-bar">
              <TariffBar />
            </div>
          ) : null}
          {addUsers ? (
            <div className="action-wrapper">
              <IconButton
                iconName={ActionsHeaderTouchReactSvgUrl}
                size="17"
                isFill
                onClick={onToggleSelector}
                className="action-button"
              />
            </div>
          ) : null}
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
    currentTariffStatusStore,
  }) => {
    const {
      isCustomizationAvailable,
      isRestoreAndAutoBackupAvailable,
      isSSOAvailable,
      isBackupPaid,
    } = currentQuotaStore;
    const { isNotPaidPeriod } = currentTariffStatusStore;
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
    const { standalone, logoText, deviceType } = settingsStore;

    const { getHeaderMenuItems } = oauthStore;
    return {
      addUsers,
      removeAdmins,
      selected,
      setSelected,
      admins,
      isHeaderIndeterminate:
        isHeaderIndeterminate || oauthStore.isHeaderIndeterminate,
      isHeaderChecked: isHeaderChecked || oauthStore.isHeaderChecked,
      isHeaderVisible: isHeaderVisible || oauthStore.isHeaderVisible,
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
      logoText,
      deviceType,
      isNotPaidPeriod,
      isBackupPaid,
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
