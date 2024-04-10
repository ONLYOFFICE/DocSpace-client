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
import { useNavigate } from "react-router-dom";
import { ReactSVG } from "react-svg";

import DeveloperReactSvgUrl from "PUBLIC_DIR/images/catalog.developer.react.svg?url";
import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.right.react.svg?url";

import { DeviceType } from "../../../enums";

import { Text } from "../../text";

import { ArticleDevToolsBarProps } from "../Article.types";
import { StyledWrapper } from "../Article.styled";
import { openingNewTab } from "../../../utils/openingNewTab";

const ArticleDevToolsBar = ({
  showText,
  articleOpen,
  currentDeviceType,
  toggleArticleOpen,
}: ArticleDevToolsBarProps) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();

  const onClick = (e: React.MouseEvent) => {
    const path = "/portal-settings/developer-tools";

    if (openingNewTab(path, e)) return;

    navigate(path);

    if (articleOpen && currentDeviceType === DeviceType.mobile)
      toggleArticleOpen();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 1) return;

    onClick(e);
  };

  if (!showText) return null;

  return (
    <StyledWrapper onClick={onClick} onMouseDown={onMouseDown}>
      <ReactSVG src={DeveloperReactSvgUrl} className="icon" />
      <Text fontWeight={600} fontSize="12px" className="label">
        {t("Common:DeveloperTools")}
      </Text>
      <ReactSVG src={ArrowReactSvgUrl} className="arrow" />
    </StyledWrapper>
  );
};

export default ArticleDevToolsBar;
