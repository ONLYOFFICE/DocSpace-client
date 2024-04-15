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
import styled, { css } from "styled-components";
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
import {
  getKeyByLink,
  settingsTree,
  getTKeyByKey,
  checkPropertyByLink,
} from "../../../utils";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import TariffBar from "SRC_DIR/components/TariffBar";

const HeaderContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  max-width: calc(100vw - 32px);
  .settings-section_header {
    display: flex;
    align-items: center;
    .settings-section_badge {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 8px;
            `
          : css`
              margin-left: 8px;
            `}
      cursor: auto;
    }

    .header {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      color: ${(props) => props.theme.client.settings.headerTitleColor};
      display: flex;
      align-items: center;
    }
  }
  .action-wrapper {
    flex-grow: 1;

    .action-button {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: auto;
            `
          : css`
              margin-left: auto;
            `}
    }
  }

  .arrow-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 12px;
          `
        : css`
            margin-right: 12px;
          `}

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }

    @media ${tablet} {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding: 8px 8px 8px 0;
              margin-right: -8px;
            `
          : css`
              padding: 8px 0 8px 8px;
              margin-left: -8px;
            `}
    }
  }

  @media ${tablet} {
    h1 {
      line-height: 61px;
      font-size: ${(props) => props.theme.getCorrectFontSize("21px")};
    }
  }

  @media ${desktop} {
    h1 {
      font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
      line-height: 59px !important;
    }
  }

  @media ${mobile} {
    h1 {
      line-height: 53px;
      font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
    }
  }

  .tariff-bar {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: auto;
          `
        : css`
            margin-left: auto;
          `}
  }
`;

const StyledContainer = styled.div`
  .group-button-menu-container {
    ${(props) =>
      props.viewAs === "table"
        ? css`
            margin: 0px -20px;
            width: calc(100% + 40px);
          `
        : css`
            margin: 0px -20px;
            width: calc(100% + 40px);
          `}

    @media ${tablet} {
      margin: 0 -16px;
      width: calc(100% + 32px);
    }
  }
`;

const SectionHeaderContent = (props) => {
  const {
    isBrandingAndCustomizationAvailable,
    isRestoreAndAutoBackupAvailable,
    tReady,
    setIsLoadedSectionHeader,
    isSSOAvailable,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = React.useState({
    header: "",
    isCategoryOrHeader: false,
    showSelector: false,
    isHeaderVisible: false,
  });

  const isAvailableSettings = (key) => {
    switch (key) {
      case "DNSSettings":
        return isBrandingAndCustomizationAvailable;
      case "RestoreBackup":
        return isRestoreAndAutoBackupAvailable;
      case "WhiteLabel":
        return isBrandingAndCustomizationAvailable;
      case "CompanyInfoSettings":
        return isBrandingAndCustomizationAvailable;
      case "AdditionalResources":
        return isBrandingAndCustomizationAvailable;
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
    let currKey = key.length > 3 ? key : key[0];

    if (key === "8" || key === "8-0") currKey = "8-0";

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
    const { setSelected } = props;
    setSelected(checked ? "all" : "close");
  };

  const onSelectAll = () => {
    const { setSelected } = props;
    setSelected("all");
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

  const menuItems = (
    <>
      <DropDownItem
        key="all"
        label={t("Common:SelectAll")}
        data-index={1}
        onClick={onSelectAll}
      />
    </>
  );

  const headerMenu = [
    {
      label: t("Common:Delete"),
      disabled: !selection || !selection.length > 0,
      onClick: removeAdmins,
      iconUrl: DeleteReactSvgUrl,
    },
  ];

  const pathname = location.pathname;

  const isServicePage =
    pathname.includes("google") ||
    pathname.includes("nextcloud") ||
    pathname.includes("onlyoffice");

  return (
    <StyledContainer isHeaderVisible={isHeaderVisible}>
      {isHeaderVisible ? (
        <div className="group-button-menu-container">
          <TableGroupMenu
            checkboxOptions={menuItems}
            onChange={onCheck}
            isChecked={isHeaderChecked}
            isIndeterminate={isHeaderIndeterminate}
            headerMenu={headerMenu}
            withComboBox
          />
        </div>
      ) : !isLoadedSectionHeader ? (
        <LoaderSectionHeader />
      ) : (
        <HeaderContainer>
          {!isCategoryOrHeader && arrayOfParams[0] && (
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
              <div className="header">
                {isMobile() && isServicePage && (
                  <IconButton
                    iconName={ArrowPathReactSvgUrl}
                    size="17"
                    isFill={true}
                    onClick={onBackToParent}
                    className="arrow-button"
                  />
                )}
                {t(header)}
              </div>
              {isNeedPaidIcon ? (
                <Badge
                  backgroundColor="#EDC409"
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

export default inject(({ currentQuotaStore, setup, common }) => {
  const {
    isBrandingAndCustomizationAvailable,
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
  return {
    addUsers,
    removeAdmins,
    selected,
    setSelected,
    admins,
    isHeaderIndeterminate,
    isHeaderChecked,
    isHeaderVisible,
    deselectUser,
    selectAll,
    toggleSelector,
    selectorIsOpen,
    selection,
    isLoadedSectionHeader,
    setIsLoadedSectionHeader,
    isBrandingAndCustomizationAvailable,
    isRestoreAndAutoBackupAvailable,
    isSSOAvailable,
  };
})(
  withLoading(
    withTranslation(["Settings", "SingleSignOn", "Common", "JavascriptSdk"])(
      observer(SectionHeaderContent),
    ),
  ),
);
