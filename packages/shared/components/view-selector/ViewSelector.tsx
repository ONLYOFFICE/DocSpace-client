import React from "react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { StyledViewSelector, IconWrapper } from "./ViewSelector.styled";
import { TViewSelectorOption, ViewSelectorProps } from "./ViewSelector.types";

const ViewSelector = ({
  isDisabled,
  isFilter,
  viewSettings,
  viewAs,
  onChangeView,
  ...rest
}: ViewSelectorProps) => {
  const { t } = useTranslation("Common");
  const onChangeViewHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    const target = e.target as HTMLDivElement;

    const el = target.closest(".view-selector-icon") as HTMLDivElement;
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
        <IconWrapper
          id={id}
          isDisabled={isDisabled}
          isChecked={viewAs === value}
          firstItem={indx === 0}
          lastItem={indx === lastIndx}
          key={value}
          //   name={`view-selector-name_${value}`}
          className="view-selector-icon"
          data-view={value}
          title={
            value === "row"
              ? t("Common:SwitchViewToCompact")
              : t("Common:SwitchToThumbnails")
          }
        >
          <ReactSVG src={icon} />
        </IconWrapper>
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
        <IconWrapper
          isFilter={isFilter}
          isDisabled={isDisabled}
          key={value}
          //   name={`view-selector-name_${value}`}
          className="view-selector-icon"
          data-view={value}
          title={
            value === "row"
              ? t("Common:SwitchViewToCompact")
              : t("Common:SwitchToThumbnails")
          }
        >
          <ReactSVG src={icon} />
        </IconWrapper>
      );
    }

    return null;
  };

  return (
    <StyledViewSelector
      {...rest}
      onClick={onChangeViewHandler}
      countItems={viewSettings.length}
      isFilter={isFilter}
      data-testid="view-selector"
    >
      {viewSettings
        ? isFilter
          ? renderOneIconView()
          : renderFewIconView()
        : null}
    </StyledViewSelector>
  );
};

export { ViewSelector };
