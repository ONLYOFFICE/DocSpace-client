import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import ActionsHeaderTouchReactSvgUrl from "PUBLIC_DIR/images/actions.header.touch.react.svg?url";
import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import LogoutReactSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { withTranslation } from "react-i18next";
import Headline from "@docspace/common/components/Headline";
import { IconButton } from "@docspace/shared/components/icon-button";
import { TableGroupMenu } from "@docspace/shared/components/table";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import LoaderSectionHeader from "../loaderSectionHeader";
import { mobile, tablet, desktop } from "@docspace/shared/utils";
import withLoading from "SRC_DIR/HOCs/withLoading";
import { Badge } from "@docspace/shared/components/badge";
import {
  getKeyByLink,
  settingsTree,
  getTKeyByKey,
  checkPropertyByLink,
} from "../../../utils";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

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
`;

const StyledContainer = styled.div`
  .group-button-menu-container {
    height: 69px;
    position: absolute;
    z-index: 201;
    top: 0px;
    left: 0px;
    width: 100%;

    @media ${tablet} {
      height: 60px;
    }

    @media ${mobile} {
      height: 52px;
    }

    .table-container_group-menu {
      border-image-slice: 0;
      border-image-source: none;
      border-bottom: ${(props) =>
        props.theme.filesSection.tableView.row.borderColor};
      box-shadow: rgba(4, 15, 27, 0.07) 0px 15px 20px;
      padding: 0px;
    }

    .table-container_group-menu-separator {
      margin: 0 16px;
    }

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
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const isSessionsPage = location.pathname.includes("/sessions");

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
      "isCategory"
    );
    const isHeader = checkPropertyByLink(
      arrayOfParams,
      settingsTree,
      "isHeader"
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
    const { setupSetSelected, peopleSetSelected } = props;
    isSessionsPage
      ? peopleSetSelected(checked ? "all" : "close", isSessionsPage)
      : setupSetSelected(checked ? "all" : "close");
  };

  const onSelectAll = () => {
    const { setupSetSelected, peopleSetSelected } = props;
    isSessionsPage
      ? peopleSetSelected("all", isSessionsPage)
      : setupSetSelected("all");
  };

  const removeAdmins = () => {
    const { removeAdmins } = props;
    if (!removeAdmins) return;
    removeAdmins();
  };

  const {
    t,
    isLoadedSectionHeader,

    isSetupleHeaderIndeterminate,
    isSetupHeaderVisible,
    isSetupHeaderChecked,

    isPeopleHeaderIndeterminate,
    isPeopleHeaderVisible,
    isPeopleHeaderChecked,
    setupSelection,
    peopleSelection,
    setDisableDialogVisible,
    setLogoutDialogVisible,
    setLogoutAllDialogVisible,
    setSessionModalData,
    isVisible,
  } = props;
  const { header, isCategoryOrHeader, isNeedPaidIcon } = state;
  const arrayOfParams = getArrayOfParams();

  const menuItems = isSessionsPage ? (
    <>
      <DropDownItem
        key="all"
        label={t("Files:All")}
        data-index={1}
        onClick={onSelectAll}
      />
      <DropDownItem
        key="online"
        label={t("Common:Online")}
        data-index={2}
        onClick={() => console.log("online")}
      />
      <DropDownItem
        key="offline"
        label={t("Common:Offline")}
        data-index={3}
        onClick={() => console.log("offline")}
      />
    </>
  ) : (
    <>
      <DropDownItem
        key="all"
        label={t("Common:SelectAll")}
        data-index={1}
        onClick={onSelectAll}
      />
      <></>
    </>
  );

  const onClickSessions = () => {
    console.log("view sessions");
  };

  const onClickLogout = () => {
    if (isVisible) {
      setLogoutAllDialogVisible(true);
    } else {
      setLogoutDialogVisible(true);
      setSessionModalData({
        id: peopleSelection[0].userId,
        platform: peopleSelection[0].platform,
        browser: peopleSelection[0].browser,
      });
    }
  };

  const onClickDisable = () => {
    setDisableDialogVisible(true);
  };

  const headerMenu = isSessionsPage
    ? [
        {
          id: "sessions",
          key: "Sessions",
          label: t("Common:Sessions"),
          disabled: isVisible,
          onClick: onClickSessions,
          iconUrl: HistoryFinalizedReactSvgUrl,
        },
        {
          id: "logout",
          key: "Logout",
          label: t("Common:Logout"),
          onClick: onClickLogout,
          iconUrl: LogoutReactSvgUrl,
        },
        {
          id: "Disable",
          key: "Disable",
          label: t("Common:DisableUserButton"),
          onClick: onClickDisable,
          iconUrl: RemoveSvgUrl,
        },
      ]
    : [
        {
          label: t("Common:Delete"),
          disabled: !setupSelection || !setupSelection.length > 0,
          onClick: removeAdmins,
          iconUrl: DeleteReactSvgUrl,
        },
      ];

  const isHeaderVisible = isSessionsPage
    ? isPeopleHeaderVisible
    : isSetupHeaderVisible;

  const isHeaderChecked = isSessionsPage
    ? isPeopleHeaderChecked
    : isSetupHeaderChecked;

  const isHeaderIndeterminate = isSessionsPage
    ? isPeopleHeaderIndeterminate
    : isSetupleHeaderIndeterminate;

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
            withoutInfoPanelToggler
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
              <div className="header"> {t(header)}</div>
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

