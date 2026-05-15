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

import { DeviceType } from "@docspace/shared/enums";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import styles from "../ClientForm.styled.module.scss";

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
    <div className={styles.styledButtonContainer}>
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
    </div>
  );
};

export default ButtonsBlock;
