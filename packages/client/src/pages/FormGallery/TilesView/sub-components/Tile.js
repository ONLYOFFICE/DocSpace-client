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

import { useRef } from "react";
import { inject, observer } from "mobx-react";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import PropTypes from "prop-types";
import { Link } from "@docspace/shared/components/link";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import { useNavigate } from "react-router";

import { isMobile } from "@docspace/shared/utils";
import {
  StyledTile,
  StyledFileTileTop,
  StyledFileTileBottom,
  StyledContent,
  StyledOptionButton,
  StyledContextMenu,
} from "../StyledTileView";

const Tile = ({
  t,
  thumbnailClick,
  item = {},

  onCreateOform,
  getFormGalleryContextOptions,

  setGallerySelected,
  children,
  contextButtonSpacerWidth = "32px",
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

  const contextMenuHeader = {
    icon: getIcon(32, ".pdf"),
    title: item?.attributes?.name_form,
  };

  const getOptions = () =>
    getFormGalleryContextOptions(item, t, navigate).map((elm) => elm.key);

  const onOpenContextMenu = (e) => {
    tileContextClick && tileContextClick();
    if (!cm.current.menuRef.current) tile.current.click(e); // TODO: need fix context menu to global
    cm.current.show(e);
  };

  // TODO: OFORM isActive

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
            <img
              className="react-svg-icon"
              src={getIcon(32, ".pdf")}
              alt="File"
            />
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
            header={contextMenuHeader}
            ref={cm}
            withBackdrop
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
  contextButtonSpacerWidth: PropTypes.string,
  tileContextClick: PropTypes.func,
};

export default inject(
  (
    {
      filesStore,
      filesSettingsStore,

      oformsStore,
      contextOptionsStore,
      infoPanelStore,
    },
    { item },
  ) => {
    const { categoryType } = filesStore;
    const { gallerySelected, setGallerySelected } = oformsStore;
    const { getIcon } = filesSettingsStore;
    const { isVisible, setIsVisible } = infoPanelStore;

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
  },
)(withTranslation(["FormGallery", "Common"])(observer(Tile)));
