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

import { memo, useState } from "react";
import equal from "fast-deep-equal/react";

import VerticalDotsReactSvg from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg";

import { getProviderLabel } from "../../utils/common";
import { SocialButton } from "../social-button";
import styles from "./SocialButtonsGroup.module.scss";
import type {
  SocialButtonProps,
  ProvidersDataType,
} from "./SocialButtonsGroup.types";
import { PROVIDERS_DATA } from "../../constants";
import MoreLoginModal from "../../dialogs/more-login-modal";

export const SocialButtonsGroup = memo(
  ({
    providers = [],
    onClick,
    ssoLabel,
    ssoUrl,
    ssoSVG,
    t,
    isDisabled,
    onMoreAuthToggle,
  }: SocialButtonProps) => {
    const [moreAuthVisible, setMoreAuthVisible] = useState(false);

    const length = providers.length - 1;

    const showingProviders =
      length > 2 ? [providers[0], providers[1], providers[2]] : [...providers];

    const moreAuthClose = () => {
      setMoreAuthVisible(false);
      onMoreAuthToggle?.(false);
    };

    const moreAuthOpen = () => {
      setMoreAuthVisible(true);
      onMoreAuthToggle?.(true);
    };
    const elements = showingProviders.map((item) => {
      const { provider } = item;
      const { url } = item;

      if (!PROVIDERS_DATA[provider as keyof ProvidersDataType]) return;

      const { icon, label, iconOptions } =
        PROVIDERS_DATA[provider as keyof ProvidersDataType];

      return (
        <div
          className={styles.buttonWrapper}
          key={`${provider}ProviderItem`}
          data-test-id={`${provider}-button-wrapper`}
        >
          <SocialButton
            isDisabled={isDisabled}
            label={length >= 2 ? "" : getProviderLabel(label, t)}
            $iconOptions={iconOptions}
            data-url={url}
            data-providername={provider}
            data-test-id={`${provider}-social-button`}
            aria-label={getProviderLabel(label, t)}
            IconComponent={icon}
            onClick={onClick}
            className="social-button"
          />
        </div>
      );
    });

    return (
      <div className={styles.container}>
        {ssoUrl ? (
          <SocialButton
            isDisabled={isDisabled}
            IconComponent={ssoSVG}
            data-test-id="sso-button"
            aria-label={ssoLabel}
            className={styles.ssoButton}
            label={ssoLabel || getProviderLabel("sso", t)}
            onClick={() => (window.location.href = ssoUrl)}
          />
        ) : null}
        {providers.length !== 0 ? (
          <div className={styles.socialButtonsGroup}>
            {elements}
            {length > 2 ? (
              <SocialButton
                IconComponent={VerticalDotsReactSvg}
                onClick={moreAuthOpen}
                className={styles.showMoreButton}
              />
            ) : null}

            <MoreLoginModal
              t={t}
              visible={moreAuthVisible}
              onClose={moreAuthClose}
              providers={providers}
              onSocialLoginClick={onClick}
              ssoLabel={ssoLabel ?? ""}
              ssoUrl={ssoUrl ?? ""}
            />
          </div>
        ) : null}
      </div>
    );
  },
  equal,
);

SocialButtonsGroup.displayName = "SocialButtonsGroup";
