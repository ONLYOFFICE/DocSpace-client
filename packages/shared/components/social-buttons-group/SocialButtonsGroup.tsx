import React, { memo, useState } from "react";
import equal from "fast-deep-equal/react";

import { getProviderLabel } from "@docspace/shared/utils/common";

import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/vertical-dots.react.svg?url";

import { SocialButton } from "../social-button";
import { IconButton } from "../icon-button";
import StyledSocialButtonsGroup from "./SocialButtonsGroup.styled";
import type {
  SocialButtonProps,
  ProvidersDataType,
} from "./SocialButtonsGroup.types";
import { PROVIDERS_DATA } from "../../constants";
import MoreLoginModal from "../more-login-modal";

export const SocialButtonsGroup = memo(
  ({
    providers = [],
    onClick,
    ssoLabel,
    ssoUrl,
    ssoSVG,
    t,
    isDisabled,
  }: SocialButtonProps) => {
    const [moreAuthVisible, setMoreAuthVisible] = useState(false);

    const length = providers.length - 1;

    const showingProviders =
      length > 2 ? [providers[0], providers[1], providers[2]] : [...providers];

    const moreAuthClose = () => {
      setMoreAuthVisible(false);
    };

    const moreAuthOpen = () => {
      setMoreAuthVisible(true);
    };
    const elements = showingProviders.map((item) => {
      const provider = item.provider;
      const url = item.url;

      if (!PROVIDERS_DATA[provider as keyof ProvidersDataType]) return;

      const { icon, label, iconOptions } =
        PROVIDERS_DATA[provider as keyof ProvidersDataType];

      return (
        <div className="buttonWrapper" key={`${provider}ProviderItem`}>
          <SocialButton
            isDisabled={isDisabled}
            iconName={icon}
            label={length > 2 ? "" : getProviderLabel(label, t)}
            $iconOptions={iconOptions}
            data-url={url}
            data-providername={provider}
            onClick={onClick}
            className="social-button"
          />
        </div>
      );
    });

    return (
      <StyledSocialButtonsGroup>
        {ssoUrl && (
          <SocialButton
            isDisabled={isDisabled}
            iconName={ssoSVG}
            className="sso-button social-button"
            label={ssoLabel || getProviderLabel("sso", t)}
            onClick={() => (window.location.href = ssoUrl)}
          />
        )}
        {providers.length !== 0 && (
          <div className="social-buttons-group">
            {elements}
            {length > 2 && (
              <div className="show-more-button">
                <IconButton
                  size={20}
                  onClick={moreAuthOpen}
                  iconName={VerticalDotsReactSvgUrl}
                  isFill
                  isClickable={false}
                />
              </div>
            )}

            <MoreLoginModal
              t={t}
              visible={moreAuthVisible}
              onClose={moreAuthClose}
              providers={providers}
              onSocialLoginClick={onClick}
              ssoLabel={ssoLabel}
              ssoUrl={ssoUrl}
              isSignUp
            />
          </div>
        )}
      </StyledSocialButtonsGroup>
    );
  },
  equal,
);

SocialButtonsGroup.displayName = "SocialButtonsGroup";
