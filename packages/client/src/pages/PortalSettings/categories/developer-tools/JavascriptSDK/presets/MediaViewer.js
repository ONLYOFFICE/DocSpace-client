/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState, useEffect, useMemo } from "react";
import { useEventLog } from "../sub-components/useEventLog";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { Label } from "@onlyoffice/apps-ui-kit/components/label";
import { HelpButton } from "@onlyoffice/apps-ui-kit/components/help-button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { loadScript, getSdkScriptUrl } from "@docspace/shared/utils/common";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";

import SDK from "@onlyoffice/docspace-sdk-js";

import { WidthSetter } from "../sub-components/WidthSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { PreviewBlock } from "../sub-components/PreviewBlock";
import { VersionSelector } from "../sub-components/VersionSelector";
import { EventLogBlock } from "../sub-components/EventLogBlock";

import {
  dimensionsModel,
  defaultSize,
  defaultDimension,
  sdkSource,
  sdkVersion,
} from "../constants";

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

const MEDIA_VIEWER_EVENT_TYPES = [
  "onAppReady",
  "onAppError",
  "onAuthSuccess",
  "onSignOut",
  "onNoAccess",
  "onNotFound",
  "onContentReady",
];

const MediaViewer = (props) => {
  const { t, theme, myFolderId, fetchTreeFolders } = props;

  setDocumentTitle(t("Settings:EmbedSDK"));

  const [version, onSetVersion] = useState(sdkVersion[230]);
  const [source, onSetSource] = useState(sdkSource.Package);

  const [config, setConfig] = useState({
    src: window.location.origin,
    mode: "media-viewer",
    width: `${defaultSize.width}${defaultDimension.label}`,
    height: `${defaultSize.height}${defaultDimension.label}`,
    frameId: "ds-frame",
    init: true,
    id: myFolderId,
    events: {
      onAppReady: () => {},
      onAppError: () => {},
      onAuthSuccess: () => {},
      onSignOut: () => {},
      onNoAccess: () => {},
      onNotFound: () => {},
      onContentReady: () => {},
    },
  });

  const fromPackage = source === sdkSource.Package;

  const sdkScriptUrl = getSdkScriptUrl(version);

  const sdk = useMemo(
    () => (fromPackage ? new SDK() : window.DocSpace.SDK),
    [fromPackage],
  );

  const destroyFrame = () => {
    sdk?.frames[config.frameId]?.destroyFrame();
  };

  const initFrame = () => {
    setTimeout(() => sdk?.init(config), 0);
  };

  useEffect(() => {
    const script = document.getElementById("sdk-script");

    if (script) {
      script.remove();
      destroyFrame();
    }

    if (!fromPackage) {
      loadScript(sdkScriptUrl, "sdk-script");
    }

    return () => {
      destroyFrame();
      setTimeout(() => script?.remove(), 10);
    };
  }, [source, version]);

  useEffect(() => {
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    if (!myFolderId) {
      fetchTreeFolders();
    } else {
      setConfig((oldConfig) => ({ ...oldConfig, id: myFolderId }));
    }
  }, [myFolderId, fetchTreeFolders]);

  useEffect(() => {
    initFrame();

    return () => {
      destroyFrame();
    };
  }, [config]);

  const [eventLog, onClearEventLog] = useEventLog(config.frameId);

  const onChangeFolderId = (folderId) => {
    setConfig((oldConfig) => ({ ...oldConfig, id: folderId, init: true }));
  };

  const preview = (
    <>
      <Frame
        width={config.width.includes("px") ? config.width : undefined}
        height={config.height.includes("px") ? config.height : undefined}
        targetId={config.frameId}
      >
        <div id={config.frameId} />
      </Frame>
      <EventLogBlock
        t={t}
        events={eventLog}
        onClear={onClearEventLog}
        eventTypes={MEDIA_VIEWER_EVENT_TYPES}
      />
    </>
  );

  return (
    <PresetWrapper
      description={t("MediaViewerDescription")}
      header={t("CreateSampleMediaViewer")}
    >
      <Container>
        <PreviewBlock
          loadCurrentFrame={initFrame}
          preview={preview}
          theme={theme}
          frameId={config.frameId}
          scriptUrl={sdkScriptUrl}
          config={config}
          isDisabled={config?.id === undefined}
        />
        <Controls>
          <VersionSelector
            t={t}
            onSetSource={onSetSource}
            onSetVersion={onSetVersion}
          />
          <ControlsSection>
            <CategorySubHeader>{t("RoomOrFolder")}</CategorySubHeader>
            <ControlsGroup>
              <LabelGroup>
                <Label className="label" text={t("Common:SelectFolder")} />
                <HelpButton
                  offsetRight={0}
                  size={12}
                  place="right-end"
                  tooltipContent={
                    <Text fontSize="12px">{t("RoomOrFolderDescription")}</Text>
                  }
                  dataTestId="room_or_folder_help_button"
                />
              </LabelGroup>
              <FilesSelectorInputWrapper>
                {config.id && (
                  <FilesSelectorInput
                    key={config.id}
                    id={config.id}
                    onSelectFolder={onChangeFolderId}
                    isSelect
                  />
                )}
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
        </Controls>
      </Container>
    </PresetWrapper>
  );
};

export const Component = inject(({ settingsStore, treeFoldersStore }) => {
  const { theme } = settingsStore;
  const { myFolderId, fetchTreeFolders } = treeFoldersStore;

  return {
    theme,
    myFolderId,
    fetchTreeFolders,
  };
})(
  withTranslation([
    "JavascriptSdk",
    "Settings",
    "Files",
    "Common",
    "CreateEditRoomDialog",
  ])(observer(MediaViewer)),
);
