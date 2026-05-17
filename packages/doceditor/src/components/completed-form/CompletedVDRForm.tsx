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

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import classNames from "classnames";

import PDFIcon from "PUBLIC_DIR/images/icons/32/pdf.svg";
import EyeIcon from "PUBLIC_DIR/images/eye.react.svg";
import FormFillIcon from "PUBLIC_DIR/images/form.fill.rect.svg";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { getBgPattern, getLogoUrl } from "@docspace/shared/utils/common";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import {
  FileFillingFormStatus,
  FileStatus,
  WhiteLabelLogoType,
} from "@docspace/shared/enums";
import {
  getTitleWithoutExtension,
  mobile,
  mobileMore,
} from "@docspace/shared/utils";
import { Heading, HeadingLevel } from "@docspace/ui-kit/components/heading";
import { Text } from "@docspace/ui-kit/components/text";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { InputBlock } from "@docspace/ui-kit/components/input-block";
import { InputSize, InputType } from "@docspace/ui-kit/components/text-input";
import {
  RoleStep,
  StatusIndicator,
} from "@docspace/shared/components/filling-role-process";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { toastr } from "@docspace/ui-kit/components/toast";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/ui-kit/utils/socket";
import type { TFile } from "@docspace/shared/api/files/types";
import type { TEditFileData } from "@docspace/ui-kit/utils/socket";
import { getFolderUrl } from "./CompletedForm.helper";
import type { CompletedVDRFormProps } from "./CompletedForm.types";
import styles from "./completed-form.module.scss";

