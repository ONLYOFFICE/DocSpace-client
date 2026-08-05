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

const getTitle = (
  type: CreateFileDialogType,
  t: (key: string) => string,
): string => {
  switch (type) {
    case "docx":
      return t("Common:Document");
    case "xlsx":
      return t("Common:Spreadsheet");
    case "pptx":
      return t("Common:Presentation");
    case "pdf":
      return t("Common:NewPDFForm");
    case "folder":
      return t("Common:Folder");
  }
};

const ENTITY_TYPES: Record<CreateFileDialogType, string> = {
  docx: "document",
  xlsx: "spreadsheet",
  pptx: "presentation",
  pdf: "pdf-form",
  folder: "folder",
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

  const title = getTitle(type, t);

  return (
    <ModalDialog visible={visible} onClose={onClose} autoMaxHeight withForm>
      <ModalDialog.Header>{title}</ModalDialog.Header>
      <ModalDialog.Body>
        <TextInput
          forwardedRef={inputRef}
          type={InputType.text}
          name="file_name"
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
          id={`shared_create-${ENTITY_TYPES[type]}-modal_submit`}
          label={t("Common:Create")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onSubmit}
          isLoading={isCreating}
          isDisabled={hasError}
        />
        <Button
          id={`shared_create-${ENTITY_TYPES[type]}-modal_cancel`}
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
