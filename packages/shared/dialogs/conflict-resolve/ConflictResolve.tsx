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

import React, { useState } from "react";

import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import { RadioButtonGroup } from "../../components/radio-button-group";
import { Button, ButtonSize } from "../../components/button";
import { Text } from "../../components/text";
import { ConflictResolveType } from "../../enums";

import { ConflictResolveProps } from "./ConflictResolve.types";

import styles from "./ConflictResolve.module.scss";

const ConflictResolve = (props: ConflictResolveProps) => {
  const {
    isLoading,
    visible,
    onClose,
    onSubmit,
    messageText,
    selectActionText,
    submitButtonLabel,
    cancelButtonLabel,
    overwriteDescription,
    overwriteTitle,
    duplicateDescription,
    duplicateTitle,
    skipDescription,
    skipTitle,
    headerLabel,
  } = props;

  const [resolveType, setResolveType] = useState<ConflictResolveType>(
    ConflictResolveType.Overwrite,
  );

  const onSelectResolveType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;

    const type = Number(target.value) as ConflictResolveType;
    setResolveType(type);
  };

  const onSubmitAction = () => {
    onSubmit(resolveType);
  };

  const radioOptions = [
    {
      label: (
        <div>
          <Text className="radio-option-title">{overwriteTitle}</Text>
          <Text className="radio-option-description">
            {overwriteDescription}
          </Text>
        </div>
      ),
      value: ConflictResolveType.Overwrite as unknown as string,
      autoFocus: true,
    },
    {
      label: (
        <div>
          <Text className="radio-option-title">{duplicateTitle}</Text>
          <Text className="radio-option-description">
            {duplicateDescription}
          </Text>
        </div>
      ),

      value: ConflictResolveType.Duplicate as unknown as string,
    },
    {
      label: (
        <div>
          <Text className="radio-option-title">{skipTitle}</Text>
          <Text className="radio-option-description">{skipDescription}</Text>
        </div>
      ),
      value: ConflictResolveType.Skip as unknown as string,
    },
  ];

  return (
    <ModalDialog
      withForm
      isLarge
      zIndex={312}
      onClose={onClose}
      visible={visible}
      isLoading={isLoading}
      displayType={ModalDialogType.modal}
      data-test-id="conflict-resolve-dialog"
      aria-labelledby="conflict-resolve-header"
    >
      <ModalDialog.Header data-test-id="conflict-resolve-header">
        {headerLabel}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div
          className={styles.conflictResolveBodyContent}
          data-test-id="conflict-resolve-body"
        >
          <Text
            truncate
            className={styles.conflictResolveFileName}
            data-test-id="conflict-resolve-filename"
          >
            {messageText}
          </Text>
          <Text
            className={styles.selectAction}
            data-test-id="conflict-resolve-select-action"
          >
            {selectActionText}
          </Text>
          <RadioButtonGroup
            className={styles.conflictResolveRadioButton}
            orientation="vertical"
            fontSize="13px"
            fontWeight={400}
            name="group"
            onClick={onSelectResolveType}
            options={radioOptions}
            selected={resolveType as unknown as string}
            data-test-id="conflict-resolve-options"
            aria-label="Conflict resolution options"
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer data-test-id="conflict-resolve-footer">
        <Button
          key="OKButton"
          label={submitButtonLabel}
          size={ButtonSize.normal}
          primary
          type="submit"
          onClick={onSubmitAction}
          data-test-id="conflict-resolve-submit-button"
          aria-label={submitButtonLabel}
        />
        <Button
          key="CancelButton"
          label={cancelButtonLabel}
          size={ButtonSize.normal}
          onClick={onClose}
          data-test-id="conflict-resolve-cancel-button"
          aria-label={cancelButtonLabel}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default ConflictResolve;
