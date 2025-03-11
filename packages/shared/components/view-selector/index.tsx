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

import React from "react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import { TViewSelectorOption, ViewSelectorProps } from "./ViewSelector.types";
import styles from "./ViewSelector.module.scss";

const ViewSelector = ({
  isDisabled,
  isFilter,
  viewSettings,
  viewAs,
  onChangeView,
  className,
  style,
  ...rest
}: ViewSelectorProps) => {
  const { t } = useTranslation("Common");
  const onChangeViewHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    const target = e.target as HTMLDivElement;

    const el = target.closest(`.${styles.iconWrapper}`) as HTMLDivElement;
    if (!el) return;

    const view = el.dataset?.view;

    if (view !== viewAs && view) {
      const option = viewSettings.find(
        (setting: TViewSelectorOption) => view === setting.value,
      );
      if (option) option.callback?.();
      onChangeView(view);
    }
  };

  const lastIndx = viewSettings && viewSettings.length - 1;

  const renderFewIconView = () => {
    return viewSettings.map((el: TViewSelectorOption, indx: number) => {
      const { value, icon, id } = el;

      return (
        <div
          className={classNames(styles.iconWrapper, {
            "view-selector-icon": true,
            [styles.disabled]: isDisabled,
            [styles.checked]: viewAs === value,
            [styles.firstItem]: indx === 0,
            [styles.lastItem]: indx === lastIndx,
          })}
          id={id}
          key={value}
          data-view={value}
          title={
            value === "row"
              ? t("Common:SwitchViewToCompact")
              : t("Common:SwitchToThumbnails")
          }
          data-testid="view-selector-icon"
        >
          {typeof icon === "string" ? <ReactSVG src={icon} /> : icon}
        </div>
      );
    });
  };

  const renderOneIconView = () => {
    const element = viewSettings.find(
      (el: TViewSelectorOption) => el.value !== viewAs,
    );

    if (element) {
      const { value, icon } = element;

      return (
        <div
          className={classNames(styles.iconWrapper, {
            [styles.disabled]: isDisabled,
            [styles.filter]: isFilter,
          })}
          key={value}
          data-view={value}
          title={
            value === "row"
              ? t("Common:SwitchViewToCompact")
              : t("Common:SwitchToThumbnails")
          }
          data-testid="view-selector-icon"
        >
          {typeof icon === "string" ? <ReactSVG src={icon} /> : icon}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      style={
        {
          "--view-selector-items-count": viewSettings.length,
          ...style,
        } as React.CSSProperties
      }
      className={classNames(styles.viewSelector, className, {
        [styles.filter]: isFilter,
        [styles.countItemsMoreThan2]: viewSettings.length > 2,
      })}
      {...rest}
      onClick={onChangeViewHandler}
      data-testid="view-selector"
    >
      {viewSettings
        ? isFilter
          ? renderOneIconView()
          : renderFewIconView()
        : null}
    </div>
  );
};

export { ViewSelector };
export type { TViewSelectorOption } from "./ViewSelector.types";
