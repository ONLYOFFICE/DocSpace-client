// (c) Copyright Ascensio System SIA 2009-2024
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

import { Text } from "../../../components/text";
import { Badge } from "../../../components/badge";
import { HelpButton } from "../../../components/help-button";
import { FieldContainer } from "../../../components/field-container";
import {
  TextInput,
  InputType,
  InputSize,
} from "../../../components/text-input";
import { Button, ButtonSize } from "../../../components/button";

import { NotAvailable } from "./NotAvailable";
import {
  StyledHeader,
  StyledWhiteLabelInput,
  StyledCrossIcon,
} from "./WhiteLabel.styled";
import { IHeaderProps } from "./WhiteLabel.types";

export const WhiteLabelHeader = ({
  t,
  showNotAvailable,
  isSettingPaid,
  standalone,
  onUseTextAsLogo,
  isEmpty,
  logoTextWhiteLabel,
  onChange,
  onClear,
}: IHeaderProps) => {
  return (
    <StyledHeader>
      {showNotAvailable ? <NotAvailable t={t} /> : null}
      <div className="header-container">
        <Text fontSize="16px" fontWeight="700">
          {t("WhiteLabel")}
        </Text>

        {!isSettingPaid && !standalone ? (
          <Badge
            className="paid-badge"
            fontWeight="700"
            label={t("Common:Paid")}
            isPaidBadge
          />
        ) : null}
      </div>

      <div className="wl-helper">
        <Text
          className="wl-subtitle wl-helper-label settings_unavailable"
          fontSize="13px"
        >
          {t("WhiteLabelSubtitle")}
          <HelpButton
            tooltipContent={
              <Text fontSize="12px">{t("WhiteLabelTooltip")}</Text>
            }
            place="right"
            offsetRight={0}
            className="settings_unavailable"
          />
        </Text>
      </div>

      <div className="settings-block">
        <FieldContainer
          id="fieldContainerGenerateLogo"
          labelText={t("GenerateLogoLabel")}
          isVertical
          className="settings_unavailable field-container"
          labelVisible
        >
          <StyledWhiteLabelInput isShowCross={!!logoTextWhiteLabel}>
            <TextInput
              testId="logo-text-input"
              className="logo-text input"
              placeholder={t("YourLogo")}
              value={logoTextWhiteLabel}
              onChange={onChange}
              isDisabled={!isSettingPaid}
              isReadOnly={!isSettingPaid}
              scale
              maxLength={10}
              type={InputType.text}
              size={InputSize.base}
              withBorder={false}
            />

            <div className="append" onClick={onClear}>
              <StyledCrossIcon />
            </div>
          </StyledWhiteLabelInput>
          <Button
            testId="generate-logo-button"
            id="btnGenerateLogo"
            className="generate-logo"
            size={ButtonSize.small}
            label={t("GenerateLogoButton")}
            onClick={onUseTextAsLogo}
            isDisabled={!isSettingPaid || isEmpty}
          />
        </FieldContainer>
      </div>
    </StyledHeader>
  );
};
