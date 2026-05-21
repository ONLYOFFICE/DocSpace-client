/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
