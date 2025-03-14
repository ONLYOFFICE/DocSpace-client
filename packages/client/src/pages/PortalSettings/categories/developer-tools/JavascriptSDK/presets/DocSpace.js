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

import { useState, useEffect, useCallback } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import SDK from "@onlyoffice/docspace-sdk-js";

import { SDK_SCRIPT_URL } from "@docspace/shared/constants";
import { loadScript } from "@docspace/shared/utils/common";
import { ViewSelector } from "@docspace/shared/components/view-selector";

import FromScriptUrl from "PUBLIC_DIR/images/code.react.svg?url";
import FromLibUrl from "PUBLIC_DIR/images/form.blank.react.svg?url";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { WidthSetter } from "../sub-components/WidthSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { PreviewBlock } from "../sub-components/PreviewBlock";
import Integration from "../sub-components/Integration";

import { dimensionsModel, defaultSize, defaultDimension } from "../constants";

import {
  Controls,
  CategorySubHeader,
  Frame,
  Container,
  ControlsSection,
} from "./StyledPresets";

const DocSpace = (props) => {
  const { t, theme, currentColorScheme } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const [fromPackage, setFromPackage] = useState(true);

  const [config, setConfig] = useState({
    src: window.location.origin,
    mode: "manager",
    width: `${defaultSize.width}${defaultDimension.label}`,
    height: `${defaultSize.height}${defaultDimension.label}`,
    frameId: "ds-frame",
    showHeader: true,
    showTitle: true,
    showMenu: true,
    showFilter: true,
    disableActionButton: false,
    infoPanelVisible: true,
    init: true,
    filter: {
      count: 100,
      page: 1,
      sortorder: "descending",
      sortby: "DateAndTime",
      search: "",
      withSubfolders: false,
    },
  });

  const sdk = fromPackage ? new SDK() : window.DocSpace.SDK;

  const destroyFrame = () => {
    sdk?.frames[config.frameId]?.destroyFrame();
  };

  const initFrame = () => {
    setTimeout(() => sdk?.init(config), 0);
  };

  useEffect(() => {
    const script = document.getElementById("sdk-script");

    if (!fromPackage && !script) {
      loadScript(SDK_SCRIPT_URL, "sdk-script");
    } else {
      script?.remove();
    }

    return () => {
      destroyFrame();
      setTimeout(() => script?.remove(), 10);
    };
  }, [fromPackage]);

  useEffect(() => {
    initFrame();

    return () => {
      destroyFrame();
    };
  });

  useEffect(() => {
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }, []);

  const surceSelectorData = [
    {
      id: "sdk-source-script",
      value: "script",
      icon: FromScriptUrl,
    },
    {
      id: "sdk-source-lib",
      value: "lib",
      icon: FromLibUrl,
    },
  ];

  const onChangeView = useCallback((view) => {
    setFromPackage(view === "lib");
  }, []);

  const preview = (
    <Frame
      width={config.width.includes("px") ? config.width : undefined}
      height={config.height.includes("px") ? config.height : undefined}
      targetId={config.frameId}
    >
      <ViewSelector
        onChangeView={onChangeView}
        viewAs={fromPackage}
        viewSettings={surceSelectorData}
        style={{ position: "absolute", right: "8px", top: "8px", zIndex: 10 }}
      />
      <div id={config.frameId} />
    </Frame>
  );

  return (
    <PresetWrapper
      description={t("PortalDescription", {
        productName: t("Common:ProductName"),
      })}
      header={t("CreateSamplePortal", {
        productName: t("Common:ProductName"),
      })}
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
          currentColorScheme={currentColorScheme}
        />
        <Controls>
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

          <Integration className="integration-examples" />
        </Controls>
      </Container>

      <Integration className="integration-examples integration-examples-bottom" />
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
    "Files",
    "Translations",
    "SharingPanel",
  ])(observer(DocSpace)),
);
