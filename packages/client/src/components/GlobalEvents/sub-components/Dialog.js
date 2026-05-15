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

import React, { useState, useCallback, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile, isIOS } from "react-device-detect";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { Button } from "@docspace/ui-kit/components/button";
import { ComboBox } from "@docspace/ui-kit/components/combobox";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";

import { removeEmojiCharacters } from "@docspace/shared/utils";

const Dialog = ({
  t,
  title,
  startValue,
  visible,
  folderFormValidation,
  options,
  selectedOption,
  onSelect,
  onChange,
  onSave,
  onCancel,
  onClose,
  isCreateDialog,
  isCreateDisabled,
  extension,
  keepNewFileName,
  setKeepNewFileName,
  withForm,
  errorText,
}) => {
  const [value, setValue] = useState("");

  const [isError, setIsError] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const hasError = Boolean(errorText) || isError;

  // Generate test ID prefix based on dialog title
  const getTestIdPrefix = useCallback(() => {
    if (!title) return "dialog";
    return title.toLowerCase().replace(/\s+/g, "_");
  }, [title]);

  const onCancelAction = useCallback(
    (e) => {
      onCancel && onCancel(e);
    },
    [onCancel],
  );

  const onCloseAction = useCallback(
    (e) => {
      onClose && onClose(e);
    },
    [onClose],
  );

  const onSaveAction = useCallback(
    async (e) => {
      setIsDisabled(true);
      const keepNewFileNamePromise =
        isCreateDialog && isChecked && setKeepNewFileName(isChecked);

      const savePromise = onSave && onSave(e, value);

      await Promise.all([keepNewFileNamePromise, savePromise]);
      setIsDisabled(false);
    },
    [onSave, isCreateDialog, value, isChecked, setKeepNewFileName],
  );

  const onKeyUpHandler = useCallback(
    (e) => {
      if (e.keyCode === 27) onCancelAction(e);

      if (
        e.keyCode === 13 &&
        !withForm &&
        !isError &&
        !isDisabled &&
        !isCreateDisabled
      )
        onSaveAction(e);
    },
    [
      onCancelAction,
      onSaveAction,
      withForm,
      isError,
      isDisabled,
      isCreateDisabled,
    ],
  );

  useEffect(() => {
    keepNewFileName && isCreateDialog && setIsChecked(keepNewFileName);
  }, [isCreateDialog, keepNewFileName]);

  useEffect(() => {
    const input = document?.getElementById("create-text-input");
    if (isMobile && isIOS) return;
    if (input && value === startValue && !isChanged) input.select();
  }, [visible, value, startValue, isChanged]);

  useEffect(() => {
    if (startValue) setValue(startValue);
  }, [startValue]);

  useEffect(() => {
    document.addEventListener("keyup", onKeyUpHandler, false);

    return () => {
      document.removeEventListener("keyup", onKeyUpHandler, false);
    };
  }, [onKeyUpHandler]);

  const onChangeAction = useCallback(
    (e) => {
      let newValue = e.target.value;

      newValue = removeEmojiCharacters(newValue);
      onChange?.(newValue);
      if (newValue.match(folderFormValidation)) {
        setIsError(true);
      } else {
        setIsError(false);
      }

      setValue(newValue);
      setIsChanged(true);
    },
    [folderFormValidation],
  );

  const onFocus = useCallback((e) => {
    e.target.select();
  }, []);

  const onChangeCheckbox = () => {
    isCreateDialog && setIsChecked((val) => !val);
  };

  return (
    <ModalDialog
      withForm={withForm}
      visible={visible}
      displayType="modal"
      scale
      onClose={onCloseAction}
      zIndex={405}
    >
      <ModalDialog.Header>{title}</ModalDialog.Header>
      <ModalDialog.Body>
        <FieldContainer
          hasError={hasError}
          labelVisible={false}
          errorMessageWidth="100%"
          errorMessage={errorText || t("Common:ContainsSpecCharacter")}
          removeMargin
        >
          <TextInput
            id="create-text-input"
            name="create"
            type="search"
            scale
            value={value}
            isAutoFocussed
            hasError={Boolean(errorText)}
            tabIndex={1}
            onChange={onChangeAction}
            onFocus={onFocus}
            isDisabled={isDisabled}
            maxLength={165}
            testId={`${getTestIdPrefix()}_text_input`}
          />
        </FieldContainer>
        {isCreateDialog && extension ? (
          <div
            style={{
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              padding: "16px 0 0",
            }}
          >
            <Checkbox
              className="dont-ask-again"
              label={t("Common:DontAskAgain")}
              isChecked={isChecked}
              onChange={onChangeCheckbox}
              dataTestId={`${getTestIdPrefix()}_dont_ask_again`}
            />
          </div>
        ) : null}

        {options ? (
          <ComboBox
            style={{ marginTop: "16px" }}
            options={options}
            selectedOption={selectedOption}
            onSelect={onSelect}
            dataTestId={`${getTestIdPrefix()}_combobox`}
          />
        ) : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="submit"
          key="GlobalSendBtn"
          label={isCreateDialog ? t("Common:Create") : t("Common:SaveButton")}
          size="normal"
          type="submit"
          scale
          primary
          isLoading={isDisabled}
          isDisabled={isCreateDisabled || isDisabled || isError}
          onClick={onSaveAction}
          testId={`${getTestIdPrefix()}_save_button`}
        />
        <Button
          className="cancel-button"
          key="CloseBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          isDisabled={isDisabled}
          onClick={onCancelAction}
          testId={`${getTestIdPrefix()}_cancel_button`}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ settingsStore, filesSettingsStore }) => {
  const { folderFormValidation } = settingsStore;
  const { keepNewFileName, setKeepNewFileName } = filesSettingsStore;

  return { folderFormValidation, keepNewFileName, setKeepNewFileName };
})(observer(Dialog));
