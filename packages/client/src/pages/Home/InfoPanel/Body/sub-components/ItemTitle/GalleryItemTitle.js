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
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { inject } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { useNavigate } from "react-router";
import styled from "styled-components";
import { StyledTitle } from "../../styles/common";

const StyledGalleryContextOptions = styled.div`
  height: 16px;
  margin-block: 0;
  margin-inline: 8px 0;
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
      <ReactSVG className="icon" src={getIcon(32, ".pdf")} />
      <Text className="text">{gallerySelected?.attributes?.name_form}</Text>

      <Text color={currentColorScheme.main?.accent} className="free-label">
        {t("Common:Free")}
      </Text>
      {gallerySelected ? (
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
      ) : null}
    </StyledTitle>
  );
};

export default inject(({ contextOptionsStore }) => ({
  getFormGalleryContextOptions:
    contextOptionsStore.getFormGalleryContextOptions,
}))(withTranslation(["FormGallery", "Common"])(GalleryItemTitle));
