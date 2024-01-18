import { useRef } from "react";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { inject } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { StyledTitle } from "../../styles/common";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const StyledGalleryContextOptions = styled.div`
  height: 16px;
  margin: ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? "0 8px 0 0" : "0 0 0 8px"};
`;

const GalleryItemTitle = ({
  t,

  gallerySelected,
  getIcon,
  currentColorScheme,

  getFormGalleryContextOptions,
}) => {
  const itemTitleRef = useRef();
  const contextMenuRef = useRef();

  const navigate = useNavigate();

  const onGetContextOptions = () => {
    let options = getFormGalleryContextOptions(gallerySelected, t, navigate);
    options = options.filter((option) => option.key !== "template-info");
    return options;
  };

  const onClickContextMenu = (e) => {
    e.button === 2;
    if (!contextMenuRef.current.menuRef.current) itemTitleRef.current.click(e);
    contextMenuRef.current.show(e);
  };

  return (
    <StyledTitle ref={itemTitleRef}>
      <ReactSVG className="icon" src={getIcon(32, ".docxf")} />
      <Text className="text">{gallerySelected?.attributes?.name_form}</Text>

      <Text color={currentColorScheme.main.accent} className="free-label">
        {t("Common:Free")}
      </Text>
      {gallerySelected && (
        <StyledGalleryContextOptions>
          <ContextMenu
            ref={contextMenuRef}
            getContextModel={onGetContextOptions}
            withBackdrop={false}
          />
          <ContextMenuButton
            id="info-options"
            className="expandButton"
            title={t("Translations:TitleShowActions")}
            onClick={onClickContextMenu}
            getData={onGetContextOptions}
            directionX="right"
            displayType="toggle"
          />
        </StyledGalleryContextOptions>
      )}
    </StyledTitle>
  );
};

export default inject(({ contextOptionsStore }) => ({
  getFormGalleryContextOptions:
    contextOptionsStore.getFormGalleryContextOptions,
}))(withTranslation(["FormGallery", "Common"])(GalleryItemTitle));
