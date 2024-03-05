import React from "react";
import { LOADER_STYLE } from "@docspace/shared/constants";

import { RectangleSkeleton } from "../rectangle";

import { StyledSMTPContent } from "./Settings.styled";

const speed = 2;

export const SettingsSMTPSkeleton = () => {
  const firstComponent = (
    <div>
      <div>
        <RectangleSkeleton
          height="22"
          width="56"
          backgroundColor={LOADER_STYLE.backgroundColor}
          foregroundColor={LOADER_STYLE.foregroundColor}
          backgroundOpacity={LOADER_STYLE.backgroundOpacity}
          foregroundOpacity={LOADER_STYLE.foregroundOpacity}
          speed={speed}
          animate
        />
      </div>
      <RectangleSkeleton
        className="rectangle-loader-2"
        height="32"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
    </div>
  );

  const secondComponent = (
    <div>
      <RectangleSkeleton
        height="20"
        width="101"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
      <RectangleSkeleton
        className="rectangle-loader-2"
        height="32"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
    </div>
  );
  const thirdComponent = (
    <div>
      <RectangleSkeleton
        height="20"
        width="138"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
      <RectangleSkeleton
        className="rectangle-loader-2"
        height="32"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
    </div>
  );

  const checkboxComponent = (
    <div className="rectangle-loader_checkbox">
      <RectangleSkeleton
        height="16"
        width="16"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
      <RectangleSkeleton
        height="22"
        width="101"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
    </div>
  );
  const secondCheckboxComponent = (
    <div className="rectangle-loader_checkbox">
      <RectangleSkeleton
        height="16"
        width="16"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
      <RectangleSkeleton
        height="20"
        width="70"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
    </div>
  );
  const buttonsComponent = (
    <div className="rectangle-loader_buttons">
      <RectangleSkeleton
        height="32"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
      <RectangleSkeleton
        height="32"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
      <RectangleSkeleton
        height="32"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
    </div>
  );
  return (
    <StyledSMTPContent>
      <RectangleSkeleton
        className="rectangle-loader_title"
        height="22"
        width="128"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />

      <RectangleSkeleton
        className="rectangle-loader_description"
        height="60"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />

      {firstComponent}
      {firstComponent}
      <RectangleSkeleton
        className="rectangle-loader_title"
        height="20"
        width="128"
        backgroundColor={LOADER_STYLE.backgroundColor}
        foregroundColor={LOADER_STYLE.foregroundColor}
        backgroundOpacity={LOADER_STYLE.backgroundOpacity}
        foregroundOpacity={LOADER_STYLE.foregroundOpacity}
        speed={speed}
        animate
      />
      {secondComponent}
      {secondComponent}

      {checkboxComponent}

      {thirdComponent}
      {thirdComponent}

      {secondCheckboxComponent}
      {buttonsComponent}
    </StyledSMTPContent>
  );
};
