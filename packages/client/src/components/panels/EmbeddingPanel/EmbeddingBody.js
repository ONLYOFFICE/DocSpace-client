﻿import React, { useState } from "react";
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
import { objectToGetParams } from "@docspace/common/utils";

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
          <Textarea isReadOnly value={codeBlock} heightTextArea={150} />
        </div>
      </div>
    </StyledBody>
  );
};

export default EmbeddingBody;
