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

"use client";

import { useTranslation } from "react-i18next";

import PDFIcon from "PUBLIC_DIR/images/icons/24/pdf.svg";
import InfoSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";

import { getFillingStatusTitle, getTitleWithoutExtension } from "../../utils";
import { FILLING_FORM_STATUS_COLORS } from "../../constants";
import { useLocalStorage } from "../../hooks/useLocalStorage";

import { Text } from "../../components/text";
import PublicRoomBar from "../../components/public-room-bar";
import { Heading, HeadingLevel } from "../../components/heading";
import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import { FillingRoleProcess } from "../../components/filling-role-process";
import type { ProcessDetails } from "../../components/filling-role-process/FillingRoleProcess.types";
import { RoleStatus } from "../../enums";
import { Button, ButtonSize } from "../../components/button";

import styles from "./FillingStatusPanel.module.scss";
import type { FillingStatusPanelProps } from "./FillingStatusPanel.types";

export const FillingStatusPanel = ({
  visible,
  onClose,
  file,
  user,
}: FillingStatusPanelProps) => {
  const { t } = useTranslation(["Common"]);
  const [value, setValue] = useLocalStorage(
    `fillingStatusBarPanel-${user.id}`,
    true,
  );

  const fileName = getTitleWithoutExtension(file, false);
  const fillingStatus = file.formFillingStatus!;

  const color = FILLING_FORM_STATUS_COLORS[fillingStatus];
  const fileStatusText = getFillingStatusTitle(fillingStatus, t);

  const processDetails: ProcessDetails[] = [
    {
      id: "1",
      user: { ...user, id: "1", userName: "User #1" },
      processStatus: RoleStatus.Filled,
      roleName: "Role #1",
      histories: [
        {
          id: "1",
          action: "Opened the form to fill out",
          date: new Date().toISOString(),
        },
        {
          id: "2",
          action: "Submitted their part. The form was sent to the next role.",
          date: new Date().toISOString(),
        },
      ],
    },
    {
      id: "2",
      user,
      processStatus: RoleStatus.YourTurn,
      roleName: "Role #2",
      histories: [],
    },
    {
      id: "3",
      user: { ...user, id: "3", userName: "User #3" },
      processStatus: RoleStatus.Waiting,
      roleName: "Role #3",
      histories: [],
    },
  ];

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withBodyScroll
    >
      <ModalDialog.Header>{t("Common:FillingStatus")}</ModalDialog.Header>
      <ModalDialog.Body>
        {value ? (
          <PublicRoomBar
            headerText={t("Common:FillingStatusBarTitle")}
            bodyText={t("Common:FillingStatusBarDescription")}
            iconName={InfoSvgUrl}
            onClose={() => setValue(false)}
          />
        ) : null}
        <div className={styles.fileInfo}>
          <PDFIcon />
          <Text className={styles.fileName}>{fileName}</Text>
          <div className={styles.fileStatus} style={{ backgroundColor: color }}>
            <span>{fileStatusText}</span>
          </div>
        </div>
        <div className={styles.processContainer}>
          <Heading
            fontSize="14px"
            className={styles.processTitle}
            level={HeadingLevel.h5}
          >
            {t("Common:ProcessDetails")}
          </Heading>
          <FillingRoleProcess
            fileStatus={fillingStatus}
            processDetails={processDetails}
            currentUserId={user.id}
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="shared_move-to-archived-modal_submit"
          key="OkButton"
          label={t("Common:OKButton")}
          size={ButtonSize.normal}
          primary
          scale
        />
        <Button
          id="shared_move-to-archived-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
