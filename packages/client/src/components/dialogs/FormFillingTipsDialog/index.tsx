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
import React from "react";
import { observer, inject } from "mobx-react";
import { useTranslation } from "react-i18next";
import { TUser } from "@docspace/shared/api/people/types";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { UserStore } from "@docspace/shared/store/UserStore";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import TutorialPreview from "PUBLIC_DIR/images/form_filling_tutorial.gif";
import TutorialPreviewDark from "PUBLIC_DIR/images/form_filling_tutorial_dark.gif";

import DialogsStore from "SRC_DIR/store/DialogsStore";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { getFormFillingTipsStorageName } from "@docspace/shared/utils";
import styles from "./FormFillingTips.module.scss";

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

  const { isBase } = useTheme();

  const image = isBase ? TutorialPreview : TutorialPreviewDark;

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
    <ModalDialog
      className={styles.wrapper}
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
            {t("WelcomeTipsDescription")}
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
    </ModalDialog>
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
