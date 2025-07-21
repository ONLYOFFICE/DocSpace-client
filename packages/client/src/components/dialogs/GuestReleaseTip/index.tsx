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
import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";
import { useTheme } from "styled-components";
import { ReactSVG } from "react-svg";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Badge } from "@docspace/shared/components/badge";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { IconButton } from "@docspace/shared/components/icon-button";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { TUser } from "@docspace/shared/api/people/types";

import NextStepSvg from "PUBLIC_DIR/images/next_step.react.svg";
import ChangeTypeTipSvgUrl from "PUBLIC_DIR/images/change_type.tip.svg?url";
import ChangeTypeTipDarkSvgUrl from "PUBLIC_DIR/images/change_type.tip.dark.svg?url";
import CloseSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import DialogsStore from "SRC_DIR/store/DialogsStore";

import {
  StyledContainer,
  StyledHeader,
  StyledBody,
} from "./GuestReleaseTip.styled";

type GuestReleaseTipProps = {
  userId: TUser["id"];
  accessRightsLink: SettingsStore["accessRightsLink"];
  setShowGuestReleaseTip: SettingsStore["setShowGuestReleaseTip"];
  setGuestReleaseTipDialogVisible: DialogsStore["setGuestReleaseTipDialogVisible"];
  showBodyLoader: boolean;
};

const GuestReleaseTip = ({
  userId,
  accessRightsLink,
  setShowGuestReleaseTip,
  setGuestReleaseTipDialogVisible,
  showBodyLoader,
}: GuestReleaseTipProps) => {
  const { t } = useTranslation(["Common", "Translations", "Files"]);
  const theme = useTheme();

  const icon = theme.isBase ? ChangeTypeTipSvgUrl : ChangeTypeTipDarkSvgUrl;

  const onClose = () => {
    setShowGuestReleaseTip(false);
    setGuestReleaseTipDialogVisible(false);

    window.localStorage.setItem(`closedGuestReleaseTip-${userId}`, "true");
  };

  return (
    <ModalDialog
      displayType={ModalDialogType.modal}
      visible={!showBodyLoader}
      autoMaxHeight
      onClose={onClose}
      isCloseable
    >
      <ModalDialog.Body>
        <StyledContainer>
          <StyledHeader>
            <div className="main-block">
              <Text
                fontSize="16px"
                fontWeight={700}
                lineHeight="22px"
                truncate
                className="main-text"
              >
                {t("Common:User")}
              </Text>
              <NextStepSvg className="next-step-icon" />
              <Text
                fontSize="16px"
                fontWeight={700}
                lineHeight="22px"
                truncate
                className="accent-text"
              >
                {t("Common:Guest")}
              </Text>
              <Badge label={t("Common:New")} noHover />
            </div>

            <IconButton
              iconName={CloseSvgUrl}
              size={16}
              className="close-button"
              onClick={onClose}
            />
          </StyledHeader>

          <StyledBody>
            <Text fontSize="12px" fontWeight={400} lineHeight="16px">
              <Trans
                t={t}
                ns="Translations"
                i18nKey="GuestConversionNote"
                values={{
                  productName: t("Common:ProductName"),
                  sectionName: t("Common:Contacts"),
                }}
              />
            </Text>
            {accessRightsLink ? (
              <Link
                tag="a"
                fontSize="12px"
                fontWeight={400}
                lineHeight="16px"
                href={accessRightsLink}
                target={LinkTarget.blank}
                type={LinkType.page}
                isHovered
                color="accent"
              >
                {t("Translations:GuestReleaseTipLink")}
              </Link>
            ) : null}
          </StyledBody>

          <ReactSVG src={icon} />

          <Button
            primary
            label={t("Common:GotIt")}
            size={ButtonSize.normal}
            scale
            onClick={onClose}
          />
        </StyledContainer>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default inject(
  ({ settingsStore, dialogsStore, userStore, clientLoadingStore }: TStore) => {
    const { accessRightsLink, setShowGuestReleaseTip } = settingsStore;

    const { setGuestReleaseTipDialogVisible } = dialogsStore;

    const userId = userStore.user!.id;

    const { showBodyLoader } = clientLoadingStore;

    return {
      userId,
      accessRightsLink,
      setShowGuestReleaseTip,
      setGuestReleaseTipDialogVisible,
      showBodyLoader,
    };
  },
)(observer(GuestReleaseTip));
