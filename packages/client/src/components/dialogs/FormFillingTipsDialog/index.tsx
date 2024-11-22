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
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";
import TutorialPreview from "PUBLIC_DIR/images/form_filling_tutorial.gif";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";

const StyledModalDialog = styled(ModalDialog)<{
  isTourMode: boolean;
}>`
  #modal-dialog {
    width: 448px;

    .modal-header {
      margin-bottom: 0px !important;
    }

    .modal-header::after {
      border: none;
    }

    .modal-footer {
      margin-bottom: 8px;
    }
  }

  .welcome-tips-description {
    margin-bottom: 5px;
  }

  .circle-container {
    align-items: center;
    display: flex;
    gap: 10px;
  }

  .button-container {
    gap: 8px;
    display: flex;
  }

  ${(props) =>
    props.isTourMode &&
    css`
      #modal-dialog {
        width: 430px;
      }

      .modal-header {
        height: 49px;
        min-height: 49px;
      }

      .modal-footer {
        justify-content: space-between;
        margin-bottom: 0px !important;
        padding: 12px 20px 20px;
      }

      .modal-body {
        padding: 0px 18px 0px;
      }
      .welcome-tips-description {
        font-size: 13px;
        line-height: 20px;
      }
    `}
`;

const StyledTipsCircle = styled.div<{ isSelected: boolean }>`
  width: 7px;
  height: 7px;
  background-color: ${(props) => props.theme.formFillingTips.circleColor};
  border-radius: 50%;
  ${(props) =>
    props.isSelected &&
    css`
      border: ${props.theme.formFillingTips.circleBorder};
      background-color: ${props.theme.formFillingTips.selectedColor};
    `}
`;

enum FormFillingTipsState {
  Welcome = 1,
  Starting = 2,
  Sharing = 3,
  Submitting = 4,
  Complete = 5,
  Uploading = 6,
}

const getHeaderText = (state, t) => {
  switch (state) {
    case FormFillingTipsState.Welcome:
      return {
        header: t("WelcomeFillingForm"),
        description: t("WelcomeDescription"),
      };
    case FormFillingTipsState.Starting:
      return {
        header: t("HeaderStarting"),
        description: t("TitleStarting"),
      };
    case FormFillingTipsState.Sharing:
      return {
        header: t("HeaderSharing"),
        description: t("TitleSharing"),
      };
    case FormFillingTipsState.Submitting:
      return {
        header: t("HeaderSubmitting"),
        description: t("TitleSubmitting"),
      };
    case FormFillingTipsState.Complete:
      return {
        header: t("HeaderComplete"),
        description: t("TitleComplete"),
      };
    case FormFillingTipsState.Uploading:
      return {
        header: t("HeaderUploading"),
        description: t("TitleUploading"),
      };

    default:
      return null;
  }
};

const FormFillingTipsDialog = (props) => {
  const {
    visible,
    formFillingTipsNumber,
    setFormFillingTipsDialog,
    setFormFillingTipsNumber,
  } = props;

  const onClose = () => {
    setFormFillingTipsDialog(false);
    setFormFillingTipsNumber(FormFillingTipsState.Welcome);
  };

  const onNextTips = () => {
    setFormFillingTipsNumber(formFillingTipsNumber + 1);
  };

  const onPrevTips = () => {
    setFormFillingTipsNumber(formFillingTipsNumber - 1);
  };

  const { t } = useTranslation(["FormFillingTipsDialog"]);

  const modalText = getHeaderText(formFillingTipsNumber, t);

  const isTourMode = formFillingTipsNumber > 1;

  let tipsCircle = [];

  for (let i = 2; i < 7; i++) {
    tipsCircle.push(
      <StyledTipsCircle
        isSelected={i === formFillingTipsNumber}
        key={`tips_circle_${i}`}
      />,
    );
  }

  return (
    <StyledModalDialog
      autoMaxHeight
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      isTourMode={isTourMode}
    >
      <ModalDialog.Header>{modalText?.header}</ModalDialog.Header>
      <ModalDialog.Body>
        <div>
          <Text
            className="welcome-tips-description"
            fontWeight="400"
            fontSize="12px"
            lineHeight="16px"
          >
            {" "}
            {modalText?.description}
          </Text>
          {formFillingTipsNumber < 2 && (
            <img src={TutorialPreview} alt="tips-preview" />
          )}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        {formFillingTipsNumber < 2 ? (
          <>
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
              onClick={onNextTips}
              scale
            />
          </>
        ) : (
          <>
            <div className="circle-container">{tipsCircle}</div>
            <div className="button-container">
              {formFillingTipsNumber > 2 && (
                <Button
                  id="form-filling_tips_back"
                  key="TipsBack"
                  label={t("Common:Back")}
                  size={ButtonSize.extraSmall}
                  onClick={onPrevTips}
                />
              )}

              <Button
                id="form-filling_tips_next"
                key="TipsNext"
                primary
                label={t("Common:Next")}
                size={ButtonSize.extraSmall}
                onClick={onNextTips}
              />
            </div>
          </>
        )}
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default inject(({ dialogsStore }) => {
  const {
    formFillingTipsDialogVisible: visible,
    formFillingTipsNumber,
    setFormFillingTipsDialog,
    setFormFillingTipsNumber,
  } = dialogsStore;

  return {
    visible,
    formFillingTipsNumber,
    setFormFillingTipsDialog,
    setFormFillingTipsNumber,
  };
})(observer(FormFillingTipsDialog));
