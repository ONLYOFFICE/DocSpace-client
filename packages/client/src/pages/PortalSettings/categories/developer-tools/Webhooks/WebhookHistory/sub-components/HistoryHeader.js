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

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { inject, observer } from "mobx-react";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import RetryIcon from "PUBLIC_DIR/images/refresh.react.svg?url";

import Headline from "@docspace/shared/components/headline/Headline";
import { IconButton } from "@docspace/shared/components/icon-button";
// import { Hint } from "../../styled-components";

import { tablet, mobile, isTablet, isMobile } from "@docspace/shared/utils";

import { TableGroupMenu } from "@docspace/shared/components/table";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";

import { toastr } from "@docspace/shared/components/toast";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { FloatingButton } from "@docspace/shared/components/floating-button";

import Base from "@docspace/shared/themes/base";

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background-color: ${(props) => props.theme.backgroundColor};
  z-index: 201;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 53px;
  flex-wrap: wrap;

  @media ${mobile} {
    margin-left: -14px;
    padding-left: 14px;
    margin-right: -14px;
    padding-right: 14px;
  }

  .arrow-button {
    margin-inline-end: 17px;

    @media ${tablet} {
      padding-block: 8px;
      padding-inline: 8px 0;
      margin-inline-start: -8px;
    }

    @media ${mobile} {
      margin-inline-end: 13px;
    }

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }
  }

  .headline {
    font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
    margin-inline-end: 16px;

    @media ${tablet} {
      font-size: ${(props) => props.theme.getCorrectFontSize("21px")};
    }
    @media ${mobile} {
      font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
    }
  }

  .table-container_group-menu {
    margin-block: 0;
    margin-inline: -20px 0;

    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    flex: 0 0 auto;

    width: calc(100% + 40px);
    height: 69px;

    .combo-button_selected-icon {
      svg {
        path {
          fill: ${(props) =>
            props.isDisabled ? "#d0d5da" : props.theme.color};
        }
      }
    }

    @media ${tablet} {
      height: 60px;
      margin-block: 0;
      margin-inline: -16px 0;
      width: calc(100% + 32px);
      top: 5px;
    }
    @media ${mobile} {
      position: absolute;
      height: 48px;
      margin-block: -17px 0;
      margin-inline: -17px 0;
      width: 100%;
      top: 10px;
    }
  }
`;

HeaderContainer.defaultProps = { theme: Base };

const HistoryHeader = (props) => {
  const {
    isGroupMenuVisible,
    checkedEventIds,
    checkAllIds,
    emptyCheckedIds,
    retryWebhookEvents,
    isIndeterminate,
    areAllIdsChecked,
    fetchHistoryItems,
    theme,
    historyFilters,
    formatFilters,
    isRetryPending,
    setRetryPendingFalse,
    setRetryPendingTrue,
  } = props;
  const navigate = useNavigate();
  const onBack = () => {
    navigate("/portal-settings/developer-tools/webhooks");
  };
  const { t } = useTranslation(["Webhooks", "Common", "InfoPanel"]);
  const { id } = useParams();

  const [isPendingVisible, setIsPendingVisible] = useState(false);

  const handleGroupSelection = (isChecked) => {
    isChecked ? checkAllIds() : emptyCheckedIds();
  };

  const handleRetryAll = async () => {
    try {
      setRetryPendingTrue();
      const timeout = setTimeout(() => {
        setIsPendingVisible(true);
      }, 300);
      await retryWebhookEvents(checkedEventIds);
      await emptyCheckedIds();
      clearTimeout(timeout);
      setRetryPendingFalse();
      setIsPendingVisible(false);
      await fetchHistoryItems({
        ...(historyFilters ? formatFilters(historyFilters) : {}),
        configId: id,
      });
      toastr.success(
        `${t("WebhookRedilivered")}: ${checkedEventIds.length}`,
        <b>{t("Common:Done")}</b>,
      );
    } catch (error) {
      console.error(error);
      toastr.error(error);
    } finally {
      setRetryPendingFalse();
      setIsPendingVisible(false);
    }
  };

  const headerMenu = [
    {
      id: "retry-event-option",
      label: t("Retry"),
      onClick: handleRetryAll,
      iconUrl: RetryIcon,
    },
  ];

  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && emptyCheckedIds();

  useEffect(() => {
    window.addEventListener("keyup", onKeyPress);
    return () => window.removeEventListener("keyup", onKeyPress);
  }, []);

  const menuItems = (
    <>
      <DropDownItem
        id="select-all"
        key="select-all-event-ids"
        label={t("Common:SelectAll")}
        data-index={0}
        onClick={checkAllIds}
      />
      <DropDownItem
        id="unselect-all"
        key="unselect-all-event-ids"
        label={t("UnselectAll")}
        data-index={1}
        onClick={emptyCheckedIds}
      />
    </>
  );

  const NavigationHeader = () => (
    <>
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size="17"
        isFill={true}
        onClick={onBack}
        className="arrow-button"
      />
      <Headline type="content" truncate={true} className="headline">
        {t("InfoPanel:SubmenuHistory")}
      </Headline>
      {/* <Hint
        backgroundColor={theme.isBase ? "#F8F9F9" : "#3D3D3D"}
        color={theme.isBase ? "#555F65" : "#FFFFFF"}>
        {t("EventHint")}
      </Hint> */}
    </>
  );

  const GroupMenu = () => (
    <TableGroupMenu
      checkboxOptions={menuItems}
      onChange={handleGroupSelection}
      headerMenu={headerMenu}
      isChecked={areAllIdsChecked}
      isIndeterminate={isIndeterminate}
      withoutInfoPanelToggler
      isBlocked={isRetryPending}
      withComboBox
    />
  );

  useEffect(() => {
    return emptyCheckedIds;
  }, []);

  return (
    <HeaderContainer isDisabled={isRetryPending}>
      {isMobile() ? (
        <>
          {isGroupMenuVisible && <GroupMenu />}
          <NavigationHeader />
        </>
      ) : isGroupMenuVisible ? (
        <GroupMenu />
      ) : (
        <NavigationHeader />
      )}

      {isPendingVisible &&
        createPortal(<FloatingButton icon="refresh" />, document.body)}
    </HeaderContainer>
  );
};

export default inject(({ webhooksStore, settingsStore }) => {
  const {
    isGroupMenuVisible,
    checkAllIds,
    emptyCheckedIds,
    checkedEventIds,
    retryWebhookEvents,
    isIndeterminate,
    areAllIdsChecked,
    fetchHistoryItems,
    historyFilters,
    formatFilters,
    isRetryPending,
    setRetryPendingFalse,
    setRetryPendingTrue,
  } = webhooksStore;

  const { theme } = settingsStore;

  return {
    isGroupMenuVisible,
    checkAllIds,
    emptyCheckedIds,
    checkedEventIds,
    retryWebhookEvents,
    isIndeterminate,
    areAllIdsChecked,
    fetchHistoryItems,
    theme,
    historyFilters,
    formatFilters,
    isRetryPending,
    setRetryPendingFalse,
    setRetryPendingTrue,
  };
})(observer(HistoryHeader));
