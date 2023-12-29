import React from "react";
import { LoaderStyle } from "@docspace/shared/constants";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { StyledSMTPContent } from "./StyledComponent";
const speed = 2;

const SettingsSMTP = () => {
  const firstComponent = (
    <div>
      <div>
        <RectangleSkeleton
          height="22"
          width="56"
          backgroundColor={LoaderStyle.backgroundColor}
          foregroundColor={LoaderStyle.foregroundColor}
          backgroundOpacity={LoaderStyle.backgroundOpacity}
          foregroundOpacity={LoaderStyle.foregroundOpacity}
          speed={speed}
          animate={true}
        />
      </div>
      <RectangleSkeleton
        className="rectangle-loader-2"
        height="32"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
    </div>
  );

  const secondComponent = (
    <div>
      <RectangleSkeleton
        height="20"
        width="101"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
      <RectangleSkeleton
        className="rectangle-loader-2"
        height="32"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
    </div>
  );
  const thirdComponent = (
    <div>
      <RectangleSkeleton
        height="20"
        width="138"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
      <RectangleSkeleton
        className="rectangle-loader-2"
        height="32"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
    </div>
  );

  const checkboxComponent = (
    <div className="rectangle-loader_checkbox">
      <RectangleSkeleton
        height="16"
        width="16"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
      <RectangleSkeleton
        height="22"
        width="101"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
    </div>
  );
  const secondCheckboxComponent = (
    <div className="rectangle-loader_checkbox">
      <RectangleSkeleton
        height="16"
        width="16"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
      <RectangleSkeleton
        height="20"
        width="70"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
    </div>
  );
  const buttonsComponent = (
    <div className="rectangle-loader_buttons">
      <RectangleSkeleton
        height="32"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
      <RectangleSkeleton
        height="32"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
      <RectangleSkeleton
        height="32"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />
    </div>
  );
  return (
    <StyledSMTPContent>
      <RectangleSkeleton
        className="rectangle-loader_title"
        height="22"
        width="128"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />

      <RectangleSkeleton
        className="rectangle-loader_description"
        height="60"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
      />

      {firstComponent}
      {firstComponent}
      <RectangleSkeleton
        className="rectangle-loader_title"
        height="20"
        width="128"
        backgroundColor={LoaderStyle.backgroundColor}
        foregroundColor={LoaderStyle.foregroundColor}
        backgroundOpacity={LoaderStyle.backgroundOpacity}
        foregroundOpacity={LoaderStyle.foregroundOpacity}
        speed={speed}
        animate={true}
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

export default SettingsSMTP;
