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
import Link from "next/link";
// import Image from "next/image";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

// import CompletedFormDarkIcon from "PUBLIC_DIR/images/completedForm/completed.form.icon.dark.svg?url";
// import CompletedFormLightIcon from "PUBLIC_DIR/images/completedForm/completed.form.icon.light.svg?url";
import PDFIcon from "PUBLIC_DIR/images/icons/32/pdf.svg";
import DownloadIconUrl from "PUBLIC_DIR/images/download.react.svg?url";
import MailIcon from "PUBLIC_DIR/images/icons/12/mail.svg";

import { Text } from "@docspace/shared/components/text";
import { getBgPattern, getLogoUrl } from "@docspace/shared/utils/common";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { mobile, mobileMore } from "@docspace/shared/utils";
import { Heading, HeadingLevel } from "@docspace/shared/components/heading";

import {
  CompletedFormLayout,
  ButtonWrapper,
  TextWrapper,
  Box,
  FormNumberWrapper,
  ManagerWrapper,
  MainContent,
} from "./CompletedForm.styled";

import type { CompletedFormProps } from "./CompletedForm.types";
import { IconButton } from "@docspace/shared/components/icon-button";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";

export const CompletedForm = ({}: CompletedFormProps) => {
  const theme = useTheme();
  const { t } = useTranslation(["CompletedForm", "Common"]);

  const logoUrl = getLogoUrl(WhiteLabelLogoType.LoginPage, !theme.isBase);
  const smallLogoUrl = getLogoUrl(WhiteLabelLogoType.LightSmall, !theme.isBase);

  const bgPattern = getBgPattern(theme.currentColorScheme?.id);

  // const iconUrl = theme.isBase ? CompletedFormLightIcon : CompletedFormDarkIcon;

  // const onClose = () => {
  //   window.close();
  // };

  const formNumber = 312;

  const email = "example@gmail.com";
  const user = "User User";

  return (
    <CompletedFormLayout bgPattern={bgPattern}>
      <picture className="completed-form__logo">
        <source media={mobile} srcSet={smallLogoUrl} />
        <source media={mobileMore} srcSet={logoUrl} />
        <img src={logoUrl} alt="logo" />
      </picture>
      {/* <Image
        priority
        src={iconUrl}
        className="completed-form__icon"
        alt="icon"
        width={416}
        height={200}
      /> */}
      <TextWrapper>
        <Heading level={HeadingLevel.h1}>{t("CompletedForm:Title")}</Heading>
        <Text noSelect>{t("CompletedForm:Description")}</Text>
      </TextWrapper>
      <MainContent>
        <Box className="completed-form__file">
          <PDFIcon />
          <Heading className="completed-form__filename" level={HeadingLevel.h5}>
            312 – leave application (7/8/2024 11:04 PM)
          </Heading>
          <IconButton
            size={16}
            className="completed-form__download"
            iconName={DownloadIconUrl}
          />
        </Box>
        <FormNumberWrapper>
          <span className="label">{t("CompletedForm:FormNumber")}</span>
          <Box>
            <Text className="completed-form__form-number">{formNumber}</Text>
          </Box>
        </FormNumberWrapper>
        <ManagerWrapper>
          <span className="label">{t("CompletedForm:Manager")}</span>
          <Box>
            <Avatar
              className="manager__avatar"
              size={AvatarSize.medium}
              role={AvatarRole.manager}
              source={""}
            />
            <Heading level={HeadingLevel.h3} className="manager__user-name">
              {user}
            </Heading>
            <Link className="manager__mail link" href={`mailto:${email}`}>
              <MailIcon />
              {email}
            </Link>
          </Box>
        </ManagerWrapper>
      </MainContent>
      <ButtonWrapper>
        <Button
          scale
          primary
          size={ButtonSize.medium}
          label={t("Common:Download")}
        />
        <Button
          scale
          size={ButtonSize.medium}
          label={t("CompletedForm:BackToRoom")}
        />
      </ButtonWrapper>
      <Link className="link" href="#">
        {t("CompletedForm:FillItOutAgain")}
      </Link>
    </CompletedFormLayout>
  );
};
