import { useRef } from "react";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import { ContextMenu, ContextMenuButton } from "@docspace/components";
import { inject } from "mobx-react";

import { Text } from "@docspace/components";
import { StyledTitle } from "../../styles/common";
import { useParams, useNavigate } from "react-router-dom";
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

  getFormContextOptions,
  categoryType,
}) => {
  const itemTitleRef = useRef();
  const contextMenuRef = useRef();

  const params = useParams();
  const navigate = useNavigate();

  const onGetContextOptions = () =>
    getFormContextOptions(t, gallerySelected, categoryType, params, navigate);

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
        {t("FormGallery:Free")}
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

export default inject(({ oformsStore, filesStore }) => ({
  getFormContextOptions: oformsStore.getFormContextOptions,
  categoryType: filesStore.categoryType,
}))(withTranslation(["FormGallery", "Common"])(GalleryItemTitle));
