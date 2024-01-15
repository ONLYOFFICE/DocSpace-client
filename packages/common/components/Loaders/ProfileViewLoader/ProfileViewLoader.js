import React from "react";
import PropTypes from "prop-types";
import {
  StyledWrapper,
  MainBlock,
  LoginBlock,
  SocialBlock,
  SubBlock,
  ThemeBlock,
} from "./StyledProfileView";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { CircleSkeleton } from "@docspace/shared/skeletons";

import MobileViewLoader from "./MobileView";
import { isMobile } from "@docspace/shared/utils";

const ProfileViewLoader = ({ id, className, style, ...rest }) => {
  const {
    title,
    borderRadius,
    backgroundColor,
    foregroundColor,
    backgroundOpacity,
    foregroundOpacity,
    speed,
    animate,
  } = rest;

  if (isMobile())
    return (
      <div id={id} className={className} style={style}>
        <MobileViewLoader {...rest} />
      </div>
    );
  return (
    <div id={id} className={className} style={style}>
      <StyledWrapper>
        <MainBlock>
          <CircleSkeleton
            className="avatar"
            title={title}
            x="62"
            y="62"
            radius="62"
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />

          <div className="combos">
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="37"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="226"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="34"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="156"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="59"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="93"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="75"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="208"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="59"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="140"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
          </div>
        </MainBlock>
        <LoginBlock>
          <div>
            <RectangleSkeleton
              className="title"
              title={title}
              width="112"
              height="22"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              title={title}
              height="40"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
          <div className="actions">
            <RectangleSkeleton
              title={title}
              width="168"
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              title={title}
              width="109"
              height="20"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
        </LoginBlock>
        <SocialBlock>
          <RectangleSkeleton
            title={title}
            width="237"
            height="22"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
          <div className="row">
            <RectangleSkeleton
              className="button"
              title={title}
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              className="button"
              title={title}
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
          <div className="row">
            <RectangleSkeleton
              className="button"
              title={title}
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              className="button"
              title={title}
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
        </SocialBlock>
        <SubBlock>
          <RectangleSkeleton
            title={title}
            width="101"
            height="22"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
          <div className="toggle">
            <RectangleSkeleton
              title={title}
              width="28"
              height="16"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              title={title}
              width="223"
              height="20"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
        </SubBlock>
        <ThemeBlock>
          <RectangleSkeleton
            title={title}
            width="129"
            height="22"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
          <div className="checkbox">
            <div className="row">
              <RectangleSkeleton
                title={title}
                width="16"
                height="16"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="124"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
            <RectangleSkeleton
              className="description"
              title={title}
              width="291"
              height="32"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>

          <div className="themes-wrapper">
            <RectangleSkeleton
              className="theme"
              title={title}
              height="284"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
            <RectangleSkeleton
              className="theme"
              title={title}
              height="284"
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
              backgroundOpacity={backgroundOpacity}
              foregroundOpacity={foregroundOpacity}
              speed={speed}
              animate={animate}
            />
          </div>
        </ThemeBlock>
      </StyledWrapper>
    </div>
  );
};

ProfileViewLoader.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

ProfileViewLoader.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
};

export default ProfileViewLoader;