export const CompletedVDRForm = (props: CompletedVDRFormProps) => {
  const { user, file, roomId, isStartFilling, formFillingStatus, settings } =
    props;

  const { t } = useTranslation(["CompletedForm", "Common"]);
  const [form, setForm] = useState<TFile>(file);

  const isInitSocket = useRef(false);

  const { isBase, currentColorScheme } = useTheme();

  const bgPattern = getBgPattern(currentColorScheme?.id);
  const logoUrl = getLogoUrl(WhiteLabelLogoType.LoginPage, !isBase);
  const smallLogoUrl = getLogoUrl(WhiteLabelLogoType.LightSmall, !isBase);

  const isYournTurn = form.formFillingStatus === FileFillingFormStatus.YourTurn;
  const completed = form.formFillingStatus === FileFillingFormStatus.Completed;
  const isTurnToFill = isYournTurn && isStartFilling;

  const fileURL = form.shortWebUrl;

  const socketUrl = settings.socketUrl;
  const formId = form.id;

  useEffect(() => {
    if (!isInitSocket.current) {
      SocketHelper?.connect(socketUrl, "");
    }

    const fileSocketPart = `FILE-${formId}`;

    if (!SocketHelper?.socketSubscribers.has(fileSocketPart))
      SocketHelper?.emit(SocketCommands.Subscribe, {
        roomParts: [fileSocketPart],
        individual: true,
      });

    const stopEditFileHandler = (data: TEditFileData) => {
      const fileId = typeof data === "object" ? data.fileId : data;
      if (Number(fileId) === formId) {
        setForm((prev) => ({
          ...prev,
          fileStatus: prev.fileStatus & ~FileStatus.IsEditing,
        }));
      }
    };

    SocketHelper?.on(SocketEvents.StopEditFile, stopEditFileHandler);

    isInitSocket.current = true;
    return () => {
      SocketHelper?.off(SocketEvents.StopEditFile, stopEditFileHandler);
    };
  }, [socketUrl, formId]);

  const label = useMemo(() => {
    if (isStartFilling) return t("CompletedForm:LinkToFillOutForm");

    if (completed) return t("CompletedForm:LinkToViewOnlyForm");

    return t("CompletedForm:LinkToForm");
  }, [t, isStartFilling, completed]);

  const header = useMemo(() => {
    if (isStartFilling) {
      return t("CompletedForm:FormVDRConfirmationOfStartTitle");
    }

    if (completed) return t("CompletedForm:FormFinalized");

    return t("CompletedForm:FormSectionCompleted");
  }, [t, isStartFilling, completed]);

  const headerDescription = useMemo(() => {
    if (isStartFilling) {
      return isYournTurn
        ? t("CompletedForm:FormVDRYouFirstRecepientDescription")
        : t("CompletedForm:FormVDRNextRecepientDescription");
    }

    if (completed) return t("CompletedForm:FormVDRFinalizedDescription");

    return t("CompletedForm:FormVDRSectionCompletedDescription");
  }, [t, isStartFilling, completed, isYournTurn]);

  const title = useMemo(() => getTitleWithoutExtension(form, false), [form]);

  const handleBackToRoom = () => {
    const folderURL = getFolderUrl(roomId, false);
    window.location.assign(folderURL);
  };

  const handleFillForm = () => {
    window.location.assign(fileURL);
  };

  const handleViewForm = () => {
    window.location.assign(fileURL);
  };

  const copyLinkFile = async () => {
    await copyShareLink(fileURL);
    toastr.success(t("Common:LinkCopySuccess"));
  };

  const handleClickFile = () => {
    if (isYournTurn) handleFillForm();
    else handleViewForm();
  };

  const isEditing = form.fileStatus === FileStatus.IsEditing;

  const bgBlockStyle = {
    "--bg-pattern": bgPattern,
  } as React.CSSProperties;

  return (
    <section
      className={styles.container}
      style={bgBlockStyle}
      data-testid="completed_form_vdr_container"
    >
      <Scrollbar fixedSize>
        <div
          className={classNames(
            styles.completedFormLayout,
            "completed-form__vdr-layout",
          )}
        >
          <header className={styles.header}>
            <picture className="completed-form__logo">
              <source media={mobile} srcSet={smallLogoUrl} />
              <source media={mobileMore} srcSet={logoUrl} />
              <img src={logoUrl} alt="logo" />
            </picture>
            <section
              className={classNames(
                styles.textWrapper,
                "completed-form__text-wrapper",
              )}
            >
              <Heading level={HeadingLevel.h1}>{header}</Heading>
              <Text>{headerDescription}</Text>
            </section>
          </header>
          <main className={styles.vdrMainContent}>
            <div
              className={classNames(
                styles.completedFormBox,
                "completed-form__file",
              )}
              onClick={handleClickFile}
              data-testid="completed_form_file_container"
            >
              <PDFIcon />
              <h5 className="completed-form__file-name">{title}</h5>
              {isYournTurn ? (
                <FormFillIcon className="completed-form_icon" />
              ) : (
                <EyeIcon className="completed-form_icon" />
              )}
            </div>
            <label htmlFor="form-link" className="completed-form__form-link">
              {label}
              <InputBlock
                id="form-link"
                isReadOnly
                size={InputSize.middle}
                type={InputType.text}
                value={fileURL}
                className="input__copy-link"
                iconButtonClassName="input__copy-link-icon"
                iconName={CopyReactSvgUrl}
                onIconClick={copyLinkFile}
                dataTestId="copy_link_input_block"
              />
            </label>
            <div
              className={classNames(
                styles.completedFormBox,
                "completed-form__roles",
              )}
            >
              {formFillingStatus.map(
                ({ user: useRole, roleName, roleStatus }, index, arr) => {
                  return (
                    <RoleStep
                      key={useRole.id}
                      user={useRole}
                      currentUserId={user?.id ?? ""}
                      processStatus={roleStatus}
                      roleName={roleName}
                      histories={[]}
                      withHistory={index !== arr.length - 1 || completed}
                    />
                  );
                },
              )}
              {completed ? (
                <StatusIndicator status={FileFillingFormStatus.Completed} />
              ) : null}
            </div>
          </main>
          <footer className={styles.footer}>
            <Button
              className="primary-button"
              scale
              primary
              size={ButtonSize.medium}
              isLoading={isTurnToFill ? isEditing : false}
              label={
                isTurnToFill
                  ? t("CompletedForm:FillOutForm")
                  : t("Common:CopyLink")
              }
              onClick={isTurnToFill ? handleFillForm : copyLinkFile}
              testId={isTurnToFill ? "fill_form_button" : "copy_link_button"}
            />
            <Button
              className="secondary-button"
              scale
              size={ButtonSize.medium}
              label={isTurnToFill ? t("Common:CopyLink") : t("Common:GoToRoom")}
              onClick={isTurnToFill ? copyLinkFile : handleBackToRoom}
              testId={isTurnToFill ? "copy_link_button" : "go_to_room_button"}
            />
            {isTurnToFill ? (
              <Link
                href=""
                className="link"
                onClick={handleBackToRoom}
                prefetch={false}
                data-testid="go_to_room_link"
              >
                {t("Common:GoToRoom")}
              </Link>
            ) : null}
          </footer>
        </div>
      </Scrollbar>
    </section>
  );
};
