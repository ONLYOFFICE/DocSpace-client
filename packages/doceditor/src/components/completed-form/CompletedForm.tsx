// (c) Copyright Ascensio System SIA 2009-2024
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
import { decode } from "he";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import CompletedFormDarkIcon from "PUBLIC_DIR/images/completedForm/completed.form.icon.dark.svg?url";
import CompletedFormLightIcon from "PUBLIC_DIR/images/completedForm/completed.form.icon.light.svg?url";
import PDFIcon from "PUBLIC_DIR/images/icons/32/pdf.svg";
import DownloadIconUrl from "PUBLIC_DIR/images/download.react.svg?url";
import LinkIconUrl from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import MailIcon from "PUBLIC_DIR/images/icons/12/mail.svg";

import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import { getBgPattern } from "@docspace/shared/utils/ui";
import { getLogoUrl } from "@docspace/shared/utils/logo";
import { isNullOrUndefined } from "@docspace/shared/utils/typeGuards";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { classNames, mobile, mobileMore } from "@docspace/shared/utils";
import { Heading, HeadingLevel } from "@docspace/shared/components/heading";
import { IconButton } from "@docspace/shared/components/icon-button";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { Scrollbar } from "@docspace/shared/components/scrollbar";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";

import FilesFilter from "@docspace/shared/api/files/filter";

import useUpdateSearchParamId from "@/hooks/useUpdateSearchParamId";

import {
  CompletedFormLayout,
  ButtonWrapper,
  TextWrapper,
  Box,
  FormNumberWrapper,
  ManagerWrapper,
  MainContent,
  ContainerCompletedForm,
} from "./CompletedForm.styled";

import type { CompletedFormProps } from "./CompletedForm.types";

const BIG_FORM_NUMBER = 9_999_999;

export const CompletedForm = ({
  session,
  share,
  isShareFile,
}: CompletedFormProps) => {
  const theme = useTheme();
  const { t } = useTranslation(["CompletedForm", "Common"]);

  useUpdateSearchParamId(session?.response.originalForm.id.toString());

  const logoUrl = getLogoUrl(WhiteLabelLogoType.LoginPage, !theme.isBase);
  const smallLogoUrl = getLogoUrl(WhiteLabelLogoType.LightSmall, !theme.isBase);

  const bgPattern = getBgPattern(theme.currentColorScheme?.id);

  const iconUrl = theme.isBase ? CompletedFormLightIcon : CompletedFormDarkIcon;

  if (!session)
    return (
      <ContainerCompletedForm bgPattern={bgPattern}>
        <CompletedFormLayout className="completed-form__default-layout">
          <picture className="completed-form__logo">
            <source media={mobile} srcSet={smallLogoUrl} />
            <source media={mobileMore} srcSet={logoUrl} />
            <img src={logoUrl} alt="logo" />
          </picture>
          <Image
            priority
            src={iconUrl}
            className="completed-form__icon"
            alt="icon"
            width={416}
            height={200}
          />
          <TextWrapper className="completed-form__empty">
            <Heading level={HeadingLevel.h1}>
              {t("CompletedForm:Title")}
            </Heading>
            <Text noSelect>{t("CompletedForm:Description")}</Text>
          </TextWrapper>
        </CompletedFormLayout>
      </ContainerCompletedForm>
    );

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

  const getFolderUrl = (folderId: number, isAnonym: boolean): string => {
    if (isNullOrUndefined(folderId)) return "";

    const origin = window.location.origin;

    const filter = FilesFilter.getDefault();

    filter.folder = folderId.toString();

    const path = isAnonym
      ? `/rooms/share?key=${share}&`
      : `/rooms/shared/${roomId}?`;

    return `${origin}${path}${filter.toUrlParams()}`;
  };

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
    const url = getFolderUrl(roomId, isAnonym);
    window.location.assign(url);
  };

  const fillAgainSearchParams = new URLSearchParams({
    fileId: originalForm.id.toString(),
    ...(share ? { share } : {}),
    ...(isShareFile ? { is_file: "true" } : {}),
  });

  return (
    <ContainerCompletedForm bgPattern={bgPattern}>
      <Scrollbar fixedSize>
        <CompletedFormLayout>
          <picture className="completed-form__logo">
            <source media={mobile} srcSet={smallLogoUrl} />
            <source media={mobileMore} srcSet={logoUrl} />
            <img src={logoUrl} alt="logo" />
          </picture>
          <TextWrapper>
            <Heading level={HeadingLevel.h1}>
              {t("CompletedForm:FormCompletedSuccessfully")}
            </Heading>
            <Text noSelect>
              {isAnonym
                ? t("CompletedForm:DescriptionForAnonymous")
                : t("CompletedForm:DescriptionForRegisteredUser")}
            </Text>
          </TextWrapper>
          <MainContent>
            <Box className="completed-form__file">
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
              />
            </Box>
            <FormNumberWrapper>
              <span className="label">{t("CompletedForm:FormNumber")}</span>
              <Box>
                <Text
                  className={classNames("completed-form__form-number", {
                    ["form-number--big"]: formNumber > BIG_FORM_NUMBER,
                  })}
                >
                  {formNumber}
                </Text>
              </Box>
            </FormNumberWrapper>
            <ManagerWrapper>
              <span className="label">{t("CompletedForm:FormOwner")}</span>
              <Box>
                <Avatar
                  className="manager__avatar"
                  size={AvatarSize.medium}
                  role={AvatarRole.manager}
                  source={manager.avatar}
                />
                <Heading level={HeadingLevel.h3} className="manager__user-name">
                  {decode(manager.displayName)}
                </Heading>
                <Link
                  className="manager__mail link"
                  href={`mailto:${manager.email}`}
                >
                  <MailIcon />
                  <span>{manager.email}</span>
                </Link>
              </Box>
            </ManagerWrapper>
          </MainContent>
          <ButtonWrapper isShareFile={isShareFile && !isRoomMember}>
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
            />
            {(!isShareFile || isRoomMember) && (
              <Button
                scale
                size={ButtonSize.medium}
                label={t("CompletedForm:BackToRoom")}
                onClick={handleBackToRoom}
              />
            )}
          </ButtonWrapper>
          <Link
            className="link"
            href={`/?${fillAgainSearchParams.toString()}`}
            prefetch={false}
          >
            {t("CompletedForm:FillItOutAgain")}
          </Link>
        </CompletedFormLayout>
      </Scrollbar>
    </ContainerCompletedForm>
  );
};
