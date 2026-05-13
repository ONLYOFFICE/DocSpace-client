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

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams, useLocation } from "react-router";
import { inject, observer } from "mobx-react";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import RetryIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";

import { Heading } from "@docspace/ui-kit/components/heading";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import { isMobile } from "@docspace/shared/utils";

import { TableGroupMenu } from "@docspace/ui-kit/components/table";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";

import { toastr } from "@docspace/ui-kit/components/toast";
import { useTranslation } from "react-i18next";

import { FloatingButton } from "@docspace/ui-kit/components/floating-button";

import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import { retryWebhooks } from "@docspace/shared/api/settings";
import { formatFilters } from "SRC_DIR/helpers/webhooks";

import styles from "../WebhookHistory.styled.module.scss";

const NavigationHeader = ({ t, onBack }) => (
  <>
    <IconButton
      iconName={ArrowPathReactSvgUrl}
      size="17"
      isFill
      onClick={onBack}
      className="arrow-button"
    />
    <Heading type="content" truncate className="headline">
      {t("InfoPanel:SubmenuHistory")}
    </Heading>
  </>
);

const GroupMenu = ({
  menuItems,
  handleGroupSelection,
  headerMenu,
  areAllIdsChecked,
  isIndeterminate,
  isRetryPending,
}) => (
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

const HistoryHeader = (props) => {
  const {
    isGroupMenuVisible,
    checkedEventIds,
    checkAllIds,
    emptyCheckedIds,
    isIndeterminate,
    areAllIdsChecked,
    fetchHistoryItems,
    historyFilters,
    isRetryPending,
    setRetryPendingFalse,
    setRetryPendingTrue,
  } = props;
  const navigate = useNavigate();

  const onBack = () => {
    navigate("/developer-tools/webhooks");
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
      await retryWebhooks(checkedEventIds);
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

  useEffect(() => {
    return emptyCheckedIds;
  }, []);

  return (
    <div
      className={styles.headerContainer}
      data-disabled={isRetryPending || undefined}
    >
      {isMobile() ? (
        <>
          {isGroupMenuVisible ? (
            <GroupMenu
              menuItems={menuItems}
              handleGroupSelection={handleGroupSelection}
              headerMenu={headerMenu}
              areAllIdsChecked={areAllIdsChecked}
              isIndeterminate={isIndeterminate}
              isRetryPending={isRetryPending}
            />
          ) : null}
          <NavigationHeader t={t} onBack={onBack} />
        </>
      ) : isGroupMenuVisible ? (
        <GroupMenu
          menuItems={menuItems}
          handleGroupSelection={handleGroupSelection}
          headerMenu={headerMenu}
          areAllIdsChecked={areAllIdsChecked}
          isIndeterminate={isIndeterminate}
          isRetryPending={isRetryPending}
        />
      ) : (
        <NavigationHeader t={t} onBack={onBack} />
      )}

      {isPendingVisible
        ? createPortal(<FloatingButton icon="refresh" />, document.body)
        : null}
    </div>
  );
};

export default inject(({ webhooksStore }) => {
  const {
    isGroupMenuVisible,
    checkAllIds,
    emptyCheckedIds,
    checkedEventIds,
    isIndeterminate,
    areAllIdsChecked,
    fetchHistoryItems,
    historyFilters,
    isRetryPending,
    setRetryPendingFalse,
    setRetryPendingTrue,
  } = webhooksStore;

  return {
    isGroupMenuVisible,
    checkAllIds,
    emptyCheckedIds,
    checkedEventIds,
    isIndeterminate,
    areAllIdsChecked,
    fetchHistoryItems,
    historyFilters,
    isRetryPending,
    setRetryPendingFalse,
    setRetryPendingTrue,
  };
})(observer(HistoryHeader));
