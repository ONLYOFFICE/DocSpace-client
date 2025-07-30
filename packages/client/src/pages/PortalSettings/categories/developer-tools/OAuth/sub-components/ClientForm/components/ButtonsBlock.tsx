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

import { DeviceType } from "@docspace/shared/enums";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import { StyledButtonContainer } from "../ClientForm.styled";

interface ButtonsBlockProps {
  saveLabel: string;
  cancelLabel: string;

  isRequestRunning: boolean;

  saveButtonDisabled: boolean;
  cancelButtonDisabled: boolean;

  onSaveClick: () => void;
  onCancelClick: () => void;

  currentDeviceType: string;
}

const ButtonsBlock = ({
  saveLabel,
  cancelLabel,
  isRequestRunning,
  saveButtonDisabled,
  cancelButtonDisabled,
  onSaveClick,
  onCancelClick,
  currentDeviceType,
}: ButtonsBlockProps) => {
  const isDesktop = currentDeviceType === DeviceType.desktop;

  const buttonSize = isDesktop ? ButtonSize.small : ButtonSize.normal;
  return (
    <StyledButtonContainer>
      <Button
        label={saveLabel}
        isLoading={isRequestRunning}
        isDisabled={saveButtonDisabled}
        primary
        size={buttonSize}
        scale={!isDesktop}
        onClick={onSaveClick}
        testId="oauth_save_button"
      />

      <Button
        label={cancelLabel}
        isDisabled={cancelButtonDisabled}
        size={buttonSize}
        scale={!isDesktop}
        onClick={onCancelClick}
        testId="oauth_cancel_button"
      />
    </StyledButtonContainer>
  );
};

export default ButtonsBlock;
