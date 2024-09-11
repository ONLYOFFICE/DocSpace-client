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
import debounce from "lodash.debounce";
import { Box } from "@docspace/shared/components/box";
import { Label } from "@docspace/shared/components/label";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import { inject, observer } from "mobx-react";

import { RoomsType } from "@docspace/shared/enums";

import { toastr } from "@docspace/shared/components/toast";

import { WidthSetter } from "../sub-components/WidthSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { SelectTextInput } from "../sub-components/SelectTextInput";
import { CancelTextInput } from "../sub-components/CancelTextInput";
import { MainElementParameter } from "../sub-components/MainElementParameter";
import { PreviewBlock } from "../sub-components/PreviewBlock";
import { Integration } from "../sub-components/Integration";
import { loadFrame } from "../utils";

import {
  dataDimensions,
  defaultWidthDimension,
  defaultHeightDimension,
  defaultWidth,
  defaultHeight,
} from "../constants";

import {
  Controls,
  CategorySubHeader,
  ControlsSection,
  Frame,
  Container,
} from "./StyledPresets";
import { SDK_SCRIPT_URL } from "@docspace/shared/constants";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const RoomSelector = (props) => {
  const { t, theme, currentColorScheme } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const roomTypeOptions = [
    {
      key: "room-type-all",
      label: t("AllTypes"),
      roomType: undefined,
      default: true,
    },
    {
      key: "room-filling-form-collaboration",
      label: t("Common:FormFilingRoomTitle"),
      roomType: RoomsType.FormRoom,
    },
    {
      key: "room-type-collaboration",
      label: t("Common:CollaborationRoomTitle"),
      roomType: RoomsType.EditingRoom,
    },
    {
      key: "room-type-public",
      label: t("Common:PublicRoom"),
      roomType: RoomsType.PublicRoom,
    },
    {
      key: "room-type-custom",
      label: t("Common:CustomRoomTitle"),
      roomType: RoomsType.CustomRoom,
    },
  ];

  const [roomType, setRoomType] = useState(roomTypeOptions[0]);

  const debouncedOnSelect = debounce((items) => {
    // toastr.success(items[0].label);
  }, 0);

  const [config, setConfig] = useState({
    mode: "room-selector",
    width: `${defaultWidth}${defaultWidthDimension.label}`,
    height: `${defaultHeight}${defaultHeightDimension.label}`,
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
      onSelectCallback: debouncedOnSelect,
      onCloseCallback: null,
      onAppReady: null,
      onAppError: (e) => console.log("onAppError", e),
      onEditorCloseCallback: null,
      onAuthSuccess: null,
      onSignOut: null,
    },
  });

  const frameId = config.frameId || "ds-frame";

  const destroyFrame = () => {
    window.DocSpace?.SDK?.frames[frameId]?.destroyFrame();
  };

  const loadCurrentFrame = () => loadFrame(config, SDK_SCRIPT_URL);

  useEffect(() => {
    loadCurrentFrame();
    return destroyFrame;
  });

  useEffect(() => {
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }, []);

  const changeRoomType = (option) => {
    setRoomType(option);
    setConfig((config) => ({ ...config, roomType: option.roomType }));
  };

  const toggleWithSearch = () => {
    setConfig((config) => ({ ...config, withSearch: !config.withSearch }));
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
      targetId={frameId}
    >
      <Box id={frameId}></Box>
    </Frame>
  );

  return (
    <PresetWrapper
      description={t("RoomSelectorDescription")}
      header={t("CreateSampleRoomSelector")}
    >
      <Container>
        <PreviewBlock
          t={t}
          loadCurrentFrame={loadCurrentFrame}
          preview={preview}
          theme={theme}
          frameId={frameId}
          scriptUrl={SDK_SCRIPT_URL}
          config={config}
        />
        <Controls>
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
              dataDimensions={dataDimensions}
              defaultDimension={defaultWidthDimension}
              defaultWidth={defaultWidth}
            />
            <HeightSetter
              t={t}
              setConfig={setConfig}
              dataDimensions={dataDimensions}
              defaultDimension={defaultHeightDimension}
              defaultHeight={defaultHeight}
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
  ])(observer(RoomSelector)),
);
