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

import React, { useState } from "react";
import copy from "copy-to-clipboard";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { TextInput } from "@docspace/shared/components/text-input";
import { Textarea } from "@docspace/shared/components/textarea";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Button } from "@docspace/shared/components/button";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import { StyledBody } from "./StyledEmbeddingPanel";
import { objectToGetParams } from "@docspace/shared/utils/common";

const EmbeddingBody = ({ t, link, requestToken, roomId }) => {
  const [size, setSize] = useState("auto");
  const [widthValue, setWidthValue] = useState("100%");
  const [heightValue, setHeightValue] = useState("100%");

  const config = {
    width: `${widthValue}`,
    height: `${heightValue}`,
    frameId: "ds-frame-embedding",
    mode: "manager",
    init: true,
    showHeader: true,
    showTitle: true,
    showMenu: false,
    showFilter: true,
    rootPath: "/rooms/share",
    id: roomId,
    requestToken,
    withSubfolders: false,
  };

  const scriptUrl = `${window.location.origin}/static/scripts/api.js`;
  const params = objectToGetParams(config);
  const codeBlock = `<div id="${config.frameId}">Fallback text</div>\n<script src="${scriptUrl}${params}"></script>`;

  const onChangeWidth = (e) => setWidthValue(e.target.value);
  const onChangeHeight = (e) => setHeightValue(e.target.value);
  const onCopyLink = () => {
    copy(codeBlock);
    toastr.success(t("EmbeddingPanel:CodeCopySuccess"));
  };

  const getSizes = (size) => {
    switch (size) {
      case "auto":
        return ["100%", "100%"];
      case "mobile":
        return ["400px", "600px"];
      case "tablet":
        return ["600px", "800px"];
      default:
        return ["100%", "100%"];
    }
  };

  const onSelectSize = (e) => {
    const size = e.currentTarget.dataset.size;
    const [width, height] = getSizes(size);

    setSize(size);
    setWidthValue(width);
    setHeightValue(height);
  };

  const onPreviewClick = () => {
    console.log("onPreviewClick???");
  };

  const linkProps = {
    isHovered: true,
    type: "action",
    onClick: onSelectSize,
  };

  return (
    <StyledBody>
      <div className="embedding-panel_body">
        <Text className="embedding-panel_text">{t("Common:Size")}:</Text>
        <div className="embedding-panel_links-container">
          <Link
            data-size="auto"
            className={`embedding-panel_link ${
              size === "auto" && "embedding-panel_link_active"
            }`}
            {...linkProps}
          >
            {t("Auto")}
          </Link>

          <Link
            data-size="tablet"
            className={`embedding-panel_link ${
              size === "tablet" && "embedding-panel_link_active"
            }`}
            {...linkProps}
          >
            600 x 800 px
          </Link>

          <Link
            data-size="mobile"
            className={`embedding-panel_link ${
              size === "mobile" && "embedding-panel_link_active"
            }`}
            {...linkProps}
          >
            400 x 600 px
          </Link>
        </div>
        <div className="embedding-panel_inputs-container">
          <div>
            <Text className="embedding-panel_text">{t("Width")}:</Text>
            <TextInput
              className="embedding-panel_input"
              value={widthValue}
              onChange={onChangeWidth}
            />
          </div>
          <div>
            <Text className="embedding-panel_text">{t("Height")}:</Text>
            <TextInput
              className="embedding-panel_input"
              value={heightValue}
              onChange={onChangeHeight}
            />
          </div>
          {/* <Button
            className="embedding-panel_preview-button"
            primary
            size="small"
            label={t("Common:Preview")}
            onClick={onPreviewClick}
          /> */}
        </div>
        <div className="embedding-panel_code-container">
          <Text className="embedding-panel_text">
            {t("EmbeddingPanel:EmbedCode")}:
          </Text>
          <IconButton
            className="embedding-panel_copy-icon"
            size="16"
            iconName={CopyReactSvgUrl}
            onClick={onCopyLink}
          />
          <Textarea isReadOnly value={codeBlock} heightTextArea="150px" />
        </div>
      </div>
    </StyledBody>
  );
};

export default EmbeddingBody;