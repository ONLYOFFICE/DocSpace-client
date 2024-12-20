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

import { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { Box } from "@docspace/shared/components/box";
import { Label } from "@docspace/shared/components/label";
import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";
import { inject, observer } from "mobx-react";
import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import SDK from "@onlyoffice/docspace-sdk-js";

import { SDK_SCRIPT_URL } from "@docspace/shared/constants";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import api from "@docspace/shared/api";
import EmptyIframeContainer from "../sub-components/EmptyIframeContainer";

import { WidthSetter } from "../sub-components/WidthSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { PreviewBlock } from "../sub-components/PreviewBlock";

import { dimensionsModel, defaultSize, defaultDimension } from "../constants";

import {
  Controls,
  CategorySubHeader,
  ControlsGroup,
  LabelGroup,
  ControlsSection,
  Frame,
  Container,
  FilesSelectorInputWrapper,
} from "./StyledPresets";
import { Integration } from "../sub-components/Integration";

const Viewer = (props) => {
  const { t, theme, currentColorScheme } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const [config, setConfig] = useState({
    src: window.location.origin,
    mode: "viewer",
    editorType: "embedded",
    width: `${defaultSize.width}${defaultDimension.label}`,
    height: `${defaultSize.height}${defaultDimension.label}`,
    frameId: "ds-frame",
    init: false,
  });

  const sdk = new SDK();

  const destroyFrame = () => {
    sdk.frames[config.frameId]?.destroyFrame();
  };

  const initFrame = () => {
    setTimeout(() => sdk.init(config), 10);
  };

  useEffect(() => {
    initFrame();
    return () => destroyFrame();
  });

  useEffect(() => {
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }, []);

  const onChangeFileId = async (file) => {
    const newConfig = {
      id: file.id,
      init: true,
      requestToken: null,
    };

    if (file.inPublic) {
      const link = await api.files.getFileLink(file.id);
      const { requestToken } = link.sharedTo;

      newConfig.requestToken = requestToken;
    }

    setConfig((oldConfig) => {
      return { ...oldConfig, ...newConfig };
    });
  };

  const preview = (
    <Frame
      width={
        config.id !== undefined && config.width.includes("px")
          ? config.width
          : undefined
      }
      height={
        config.id !== undefined && config.height.includes("px")
          ? config.height
          : undefined
      }
      targetId={config.frameId}
    >
      {config.id !== undefined ? (
        <Box id={config.frameId} />
      ) : (
        <EmptyIframeContainer
          text={t("FilePreview")}
          width="100%"
          height="100%"
        />
      )}
    </Frame>
  );

  return (
    <PresetWrapper
      description={t("ViewerDescription")}
      header={t("CreateSampleViewer")}
    >
      <Container>
        <PreviewBlock
          t={t}
          loadCurrentFrame={initFrame}
          preview={preview}
          theme={theme}
          frameId={config.frameId}
          scriptUrl={SDK_SCRIPT_URL}
          config={config}
          isDisabled={config?.id === undefined}
        />
        <Controls>
          <ControlsSection>
            <CategorySubHeader>{t("FileId")}</CategorySubHeader>
            <ControlsGroup>
              <LabelGroup>
                <Label className="label" text={t("Common:SelectFile")} />
              </LabelGroup>
              <FilesSelectorInputWrapper>
                <FilesSelectorInput
                  onSelectFile={onChangeFileId}
                  filterParam={FilesSelectorFilterTypes.ALL}
                  isSelect
                  isDocumentIcon
                />
              </FilesSelectorInputWrapper>
            </ControlsGroup>
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("CustomizingDisplay")}</CategorySubHeader>
            <WidthSetter
              t={t}
              setConfig={setConfig}
              dataDimensions={dimensionsModel}
              defaultDimension={defaultDimension}
              defaultWidth={defaultSize.width}
            />
            <HeightSetter
              t={t}
              setConfig={setConfig}
              dataDimensions={dimensionsModel}
              defaultDimension={defaultDimension}
              defaultHeight={defaultSize.height}
            />
            <FrameIdSetter
              t={t}
              defaultFrameId={config.frameId}
              setConfig={setConfig}
            />
          </ControlsSection>

          <Integration
            className="integration-examples"
            t={t}
            theme={theme}
            currentColorScheme={currentColorScheme}
          />
        </Controls>
      </Container>

      <Integration
        className="integration-examples integration-examples-bottom"
        t={t}
        theme={theme}
        currentColorScheme={currentColorScheme}
      />
    </PresetWrapper>
  );
};

export const Component = inject(({ settingsStore }) => {
  const { theme, currentColorScheme } = settingsStore;

  return {
    theme,
    currentColorScheme,
  };
})(
  withTranslation([
    "JavascriptSdk",
    "Files",
    "EmbeddingPanel",
    "Common",
    "CreateEditRoomDialog",
  ])(observer(Viewer)),
);
