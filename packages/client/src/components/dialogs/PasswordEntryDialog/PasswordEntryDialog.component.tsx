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
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";

import PublicRoomIcon from "PUBLIC_DIR/images/icons/32/room/public.svg";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { ValidationStatus } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { InputSize } from "@docspace/shared/components/text-input";
import { validatePublicRoomPassword } from "@docspace/shared/api/rooms";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { FieldContainer } from "@docspace/shared/components/field-container";

import {
  ModalContentContainer,
  RoomIconWrapper,
  RoomTitle,
} from "./PasswordEntryDialog.styled";
import type { PasswordEntryDialogProps } from "./PasswordEntryDialog.types";

const PasswordEntryDialog = ({
  onClose,
  openItemAction,
  item,
  isDownload,
  onClickDownload,
}: PasswordEntryDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController>(undefined);

  const { t } = useTranslation(["UploadPanel", "Common"]);

  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  });

  const handleClose = () => {
    onClose();
    abortControllerRef.current?.abort();
  };

  const handleSubmit = async () => {
    if (!item.requestToken) return;

    if (password.trim().length === 0) {
      return setErrorMessage(t("Common:RequiredField"));
    }

    setIsLoading(true);
    try {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const response = await validatePublicRoomPassword(
        item.requestToken,
        password,
        abortControllerRef.current.signal,
      );

      switch (response?.status) {
        case ValidationStatus.Ok: {
          if (isDownload) {
            onClickDownload(item, t);
          } else {
            openItemAction(item, t);
          }

          onClose();
          break;
        }

        case ValidationStatus.InvalidPassword: {
          setErrorMessage(t("Common:IncorrectPassword"));
          break;
        }
        default: {
          break;
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) return;

      toastr.error(error as Error);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const title = item.title;

  return (
    <ModalDialog
      visible
      withForm
      autoMaxHeight
      onClose={handleClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("Common:EnterPassword")}</ModalDialog.Header>
      <ModalDialog.Body>
        <ModalContentContainer>
          <span>{t("Common:NeedPassword")}:</span>
          <RoomIconWrapper>
            <PublicRoomIcon />
            <RoomTitle>{title}</RoomTitle>
          </RoomIconWrapper>
          <FieldContainer
            isVertical
            labelVisible={false}
            hasError={!!errorMessage}
            errorMessage={errorMessage}
            className="password-field"
          >
            <PasswordInput
              scale
              simpleView
              tabIndex={0}
              id="password"
              isAutoFocussed
              isDisableTooltip
              inputName="password"
              inputValue={password}
              size={InputSize.middle}
              isDisabled={isLoading}
              forwardedRef={inputRef}
              hasError={!!errorMessage}
              onChange={onChangePassword}
              autoComplete="current-password"
              placeholder={t("Common:Password")}
            />
          </FieldContainer>
        </ModalContentContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          scale
          primary
          tabIndex={0}
          type="submit"
          isLoading={isLoading}
          size={ButtonSize.normal}
          onClick={handleSubmit}
          label={t("Common:ContinueButton")}
        />
        <Button
          scale
          tabIndex={0}
          onClick={handleClose}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default PasswordEntryDialog;
