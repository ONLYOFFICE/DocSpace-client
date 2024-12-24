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

import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { classNames, isMobile } from "../../../utils";
import { AsideHeader } from "../../aside";

import { FormFillingTipsState } from "../../../enums";

import {
  Content,
  StyledBody,
  StyledFooter,
} from "../../modal-dialog/ModalDialog.styled";

import {
  StyledClipped,
  StyledDialog,
  StyledGuidBackdrop,
  StyledTipsCircle,
} from "./Guid.styled";

import { ModalDialogType } from "../../modal-dialog";
import { getHeaderText, getGuidPosition } from "./Guid.utils";
import { GuidProps } from "./Guid.types";

const GUID_MODAL_MARGIN = 16;
const MAX_MODAL_HEIGHT = 190;
const MODAL_WIDTH = 430;

const Guid = ({
  formFillingTipsNumber,
  setFormFillingTipsNumber,
  onClose,
  guidRects,
  viewAs,
}: GuidProps) => {
  const { t } = useTranslation(["FormFillingTipsDialog"]);

  const [modalBottom, setModalBottom] = React.useState<null | number>(null);

  const theme = useTheme();

  const modalText = getHeaderText(formFillingTipsNumber, t);

  const isLastTip = formFillingTipsNumber === FormFillingTipsState.Uploading;

  const guidPosition = getGuidPosition(
    guidRects,
    formFillingTipsNumber,
    viewAs,
  );

  const onCloseBackdrop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const onNextTips = () => {
    if (isLastTip) {
      return onClose();
    }
    setFormFillingTipsNumber(formFillingTipsNumber + 1);
  };

  const onPrevTips = () => {
    setFormFillingTipsNumber(formFillingTipsNumber - 1);
  };

  let tipsCircle = [];

  for (let i = 1; i < 6; i++) {
    tipsCircle.push(
      <StyledTipsCircle
        isSelected={i === formFillingTipsNumber}
        key={`tips_circle_${i}`}
      />,
    );
  }

  const onResize = () => {
    const screenHeight = document.documentElement.clientHeight;

    if (
      screenHeight <
      guidPosition.bottom + GUID_MODAL_MARGIN + MAX_MODAL_HEIGHT
    ) {
      return setModalBottom(
        guidPosition.top - GUID_MODAL_MARGIN - MAX_MODAL_HEIGHT,
      );
    }
    return setModalBottom(guidPosition.bottom + GUID_MODAL_MARGIN);
  };

  React.useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [guidPosition.bottom]);

  if (isMobile()) {
    onClose();
  }

  return (
    <div>
      <StyledGuidBackdrop onClick={onCloseBackdrop} />
      <StyledClipped
        isBase={theme.isBase}
        className="guid-element"
        position={guidPosition}
      />
      <StyledDialog
        id="modal-onMouseDown-close"
        bottom={modalBottom}
        left={
          isLastTip && !isDesktop() ? guidPosition.left - MODAL_WIDTH : null
        }
        className={
          classNames(["modalOnCloseBacdrop", "not-selectable", "dialog"]) || ""
        }
      >
        <Content
          id="modal-dialog"
          visible
          currentDisplayType={ModalDialogType.modal}
          autoMaxHeight
        >
          <AsideHeader
            id="modal-header-swipe"
            className={classNames(["modal-header"]) || "modal-header"}
            header={modalText?.header}
            onCloseClick={onClose}
          />

          <StyledBody
            className={classNames(["modal-body"]) || "modal-body"}
            currentDisplayType={ModalDialogType.modal}
          >
            <Text
              className="tips-description"
              fontWeight="400"
              fontSize="13px"
              lineHeight="20px"
            >
              {" "}
              {modalText?.description}
            </Text>
          </StyledBody>

          <StyledFooter
            className={classNames(["modal-footer"]) || "modal-footer"}
          >
            <>
              <div className="circle-container">{tipsCircle}</div>
              <div className="button-container">
                {formFillingTipsNumber !== FormFillingTipsState.Starting && (
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
                  label={isLastTip ? t("Common:GotIt") : t("Common:Next")}
                  size={ButtonSize.extraSmall}
                  onClick={onNextTips}
                />
              </div>
            </>
          </StyledFooter>
        </Content>
      </StyledDialog>
    </div>
  );
};

export { Guid };
