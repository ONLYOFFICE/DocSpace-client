import React, { memo } from "react";
import equal from "fast-deep-equal/react";
import { ReactSVG } from "react-svg";

import { Text } from "../text";

import StyledSocialButton from "./SocialButton.styled";
import type { SocialButtonProps } from "./SocialButton.types";

export const SocialButton = memo(
  ({
    label = "",
    size = "base",
    IconComponent,
    tabIndex = -1,
    iconName = "SocialButtonGoogleIcon",
    isConnect = false,
    isDisabled = false,
    noHover = false,
    ...otherProps
  }: SocialButtonProps) => {
    return (
      <StyledSocialButton
        data-testid="social-button"
        size={size}
        noHover={noHover}
        tabIndex={tabIndex}
        isConnect={isConnect}
        isDisabled={isDisabled}
        {...otherProps}
      >
        <div className="social-button-container">
          {IconComponent ? (
            <IconComponent className="iconWrapper" />
          ) : (
            <ReactSVG className="iconWrapper" src={iconName} />
          )}
          {label && (
            <Text as="div" className="social_button_text">
              {label}
            </Text>
          )}
        </div>
      </StyledSocialButton>
    );
  },
  equal,
);

SocialButton.displayName = "SocialButton";
