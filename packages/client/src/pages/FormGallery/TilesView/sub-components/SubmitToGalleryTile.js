import { Button } from "@docspace/shared/components/button";
import styled, { css } from "styled-components";
import { commonIconsStyles } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import hexRgb from "hex-rgb";
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg";

export const StyledSubmitToGalleryTile = styled.div`
  position: relative;

  width: 100%;
  height: 220px;

  padding: 16px;
  box-sizing: border-box;

  border: 1px solid
    ${({ currentColorScheme }) => currentColorScheme.main?.accent};
  border-radius: 6px;
  background-color: ${({ currentColorScheme }) =>
    hexRgb(currentColorScheme.main?.accent, { alpha: 0.03, format: "css" })};

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;

  .info {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 8px;

    .title {
      color: ${({ currentColorScheme }) => currentColorScheme.main?.accent};
      font-weight: 600;
      font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
      line-height: 16px;
    }
    .body {
      font-weight: 400;
      font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
      line-height: 16px;
      color: ${({ theme }) => theme.oformGallery.submitToGalleryTile.bodyText};
    }
  }
`;

StyledSubmitToGalleryTile.defaultProps = { theme: Base };

const StyledCloseIcon = styled(CrossIcon)`
  ${commonIconsStyles}
  position: absolute;
  top: 10px;
  cursor: pointer;

  ${(props) =>
    props.theme.interfaceDirection === "ltr"
      ? css`
          right: 10px;
        `
      : css`
          left: 10px;
        `}

  path {
    fill: ${({ theme }) =>
      theme.oformGallery.submitToGalleryTile.closeIconFill};
  }
`;

StyledCloseIcon.defaultProps = { theme: Base };

const SubmitToGalleryTile = ({
  t,
  submitToGalleryTileIsVisible,
  hideSubmitToGalleryTile,
  setSubmitToGalleryDialogVisible,
  currentColorScheme,
}) => {
  if (!submitToGalleryTileIsVisible) return null;

  const onSubmitToGallery = () => setSubmitToGalleryDialogVisible(true);

  return (
    <StyledSubmitToGalleryTile currentColorScheme={currentColorScheme}>
      <StyledCloseIcon
        onClick={hideSubmitToGalleryTile}
        className="close-icon"
        size="medium"
      />

      <div className="info">
        <div className="title">{t("Common:SubmitToGalleryBlockHeader")}</div>
        <div className="body">{t("Common:SubmitToGalleryBlockBody")}</div>
      </div>

      <Button
        onClick={onSubmitToGallery}
        size="small"
        label={t("Common:SubmitToFormGallery")}
        scale
      />
    </StyledSubmitToGalleryTile>
  );
};

export default inject(({ settingsStore, oformsStore, dialogsStore }) => ({
  submitToGalleryTileIsVisible: oformsStore.submitToGalleryTileIsVisible,
  hideSubmitToGalleryTile: oformsStore.hideSubmitToGalleryTile,
  setSubmitToGalleryDialogVisible: dialogsStore.setSubmitToGalleryDialogVisible,
  currentColorScheme: settingsStore.currentColorScheme,
}))(withTranslation("Common", "FormGallery")(observer(SubmitToGalleryTile)));