export default inject(({ auth, setup, common, peopleStore }) => {
  const { currentQuotaStore } = auth;
  const {
    isBrandingAndCustomizationAvailable,
    isRestoreAndAutoBackupAvailable,
  } = currentQuotaStore;
  const { addUsers, removeAdmins } = setup.headerAction;
  const {
    toggleSelector,
    setDisableDialogVisible,
    setLogoutDialogVisible,
    setLogoutAllDialogVisible,
    setSessionModalData,
  } = setup;
  const {
    selected,
    setSelected: setupSetSelected,
    isHeaderIndeterminate: isSetupHeaderIndeterminate,
    isHeaderChecked: isSetupHeaderChecked,
    isHeaderVisible: isSetupHeaderVisible,
    deselectUser,
    selectAll,
    selection: setupSelection,
  } = setup.selectionStore;
  const {
    isHeaderIndeterminate: isPeopleHeaderIndeterminate,
    isHeaderChecked: isPeopleHeaderChecked,
    isHeaderVisible: isPeopleHeaderVisible,
    setSelected: peopleSetSelected,
    isVisible,
    selection: peopleSelection,
  } = peopleStore.selectionStore;

  const { admins, selectorIsOpen } = setup.security.accessRight;
  const { isLoadedSectionHeader, setIsLoadedSectionHeader } = common;
  return {
    addUsers,
    removeAdmins,
    selected,
    admins,
    setupSetSelected,
    isSetupHeaderIndeterminate,
    isSetupHeaderChecked,
    isSetupHeaderVisible,
    deselectUser,
    selectAll,
    toggleSelector,
    selectorIsOpen,
    setupSelection,
    isLoadedSectionHeader,
    setIsLoadedSectionHeader,
    isBrandingAndCustomizationAvailable,
    isRestoreAndAutoBackupAvailable,
    peopleSetSelected,
    peopleSelection,
    isPeopleHeaderIndeterminate,
    isPeopleHeaderChecked,
    isPeopleHeaderVisible,
    isVisible,
    setDisableDialogVisible,
    setLogoutDialogVisible,
    setLogoutAllDialogVisible,
    setSessionModalData,
  };
})(
  withLoading(
    withTranslation(["Settings", "SingleSignOn", "Common", "Files"])(
      observer(SectionHeaderContent)
    )
  )
);
