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

import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { mobile } from "@docspace/shared/utils/device";

import styled from "styled-components";
import { MigrationButtonsProps } from "../types";

const MigrationButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  margin-bottom: 16px;

  @media ${mobile} {
    margin-bottom: 0;

    width: 100%;

    position: fixed;
    inset-inline: 0px;
    bottom: 0px;

    padding-top: 18px;

    background: ${(props) => props.theme.backgroundColor};

    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 0;
  }

  .migration-buttons {
    width: fit-content;
    font-family: Open Sans;
    font-size: 13px;
    font-weight: 600;
    line-height: 15px;
    text-align: left;

    @media ${mobile} {
      width: 100%;
      position: relative;
      padding: 0;
    }
  }
`;

const CancelMigrationButton = styled.span`
  font-family: Open Sans;
  font-size: 13px;
  font-weight: 600;
  line-height: 15px;

  cursor: pointer;

  text-decoration-line: underline;
  text-decoration-style: dashed;
  text-underline-offset: 0.1em;

  @media ${mobile} {
    padding: 0 16px;
  }
`;

export const MigrationButtons = ({
  id,
  className,
  reminderText,
  saveButtonLabel = "Save",
  cancelButtonLabel = "Cancel",
  onCancelClick,
  onSaveClick,
  showReminder,
  displaySettings,
  disableRestoreToDefault,
  hasScroll,
  isSaving,
  cancelEnable,
  tabIndex,
  hideBorder,
  additionalClassSaveButton,
  additionalClassCancelButton,
  saveButtonDisabled,
  getTopComponent,
  migrationCancelLabel,
  onMigrationCancelClick,
}: MigrationButtonsProps) => {
  return (
    <MigrationButtonsWrapper>
      <SaveCancelButtons
        id={id}
        className={`migration-buttons ${className}`}
        reminderText={reminderText}
        saveButtonLabel={saveButtonLabel}
        cancelButtonLabel={cancelButtonLabel}
        onCancelClick={onCancelClick}
        onSaveClick={onSaveClick}
        showReminder={showReminder}
        displaySettings={displaySettings}
        disableRestoreToDefault={disableRestoreToDefault}
        hasScroll={hasScroll}
        isSaving={isSaving}
        cancelEnable={cancelEnable}
        tabIndex={tabIndex}
        hideBorder={hideBorder}
        additionalClassSaveButton={additionalClassSaveButton}
        additionalClassCancelButton={additionalClassCancelButton}
        saveButtonDisabled={saveButtonDisabled}
        getTopComponent={getTopComponent}
        saveButtonDataTestId="next_step_button"
        cancelButtonDataTestId="previos_step_button"
      />
      <CancelMigrationButton
        data-testid="cancel_import_button"
        onClick={onMigrationCancelClick}
      >
        {migrationCancelLabel}
      </CancelMigrationButton>
    </MigrationButtonsWrapper>
  );
};
