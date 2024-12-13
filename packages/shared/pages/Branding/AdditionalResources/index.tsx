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

import React, { useState, useEffect } from "react";

import { Checkbox } from "../../../components/checkbox";
import { SaveCancelButtons } from "../../../components/save-cancel-buttons";

import { StyledAdditionalResources } from "./AdditionalResources.styled";
import { IAdditionalResources } from "./AdditionalResources.types";

export const AdditionalResources = ({
  t,
  isSettingPaid,
  feedbackAndSupportEnabled,
  helpCenterEnabled,
  onSave,
  onRestore,
  isLoading,
  additionalResourcesIsDefault,
}: IAdditionalResources) => {
  const [feedbackEnabled, setFeedbackEnabled] = useState(
    feedbackAndSupportEnabled,
  );
  const [helpEnabled, setHelpEnabled] = useState(helpCenterEnabled);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (
      feedbackAndSupportEnabled === feedbackEnabled &&
      helpCenterEnabled === helpEnabled
    ) {
      setHasChanges(false);
    } else {
      setHasChanges(true);
    }
  }, [
    feedbackEnabled,
    helpEnabled,
    feedbackAndSupportEnabled,
    helpCenterEnabled,
  ]);

  useEffect(() => {
    setFeedbackEnabled(feedbackAndSupportEnabled);
    setHelpEnabled(helpCenterEnabled);
  }, [feedbackAndSupportEnabled, helpCenterEnabled]);

  const onSaveAction = () => {
    onSave(feedbackEnabled, helpEnabled);
  };

  return (
    <StyledAdditionalResources>
      <div className="header">
        <div className="additional-header settings_unavailable">
          {t("Settings:AdditionalResources")}
        </div>
      </div>
      <div className="settings_unavailable additional-description">
        {t("Settings:AdditionalResourcesDescription", {
          productName: t("Common:ProductName"),
        })}
      </div>
      <div className="branding-checkbox">
        <Checkbox
          className="show-feedback-support checkbox"
          isDisabled={!isSettingPaid}
          label={t("ShowFeedbackAndSupport")}
          isChecked={feedbackEnabled}
          onChange={() => setFeedbackEnabled(!feedbackEnabled)}
        />

        <Checkbox
          className="show-help-center checkbox"
          isDisabled={!isSettingPaid}
          label={t("ShowHelpCenter")}
          isChecked={helpEnabled}
          onChange={() => setHelpEnabled(!helpEnabled)}
        />
      </div>
      <SaveCancelButtons
        onSaveClick={onSaveAction}
        onCancelClick={onRestore}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:Restore")}
        displaySettings
        reminderText={t("YouHaveUnsavedChanges")}
        showReminder={(isSettingPaid && hasChanges) || isLoading}
        disableRestoreToDefault={additionalResourcesIsDefault || isLoading}
        additionalClassSaveButton="additional-resources-save"
        additionalClassCancelButton="additional-resources-cancel"
      />
    </StyledAdditionalResources>
  );
};
