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
import { isMobile } from "react-device-detect";

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
import { StyledHeader } from "./WhiteLabel.styled";
import { IHeaderProps } from "./WhiteLabel.types";

export const WhiteLabelHeader = ({
  t,
  showNotAvailable,
  isSettingPaid,
  standalone,
  onUseTextAsLogo,
  isEmpty,
  logoTextWhiteLabel,
  onChangeCompanyName,
}: IHeaderProps) => {
  return (
    <StyledHeader>
      <Text className="subtitle">{t("BrandingSubtitle")}</Text>
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
      <Text className="wl-subtitle settings_unavailable" fontSize="12px">
        {t("WhiteLabelSubtitle")}
      </Text>

      <div className="wl-helper">
        <Text className="wl-helper-label settings_unavailable" as="div">
          {t("WhiteLabelHelper")}
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
          id="fieldContainerCompanyName"
          labelText={t("Common:CompanyName")}
          isVertical
          className="settings_unavailable"
          hasError={isEmpty}
          labelVisible
        >
          <TextInput
            testId="logo-text-input"
            className="company-name input"
            value={logoTextWhiteLabel}
            onChange={onChangeCompanyName}
            isDisabled={!isSettingPaid}
            isReadOnly={!isSettingPaid}
            scale
            isAutoFocussed={!isMobile}
            maxLength={30}
            hasError={isEmpty}
            type={InputType.text}
            size={InputSize.base}
          />
          <Button
            testId="use-as-logo-button"
            id="btnUseAsLogo"
            className="use-as-logo"
            size={ButtonSize.small}
            label={t("UseAsLogoButton")}
            onClick={onUseTextAsLogo}
            isDisabled={!isSettingPaid}
          />
        </FieldContainer>
      </div>
    </StyledHeader>
  );
};
