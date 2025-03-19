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

import React, { FC } from "react";
import { useTranslation } from "react-i18next";

import FormRoomSvg from "PUBLIC_DIR/images/icons/32/room/form.svg";
import VirtualDataRoomRoomSvg from "PUBLIC_DIR/images/icons/32/room/virtual-data.svg";
import ArrowIcon from "PUBLIC_DIR/images/arrow-left.react.svg";

import { Text } from "../../components/text";
import { Button, ButtonSize } from "../../components/button";
import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";

import styles from "./ShareFormDialog.module.scss";
import { ShareFormDialogProps } from "./ShareFormDialog.types";

const ShareFormDialog: FC<ShareFormDialogProps> = ({
  onClickFormRoom,
  onClickVirtualDataRoom,
  visible,
  onClose,
  container,
  visibleContainer,
}) => {
  const { t } = useTranslation("Common");

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.aside}
      onClose={onClose}
      containerVisible={visibleContainer}
    >
      <ModalDialog.Container>{container}</ModalDialog.Container>
      <ModalDialog.Header>{t("Common:ShareToFillOut")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FormRoomSvg />
              <Text as="h5" fontSize="14px" lineHeight="16px" isBold>
                {t("Common:InFormFillingRoomTitle")}
              </Text>
            </div>
            <Text fontSize="12px" lineHeight="16px">
              {t("Common:InFormFillingRoomDescription")}
            </Text>
            <Button
              scale
              isClicked
              className={styles.button}
              onClick={onClickFormRoom}
              label={t("Common:ShareInTheRoom")}
              icon={<ArrowIcon />}
              size={ButtonSize.normal}
            />
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <VirtualDataRoomRoomSvg />
              <Text as="h5" fontSize="14px" lineHeight="16px" isBold>
                {t("Common:InVirtualDataRoomTitle")}
              </Text>
            </div>
            <Text fontSize="12px" lineHeight="16px">
              {t("Common:InVirtualDataRoomDescription")}
            </Text>
            <Button
              scale
              isClicked
              className={styles.button}
              onClick={onClickVirtualDataRoom}
              label={t("Common:ShareInTheRoom")}
              icon={<ArrowIcon />}
              size={ButtonSize.normal}
            />
          </div>
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default ShareFormDialog;
