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

import { useMemo } from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import Link from "next/link";

import PDFIcon from "PUBLIC_DIR/images/icons/32/pdf.svg";
import EyeIcon from "PUBLIC_DIR/images/eye.react.svg";
import FormFillIcon from "PUBLIC_DIR/images/form.fill.rect.svg";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { getBgPattern, getLogoUrl } from "@docspace/shared/utils/common";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import {
  FileFillingFormStatus,
  WhiteLabelLogoType,
} from "@docspace/shared/enums";
import {
  getTitleWithoutExtension,
  mobile,
  mobileMore,
} from "@docspace/shared/utils";
import { Heading, HeadingLevel } from "@docspace/shared/components/heading";
import { Text } from "@docspace/shared/components/text";

import {
  Box,
  CompletedFormLayout,
  ContainerCompletedForm,
  Footer,
  Header,
  TextWrapper,
  VDRMainContent,
} from "./CompletedForm.styled";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { InputBlock } from "@docspace/shared/components/input-block";
import { InputSize, InputType } from "@docspace/shared/components/text-input";
import {
  RoleStep,
  StatusIndicator,
} from "@docspace/shared/components/filling-role-process";
import type { CompletedVDRFormProps } from "./CompletedForm.types";
import { getFolderUrl } from "./CompletedForm.helper";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { toastr } from "@docspace/shared/components/toast";

export const CompletedVDRForm = ({
  user,
  file,
  roomId,
  isStartFilling,
  formFillingStatus,
}: CompletedVDRFormProps) => {
  const { t } = useTranslation(["CompletedForm", "Common"]);

  const theme = useTheme();

  const bgPattern = getBgPattern(theme.currentColorScheme?.id);
  const logoUrl = getLogoUrl(WhiteLabelLogoType.LoginPage, !theme.isBase);
  const smallLogoUrl = getLogoUrl(WhiteLabelLogoType.LightSmall, !theme.isBase);

  const isYournTurn = file.formFillingStatus === FileFillingFormStatus.YourTurn;
  const completed = file.formFillingStatus === FileFillingFormStatus.Completed;
  const isTurnToFill = isYournTurn && isStartFilling;

  const url = useMemo(() => {
    const { origin, pathname } = new URL(file.webUrl);

    const query = new URLSearchParams();

    query.set("fileId", file.id.toString());

    if (!completed) query.set("action", "fill");

    return `${origin}${pathname}?${query.toString()}`;
  }, [completed, file]);

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
        ? t("CompletedForm:FormVDRYourTurnDescription")
        : t("CompletedForm:FormVDRConfirmationOfStartDescription");
    }

    if (completed) return t("CompletedForm:FormVDRCompletedDescription");

    return t("CompletedForm:FormVDRSectionCompletedDescription");
  }, [t, isStartFilling, completed, isYournTurn]);

  const title = useMemo(() => getTitleWithoutExtension(file, false), [file]);

  const handleBackToRoom = () => {
    const url = getFolderUrl(roomId, false);
    window.location.assign(url);
  };

  const handleFillForm = () => {
    window.location.assign(url);
  };

  const handleViewForm = () => {
    const viewURL = new URL(url);

    viewURL.searchParams.delete("action");

    window.location.assign(viewURL.toString());
  };

  const copyLinkFile = async () => {
    await copyShareLink(url);
    toastr.success(t("Common:LinkCopySuccess"));
  };

  const handleClickFile = () => {
    if (isYournTurn) handleFillForm();
    else handleViewForm();
  };

  return (
    <ContainerCompletedForm bgPattern={bgPattern}>
      <Scrollbar fixedSize>
        <CompletedFormLayout className="completed-form__vdr-layout">
          <Header>
            <picture className="completed-form__logo">
              <source media={mobile} srcSet={smallLogoUrl} />
              <source media={mobileMore} srcSet={logoUrl} />
              <img src={logoUrl} alt="logo" />
            </picture>
            <TextWrapper className="completed-form__text-wrapper">
              <Heading level={HeadingLevel.h1}>{header}</Heading>
              <Text noSelect>{headerDescription}</Text>
            </TextWrapper>
          </Header>
          <VDRMainContent>
            <Box className="completed-form__file" onClick={handleClickFile}>
              <PDFIcon />
              <h5 className="completed-form__file-name">{title}</h5>
              {isYournTurn ? (
                <FormFillIcon className="completed-form_icon" />
              ) : (
                <EyeIcon className="completed-form_icon" />
              )}
            </Box>
            <label htmlFor="form-link" className="completed-form__form-link">
              {label}
              <InputBlock
                id="form-link"
                isReadOnly
                size={InputSize.middle}
                type={InputType.text}
                value={url}
                className="input__copy-link"
                iconButtonClassName="input__copy-link-icon"
                iconName={CopyReactSvgUrl}
                onIconClick={copyLinkFile}
              />
            </label>
            <Box className="completed-form__roles">
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
            </Box>
          </VDRMainContent>
          <Footer>
            <Button
              className="primary-button"
              scale
              primary
              size={ButtonSize.medium}
              label={
                isTurnToFill
                  ? t("CompletedForm:FillOutForm")
                  : t("Common:CopyLink")
              }
              onClick={isTurnToFill ? handleFillForm : copyLinkFile}
            />
            <Button
              className="secondary-button"
              scale
              size={ButtonSize.medium}
              label={
                isTurnToFill
                  ? t("Common:CopyLink")
                  : t("CompletedForm:GoToRoom")
              }
              onClick={isTurnToFill ? copyLinkFile : handleBackToRoom}
            />
            {isTurnToFill ? (
              <Link
                href=""
                className="link"
                onClick={handleBackToRoom}
                prefetch={false}
              >
                {t("CompletedForm:GoToRoom")}
              </Link>
            ) : null}
          </Footer>
        </CompletedFormLayout>
      </Scrollbar>
    </ContainerCompletedForm>
  );
};
