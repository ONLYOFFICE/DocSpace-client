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
import React from "react";
import { observer, inject } from "mobx-react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import { TUser } from "@docspace/shared/api/people/types";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { UserStore } from "@docspace/shared/store/UserStore";

import TutorialPreview from "PUBLIC_DIR/images/form_filling_tutorial.gif";
import TutorialPreviewDark from "PUBLIC_DIR/images/form_filling_tutorial_dark.gif";

import DialogsStore from "SRC_DIR/store/DialogsStore";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { getFormFillingTipsStorageName } from "@docspace/shared/utils";
import { StyledModalDialog } from "./FormFillingTips.styled";

type FormFillingTipsDialogProps = {
  visible: DialogsStore["welcomeFormFillingTipsVisible"];
  setWelcomeFormFillingTipsVisible: DialogsStore["setWelcomeFormFillingTipsVisible"];
  setFormFillingTipsDialog: DialogsStore["setFormFillingTipsDialog"];
  setGuidAnimationVisible: DialogsStore["setGuidAnimationVisible"];
  userId: TUser["id"];
};

const FormFillingTipsDialog = (props: FormFillingTipsDialogProps) => {
  const {
    visible,
    setFormFillingTipsDialog,
    setWelcomeFormFillingTipsVisible,
    setGuidAnimationVisible,
    userId,
  } = props;

  const [isLoaded, setIsLoaded] = React.useState(false);
  const imageRef = React.useRef<HTMLImageElement>(null);

  const handleImageLoaded = () => {
    if (!isLoaded) {
      setIsLoaded(true);
      if (imageRef.current) {
        imageRef.current.style.display = "block";
      }
    }
  };

  const theme = useTheme();

  const image = theme.isBase ? TutorialPreview : TutorialPreviewDark;

  const onOpenGuidance = () => {
    setWelcomeFormFillingTipsVisible(false);
    setFormFillingTipsDialog(true);
  };

  const onClose = () => {
    setWelcomeFormFillingTipsVisible(false);

    const storageName = getFormFillingTipsStorageName(userId);

    const closedFormFillingTips = localStorage.getItem(storageName);

    if (!closedFormFillingTips) {
      setGuidAnimationVisible(true);
    }
    window.localStorage.setItem(storageName, "true");
  };

  const { t } = useTranslation(["FormFillingTipsDialog"]);

  return (
    <StyledModalDialog
      autoMaxHeight
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>
        <Text
          className="welcome-tips-header"
          fontWeight="700"
          fontSize="16px"
          lineHeight="22px"
        >
          {t("WelcomeFillingForm")}
        </Text>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div>
          <Text
            className="welcome-tips-description"
            fontWeight="400"
            fontSize="12px"
            lineHeight="16px"
          >
            {t("WelcomeDescription")}
          </Text>
          <div className="welcome-tips-image-container">
            {!isLoaded ? (
              <RectangleSkeleton
                width="416px"
                height="200px"
                className="configName"
              />
            ) : null}
            <img
              src={image}
              ref={imageRef}
              className="welcome-tips-image"
              onLoad={handleImageLoaded}
              alt="tips-preview"
            />
          </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="form-filling_tips_skip"
          key="SkipTitle"
          label={t("Common:SkipTitle")}
          size={ButtonSize.small}
          onClick={onClose}
          scale
        />
        <Button
          id="form-filling_tips_start"
          key="StartTutorial"
          primary
          label={t("WelcomeStartTutorial")}
          size={ButtonSize.small}
          onClick={onOpenGuidance}
          scale
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default inject(
  ({
    dialogsStore,
    userStore,
  }: {
    dialogsStore: DialogsStore;
    userStore: UserStore;
  }) => {
    const {
      welcomeFormFillingTipsVisible: visible,
      setWelcomeFormFillingTipsVisible,
      setFormFillingTipsDialog,
      setGuidAnimationVisible,
    } = dialogsStore;

    return {
      visible,
      setWelcomeFormFillingTipsVisible,
      setFormFillingTipsDialog,
      setGuidAnimationVisible,
      userId: userStore?.user?.id,
    };
  },
)(observer(FormFillingTipsDialog));
