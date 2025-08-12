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

import { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import SDK from "@onlyoffice/docspace-sdk-js";

import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import { Label } from "@docspace/shared/components/label";
import { RoomsType } from "@docspace/shared/enums";
import { getSdkScriptUrl, loadScript } from "@docspace/shared/utils/common";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import {
  defaultDimension,
  defaultSize,
  dimensionsModel,
  sdkSource,
  sdkVersion,
} from "../constants";

import { CancelTextInput } from "../sub-components/CancelTextInput";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import Integration from "../sub-components/Integration";
import { MainElementParameter } from "../sub-components/MainElementParameter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { PreviewBlock } from "../sub-components/PreviewBlock";
import { SelectTextInput } from "../sub-components/SelectTextInput";
import { VersionSelector } from "../sub-components/VersionSelector";
import { WidthSetter } from "../sub-components/WidthSetter";

import {
  CategorySubHeader,
  Container,
  Controls,
  ControlsSection,
  Frame,
} from "./StyledPresets";

const RoomSelector = (props) => {
  const { t, theme } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const roomTypeOptions = [
    {
      key: "room-type-all",
      label: t("AllTypes"),
      roomType: undefined,
      default: true,
      // dataTestId: "room_type_all_option",
    },
    {
      key: "room-filling-form-collaboration",
      label: t("Common:FormFilingRoomTitle"),
      roomType: RoomsType.FormRoom,
      // dataTestId: "room_type_form_option",
    },
    {
      key: "room-type-collaboration",
      label: t("Common:CollaborationRoomTitle"),
      roomType: RoomsType.EditingRoom,
      // dataTestId: "room_type_editing_option",
    },
    {
      key: "room-type-public",
      label: t("Common:PublicRoom"),
      roomType: RoomsType.PublicRoom,
      // dataTestId: "room_type_public_option",
    },
    {
      key: "room-type-custom",
      label: t("Common:CustomRoomTitle"),
      roomType: RoomsType.CustomRoom,
      // dataTestId: "room_type_custom_option",
    },
    {
      key: "room-type-ai",
      label: t("Common:AIRoomTitle"),
      roomType: RoomsType.AIRoom,
    },
  ];

  const [version, onSetVersion] = useState(sdkVersion[210]);

  const [source, onSetSource] = useState(sdkSource.Package);

  const [roomType, setRoomType] = useState(roomTypeOptions[0]);

  const [config, setConfig] = useState({
    src: window.location.origin,
    mode: "room-selector",
    width: `${defaultSize.width}${defaultDimension.label}`,
    height: `${defaultSize.height}${defaultDimension.label}`,
    frameId: "ds-frame",
    init: true,
    showSelectorCancel: true,
    showSelectorHeader: true,
    withSearch: true,
    acceptButtonLabel: t("Common:SelectAction"),
    cancelButtonLabel: t("Common:CancelButton"),
    isButtonMode: false,
    buttonWithLogo: true,
    events: {
      onSelectCallback: (items) => {
        console.log("onSelectCallback", items);
      },
      onCloseCallback: null,
      onAppReady: null,
      onAppError: (e) => console.log("onAppError", e),
      onEditorCloseCallback: null,
      onAuthSuccess: null,
      onSignOut: null,
    },
  });

  const fromPackage = source === sdkSource.Package;

  const sdkScriptUrl = getSdkScriptUrl(version);

  const sdk = fromPackage ? new SDK() : window.DocSpace.SDK;

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

  const changeRoomType = (option) => {
    setRoomType(option);
    setConfig((oldConfig) => ({ ...oldConfig, roomType: option.roomType }));
  };

  const toggleWithSearch = () => {
    setConfig((oldConfig) => ({
      ...oldConfig,
      withSearch: !config.withSearch,
    }));
  };

  const preview = (
    <Frame
      width={config.width.includes("px") ? config.width : undefined}
      height={config.height.includes("px") ? config.height : undefined}
      targetId={config.frameId}
    >
      <div id={config.frameId} />
    </Frame>
  );

  return (
    <PresetWrapper
      description={t("RoomSelectorDescription")}
      header={t("CreateSampleRoomSelector")}
    >
      <Container>
        <PreviewBlock
          loadCurrentFrame={initFrame}
          preview={preview}
          theme={theme}
          frameId={config.frameId}
          scriptUrl={sdkScriptUrl}
          config={config}
        />
        <Controls>
          <VersionSelector
            t={t}
            onSetSource={onSetSource}
            onSetVersion={onSetVersion}
          />
          <MainElementParameter
            t={t}
            config={config}
            setConfig={setConfig}
            isButtonMode={config.isButtonMode}
          />

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

          <ControlsSection>
            <Label className="label">{t("InterfaceElements")}</Label>
            <Checkbox
              className="checkbox"
              label={t("Common:Search")}
              onChange={toggleWithSearch}
              isChecked={config.withSearch}
              dataTestId="search_checkbox"
            />
            <SelectTextInput t={t} config={config} setConfig={setConfig} />
            <CancelTextInput t={t} config={config} setConfig={setConfig} />
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("AdvancedDisplay")}</CategorySubHeader>

            <Label className="label" text={t("RoomTypeDisplay")} />
            <ComboBox
              onSelect={changeRoomType}
              options={roomTypeOptions}
              scaled
              selectedOption={roomType}
              displaySelectedOption
              directionY="top"
              dataTestId="room_type_combobox"
              dropDownTestId="room_type_dropdown"
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
  const { theme } = settingsStore;

  return {
    theme,
  };
})(
  withTranslation([
    "JavascriptSdk",
    "Files",
    "EmbeddingPanel",
    "Common",
    "CreateEditRoomDialog",
  ])(observer(RoomSelector)),
);
