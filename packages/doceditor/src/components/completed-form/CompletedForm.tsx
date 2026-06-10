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
import { decode } from "he";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import PDFIcon from "PUBLIC_DIR/images/icons/32/pdf.svg";
import DownloadIconUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import LinkIconUrl from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import MailIcon from "PUBLIC_DIR/images/icons/12/mail.svg";

import { toastr } from "@docspace/ui-kit/components/toast";
import { Text } from "@docspace/ui-kit/components/text";
import { getBgPattern, getLogoUrl } from "@docspace/shared/utils/common";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { mobile, mobileMore } from "@docspace/shared/utils";
import { Heading, HeadingLevel } from "@docspace/ui-kit/components/heading";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";

import useUpdateSearchParamId from "@/hooks/useUpdateSearchParamId";

import type { CompletedFormProps } from "./CompletedForm.types";
import { getFolderUrl } from "./CompletedForm.helper";
import { CompletedFormEmpty } from "./CompletedForm.empty";

import styles from "./completed-form.module.scss";

const BIG_FORM_NUMBER = 9_999_999;

export const CompletedForm = ({
  session,
  share,
  isShareFile,
  isSDK,
}: CompletedFormProps) => {
  const { isBase, currentColorScheme } = useTheme();
  const { t } = useTranslation(["CompletedForm", "Common"]);

  useUpdateSearchParamId(session?.response.originalForm.id.toString());

  const logoUrl = getLogoUrl(WhiteLabelLogoType.LoginPage, !isBase);
  const smallLogoUrl = getLogoUrl(WhiteLabelLogoType.LightSmall, !isBase);

  const bgPattern = getBgPattern(currentColorScheme?.id);

  if (!session) return <CompletedFormEmpty />;

  const {
    response: {
      completedForm,
      formNumber,
      manager,
      originalForm,
      roomId,
      isRoomMember,
    },
  } = session;

  const isAnonym = Boolean(share) && !isRoomMember;

  const copyLinkFile = async () => {
    const origin = window.location.origin;

    const url = `${origin}/doceditor?fileId=${completedForm.id}`;

    await copyShareLink(url);
    toastr.success(t("Common:LinkCopySuccess"));
  };

  const handleDownload = () => {
    window.open(completedForm.viewUrl, "_self");
  };

  const gotoCompleteFolder = () => {
    const url = getFolderUrl(completedForm.folderId, false);
    window.location.assign(url);
  };

  const handleBackToRoom = () => {
    const url = getFolderUrl(roomId, isAnonym, share);
    window.location.assign(url);
  };

  const fillAgainSearchParams = new URLSearchParams({
    fileId: originalForm.id.toString(),
    ...(share ? { share } : {}),
    ...(isShareFile ? { is_file: "true" } : {}),
  });

  const bgBlockStyle = {
    "--bg-pattern": bgPattern,
  } as React.CSSProperties;

  return (
    <section
      className={styles.container}
      style={bgBlockStyle}
      data-testid="completed_form_container"
    >
      <Scrollbar fixedSize>
        <div className={styles.completedFormLayout}>
          <picture className="completed-form__logo">
            <source media={mobile} srcSet={smallLogoUrl} />
            <source media={mobileMore} srcSet={logoUrl} />
            <img src={logoUrl} alt="logo" />
          </picture>
          <section className={styles.textWrapper}>
            <Heading level={HeadingLevel.h1}>
              {t("CompletedForm:FormCompletedSuccessfully")}
            </Heading>
            <Text>
              {isAnonym
                ? t("CompletedForm:DescriptionForAnonymous")
                : t("CompletedForm:DescriptionForRegisteredUser")}
            </Text>
          </section>
          <main className={styles.mainContent}>
            <div
              className={classNames(
                styles.completedFormBox,
                "completed-form__file",
              )}
            >
              <PDFIcon />
              <Heading
                className="completed-form__filename"
                level={HeadingLevel.h5}
              >
                {completedForm.title}
              </Heading>
              <IconButton
                size={16}
                className="completed-form__download"
                iconName={isAnonym ? DownloadIconUrl : LinkIconUrl}
                onClick={isAnonym ? handleDownload : copyLinkFile}
                dataTestId={
                  isAnonym
                    ? "download_form_icon_button"
                    : "copy_link_icon_button"
                }
              />
            </div>
            <div className={styles.formNumberWrapper}>
              <span className="label">{t("CompletedForm:FormNumber")}</span>
              <div className={styles.completedFormBox}>
                <Text
                  className={classNames("completed-form__form-number", {
                    "form-number--big": formNumber > BIG_FORM_NUMBER,
                  })}
                >
                  {formNumber}
                </Text>
              </div>
            </div>
            {manager ? (
              <div className={styles.managerWrapper}>
                <span className="label">{t("CompletedForm:FormOwner")}</span>
                <div className={styles.completedFormBox}>
                  <Avatar
                    className="manager__avatar"
                    size={AvatarSize.medium}
                    role={AvatarRole.manager}
                    source={manager.avatar}
                  />
                  <Heading
                    level={HeadingLevel.h3}
                    className="manager__user-name"
                  >
                    {decode(manager.displayName)}
                  </Heading>
                  <Link
                    className="manager__mail link"
                    href={`mailto:${manager.email}`}
                    data-testid="manager_email_link"
                  >
                    <MailIcon />
                    <span>{manager.email}</span>
                  </Link>
                </div>
              </div>
            ) : null}
          </main>
          <footer
            className={classNames(styles.buttonWrapper, {
              [styles.shareFile]: isShareFile ? !isRoomMember : false,
            })}
          >
            <Button
              scale
              primary
              size={ButtonSize.medium}
              label={
                isAnonym
                  ? t("Common:Download")
                  : t("CompletedForm:CheckReadyForms")
              }
              onClick={isAnonym ? handleDownload : gotoCompleteFolder}
              testId={
                isAnonym
                  ? "download_form_button"
                  : "goto_complete_folder_button"
              }
            />
            {(!isShareFile || isRoomMember) && !isSDK ? (
              <Button
                scale
                size={ButtonSize.medium}
                label={t("CompletedForm:BackToRoom")}
                onClick={handleBackToRoom}
                testId="back_to_room_button"
              />
            ) : null}
          </footer>
          <Link
            className="link"
            href={`/?${fillAgainSearchParams.toString()}`}
            prefetch={false}
            data-testid="fill_again_link"
          >
            {t("CompletedForm:FillItOutAgain")}
          </Link>
        </div>
      </Scrollbar>
    </section>
  );
};
