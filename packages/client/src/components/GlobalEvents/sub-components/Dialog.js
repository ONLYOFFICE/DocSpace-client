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

import { useEffect, useCallback, useState } from "react";
import { inject, observer } from "mobx-react";
import { isMobile, isIOS } from "react-device-detect";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { TextInput } from "@docspace/shared/components/text-input";
import { Button } from "@docspace/shared/components/button";
import { ComboBox } from "@docspace/shared/components/combobox";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { zIndex } from "@docspace/shared/themes";

import { removeEmojiCharacters } from "SRC_DIR/helpers/utils";

const Dialog = ({
  t,
  title,
  startValue,
  visible,
  folderFormValidation,
  options,
  selectedOption,
  onSelect,
  onSave,
  onCancel,
  onClose,
  isCreateDialog,
  extension,
  keepNewFileName,
  setKeepNewFileName,
  withForm,
}) => {
  const [value, setValue] = useState("");

  const [isError, setIsError] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

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
    (e) => {
      setIsDisabled(true);
      isCreateDialog && isChecked && setKeepNewFileName(isChecked);
      onSave && onSave(e, value);
    },
    [onSave, isCreateDialog, value, isChecked, setKeepNewFileName],
  );

  const onKeyUpHandler = useCallback(
    (e) => {
      if (e.keyCode === 27) onCancelAction(e);

      if (e.keyCode === 13 && !withForm && !isError) onSaveAction(e);
    },
    [onCancelAction, onSaveAction, withForm, isError],
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

  const onChange = useCallback(
    (e) => {
      let newValue = e.target.value;

      newValue = removeEmojiCharacters(newValue);
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
      zIndex={zIndex.modal}
    >
      <ModalDialog.Header>{title}</ModalDialog.Header>
      <ModalDialog.Body>
        <FieldContainer
          hasError={isError}
          labelVisible={false}
          errorMessageWidth="100%"
          errorMessage={t("Common:ContainsSpecCharacter")}
          removeMargin
        >
          <TextInput
            id="create-text-input"
            name="create"
            type="search"
            scale
            value={value}
            isAutoFocussed
            tabIndex={1}
            onChange={onChange}
            onFocus={onFocus}
            isDisabled={isDisabled}
            maxLength={165}
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
            />
          </div>
        ) : null}

        {options ? (
          <ComboBox
            style={{ marginTop: "16px" }}
            options={options}
            selectedOption={selectedOption}
            onSelect={onSelect}
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
          isDisabled={isDisabled || isError}
          onClick={onSaveAction}
        />
        <Button
          className="cancel-button"
          key="CloseBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          isDisabled={isDisabled}
          onClick={onCancelAction}
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
