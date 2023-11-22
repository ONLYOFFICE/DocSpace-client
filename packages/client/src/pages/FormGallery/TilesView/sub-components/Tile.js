import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import ContextMenuButton from "@docspace/components/context-menu-button";
import PropTypes from "prop-types";
import ContextMenu from "@docspace/components/context-menu";
import Link from "@docspace/components/link";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import { useNavigate } from "react-router-dom";

import {
  StyledTile,
  StyledFileTileTop,
  StyledFileTileBottom,
  StyledContent,
  StyledOptionButton,
  StyledContextMenu,
} from "../StyledTileView";
import Backdrop from "@docspace/components/backdrop";
import { isMobile } from "@docspace/components/utils/device";

const Tile = ({
  t,
  thumbnailClick,
  item,

  onCreateOform,
  getFormGalleryContextOptions,

  setGallerySelected,
  children,
  contextButtonSpacerWidth,
  tileContextClick,
  isActive,
  isSelected,
  title,
  showHotkeyBorder,
  getIcon,
}) => {
  const cm = useRef();
  const tile = useRef();

  const navigate = useNavigate();

  const previewSrc = item?.attributes.card_prewiew.data?.attributes.url;
  const previewLoader = () => <div style={{ width: "96px" }} />;

  const onSelectForm = () => setGallerySelected(item);

  const onCreateForm = () => onCreateOform(navigate);

  const getContextModel = () => getFormGalleryContextOptions(item, t, navigate);

  const getOptions = () =>
    getFormGalleryContextOptions(item, t, navigate).map((item) => item.key);

  const onOpenContextMenu = (e) => {
    tileContextClick && tileContextClick();
    if (!cm.current.menuRef.current) tile.current.click(e); //TODO: need fix context menu to global
    cm.current.show(e);
  };

  //TODO: OFORM isActive

  return (
    <StyledTile
      ref={tile}
      isSelected={isSelected}
      onContextMenu={onOpenContextMenu}
      isActive={isActive}
      showHotkeyBorder={showHotkeyBorder}
      onDoubleClick={onCreateForm}
      onClick={onSelectForm}
      className="files-item"
    >
      <StyledFileTileTop isActive={isActive}>
        {previewSrc ? (
          <Link
            className="thumbnail-image-link"
            type="page"
            onClick={thumbnailClick}
          >
            <img
              src={previewSrc}
              className="thumbnail-image"
              alt="Thumbnail-img"
            />
          </Link>
        ) : (
          <ReactSVG
            className="temporary-icon"
            src={previewSrc || ""}
            loading={previewLoader}
          />
        )}
      </StyledFileTileTop>

      <StyledFileTileBottom isSelected={isSelected} isActive={isActive}>
        <div className="file-icon_container">
          <div className="file-icon">
            <img className="react-svg-icon" src={getIcon(32, ".docxf")} />
          </div>
        </div>

        <StyledContent>{children}</StyledContent>

        <StyledOptionButton spacerWidth={contextButtonSpacerWidth}>
          <ContextMenuButton
            className="expandButton"
            directionX="right"
            getData={getOptions}
            displayType="toggle"
            onClick={onOpenContextMenu}
            title={title}
          />
          <StyledContextMenu
            ignoreChangeView={isMobile()}
            getContextModel={getContextModel}
            ref={cm}
            withBackdrop={true}
          />
        </StyledOptionButton>
      </StyledFileTileBottom>
    </StyledTile>
  );
};

Tile.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]),
  className: PropTypes.string,
  contextButtonSpacerWidth: PropTypes.string,
  contextOptions: PropTypes.array,
  data: PropTypes.object,
  id: PropTypes.string,
  tileContextClick: PropTypes.func,
};

Tile.defaultProps = {
  contextButtonSpacerWidth: "32px",
  item: {},
};

export default inject(
  (
    { filesStore, settingsStore, auth, oformsStore, contextOptionsStore },
    { item }
  ) => {
    const { categoryType } = filesStore;
    const { gallerySelected, setGallerySelected } = oformsStore;
    const { getIcon } = settingsStore;
    const { isVisible, setIsVisible } = auth.infoPanelStore;

    const isSelected = item.id === gallerySelected?.id;

    const { getFormGalleryContextOptions, onCreateOform } = contextOptionsStore;

    return {
      isSelected,
      setGallerySelected,
      onCreateOform,
      getFormGalleryContextOptions,
      getIcon,
      setIsInfoPanelVisible: setIsVisible,
      isInfoPanelVisible: isVisible,
      categoryType,
    };
  }
)(withTranslation(["FormGallery", "Common"])(observer(Tile)));
