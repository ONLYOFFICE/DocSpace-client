// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  TextInput,
  InputSize,
  InputType,
} from "@docspace/ui-kit/components/text-input";

export type CreateFileDialogType = "docx" | "xlsx" | "pptx" | "pdf" | "folder";

type CreateFileDialogProps = {
  visible: boolean;
  type: CreateFileDialogType;
  isCreating: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
};

const TITLE_KEYS: Record<CreateFileDialogType, string> = {
  docx: "Common:Document",
  xlsx: "Common:Spreadsheet",
  pptx: "Common:Presentation",
  pdf: "Common:NewPDFForm",
  folder: "Common:Folder",
};

const DEFAULT_NAMES: Record<CreateFileDialogType, string> = {
  docx: "New document",
  xlsx: "New spreadsheet",
  pptx: "New presentation",
  pdf: "New form",
  folder: "New folder",
};

const CreateFileDialog = ({
  visible,
  type,
  isCreating,
  onClose,
  onSave,
}: CreateFileDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const [name, setName] = React.useState(DEFAULT_NAMES[type]);
  const [hasError, setHasError] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (visible) {
      setName(DEFAULT_NAMES[type]);
      setHasError(false);
    }
  }, [visible, type]);

  React.useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.select();
    }
  }, [visible]);

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setName(value);
      setHasError(value.trim().length === 0);
    },
    [],
  );

  const onSubmit = React.useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      setHasError(true);
      return;
    }
    onSave(trimmed);
  }, [name, onSave]);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit],
  );

  const title = t(TITLE_KEYS[type]);

  return (
    <ModalDialog visible={visible} onClose={onClose} autoMaxHeight withForm>
      <ModalDialog.Header>{title}</ModalDialog.Header>
      <ModalDialog.Body>
        <TextInput
          forwardedRef={inputRef}
          type={InputType.text}
          scale
          value={name}
          hasError={hasError}
          maxLength={165}
          size={InputSize.base}
          onChange={onChange}
          onKeyDown={onKeyDown}
          isAutoFocussed
          isDisabled={isCreating}
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:Create")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onSubmit}
          isLoading={isCreating}
          isDisabled={hasError}
        />
        <Button
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isDisabled={isCreating}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default CreateFileDialog;
