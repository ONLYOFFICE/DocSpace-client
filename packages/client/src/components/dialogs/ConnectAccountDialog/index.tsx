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

import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import copy from "copy-to-clipboard";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { InputType } from "@docspace/shared/components/text-input";
import { InputBlock } from "@docspace/shared/components/input-block";
import { toastr } from "@docspace/shared/components/toast";
import { globalColors } from "@docspace/shared/themes";

import DialogsStore from "SRC_DIR/store/DialogsStore";

type ConnectAccountDialogProps = {
  connectAccountDialogVisible: DialogsStore["connectAccountDialogVisible"];
  setConnectAccountDialogVisible: DialogsStore["setConnectAccountDialogVisible"];
  getTgLink: TStore["telegramStore"]["getTgLink"];
  botUrl: TStore["telegramStore"]["botUrl"];
};

const ConnectAccountDialog = ({
  connectAccountDialogVisible,
  setConnectAccountDialogVisible,
  getTgLink,
  botUrl,
}: ConnectAccountDialogProps) => {
  const { t } = useTranslation(["Profile", "Common"]);

  useEffect(() => {
    getTgLink();
  }, []);

  const onClickConnect = () => {
    window.open(botUrl, "_blank");
    setConnectAccountDialogVisible(false);
  };

  const onClose = () => {
    setConnectAccountDialogVisible(false);
  };

  return (
    <ModalDialog
      visible={connectAccountDialogVisible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
      isLoading={!botUrl}
    >
      <ModalDialog.Header>{t("Profile:TelegramAccount")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontSize="13px" fontWeight={400} style={{ marginBottom: "16px" }}>
          {t("Profile:TelegramAccountDescription")}
        </Text>
        <InputBlock
          value={botUrl}
          type={InputType.text}
          isAutoFocussed
          isReadOnly
          onFocus={(e) => e.target.select()}
          scale
          iconName={CopyReactSvgUrl}
          iconColor={globalColors.lightGrayDark}
          isIconFill
          onIconClick={() => {
            copy(botUrl);
            toastr.success(t("Common:LinkCopySuccess"));
          }}
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:Connect")}
          size={ButtonSize.normal}
          scale
          primary
          onClick={onClickConnect}
        />
        <Button
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ dialogsStore, telegramStore }: TStore) => {
  const { connectAccountDialogVisible, setConnectAccountDialogVisible } =
    dialogsStore;

  const { getTgLink, botUrl } = telegramStore;

  return {
    connectAccountDialogVisible,
    setConnectAccountDialogVisible,
    getTgLink,
    botUrl,
  };
})(observer(ConnectAccountDialog));
