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

import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

import { Nullable } from "types";
import { SaveCancelButtons } from "../../../components/save-cancel-buttons";
import { Text } from "../../../components/text";
import { Badge } from "../../../components/badge";
import { FieldContainer } from "../../../components/field-container";
import {
  TextInput,
  InputType,
  InputSize,
} from "../../../components/text-input";

import { StyledBrandName } from "./BrandName.styled";
import { IBrandNameProps } from "./BreandName.types";
import { NotAvailable } from "./NotAvailable";
import { IWhiteLabelData } from "../WhiteLabel/WhiteLabel.types";
import { useResponsiveNavigation } from "../../../hooks/useResponsiveNavigation";
import { brandingRedirectUrl } from "../constants";

export const BrandName = ({
  t,
  showNotAvailable,
  isSettingPaid,
  standalone,
  onSave,
  isBrandNameLoaded,
  defaultBrandName,
  brandName,
  deviceType,
}: IBrandNameProps) => {
  useResponsiveNavigation({
    redirectUrl: brandingRedirectUrl,
    currentLocation: "brand-name",
    deviceType,
  });

  const [brandNameWhiteLabel, setBrandNameWhiteLabel] =
    useState<Nullable<string>>(null);

  useEffect(() => {
    if (!isBrandNameLoaded || !brandName) return;
    setBrandNameWhiteLabel(brandName);
  }, [brandName, isBrandNameLoaded]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setBrandNameWhiteLabel(value);
  };

  const onSaveAction = (): void => {
    const data: IWhiteLabelData = {
      logoText: brandNameWhiteLabel ?? "",
      logo: [],
    };
    onSave(data);
  };

  const onCancelAction = (): void => {
    setBrandNameWhiteLabel(defaultBrandName);
  };

  const isEqualText = defaultBrandName === (brandNameWhiteLabel ?? "");
  const showReminder = !isEqualText && brandNameWhiteLabel !== null;

  return (
    <StyledBrandName>
      {showNotAvailable ? <NotAvailable t={t} /> : null}

      <div className="header-container">
        <Text fontSize="16px" fontWeight="700">
          {t("BrandName")}
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

      <Text className="wl-subtitle settings_unavailable" fontSize="13px">
        {t("BrandNameSubtitle", { productName: t("Common:ProductName") })}
      </Text>

      <div className="settings-block">
        <FieldContainer
          id="fieldContainerBrandName"
          isVertical
          className="settings_unavailable"
        >
          <TextInput
            testId="logo-text-input"
            className="brand-name input"
            value={brandNameWhiteLabel ?? ""}
            onChange={onChange}
            isDisabled={!isSettingPaid}
            isReadOnly={!isSettingPaid}
            scale
            isAutoFocussed={!isMobile}
            maxLength={40}
            type={InputType.text}
            size={InputSize.base}
          />
          <SaveCancelButtons
            id="btnBrandName"
            className="brand-name-buttons"
            onSaveClick={onSaveAction}
            onCancelClick={onCancelAction}
            saveButtonLabel={t("Common:SaveButton")}
            cancelButtonLabel={t("Common:CancelButton")}
            reminderText={t("YouHaveUnsavedChanges")}
            displaySettings
            saveButtonDisabled={isEqualText}
            disableRestoreToDefault={isEqualText}
            showReminder={showReminder}
          />
        </FieldContainer>
      </div>
    </StyledBrandName>
  );
};
