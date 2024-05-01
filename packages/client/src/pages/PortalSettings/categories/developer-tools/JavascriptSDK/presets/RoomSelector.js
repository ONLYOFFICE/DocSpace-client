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
import { TextInput } from "@docspace/shared/components/text-input";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import { TabsContainer } from "@docspace/shared/components/tabs-container";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { ColorInput } from "@docspace/shared/components/color-input";
import { objectToGetParams, loadScript } from "@docspace/shared/utils/common";
import { inject, observer } from "mobx-react";

import GetCodeDialog from "../sub-components/GetCodeDialog";
import { Button } from "@docspace/shared/components/button";

import { RoomsType } from "@docspace/shared/enums";

import { toastr } from "@docspace/shared/components/toast";

const showPreviewThreshold = 720;

import { WidthSetter } from "../sub-components/WidthSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { CodeToInsert } from "../sub-components/CodeToInsert";

import {
  Controls,
  CategorySubHeader,
  ControlsGroup,
  ControlsSection,
  Frame,
  Container,
  RowContainer,
  Preview,
  GetCodeButtonWrapper,
} from "./StyledPresets";

const RoomSelector = (props) => {
  const { t, setDocumentTitle, theme } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const scriptUrl = `${window.location.origin}/static/scripts/sdk/1.0.0/api.js`;

  const dataDimensions = [
    { key: "percent", label: "%", default: true },
    { key: "pixel", label: "px" },
  ];

  const elementDisplayOptions = [
    { value: "element", label: t("ElementItself") },
    {
      value: "button",
      label: (
        <RowContainer>
          {t("Common:Button")}
          <Text color="gray">{`(${t("ElementCalledAfterClicking")})`}</Text>
        </RowContainer>
      ),
    },
  ];

  const roomTypeOptions = [
    {
      key: "room-type-all",
      label: t("AllTypes"),
      roomType: undefined,
      default: true,
    },
    {
      key: "room-type-collaboration",
      label: t("CreateEditRoomDialog:CollaborationRoomTitle"),
      roomType: RoomsType.EditingRoom,
    },
    {
      key: "room-type-public",
      label: t("Files:PublicRoom"),
      roomType: RoomsType.PublicRoom,
    },
    {
      key: "room-type-custom",
      label: t("CreateEditRoomDialog:CustomRoomTitle"),
      roomType: RoomsType.CustomRoom,
    },
  ];

  const defaultWidthDimension = dataDimensions[0],
    defaultHeightDimension = dataDimensions[0],
    defaultWidth = "100",
    defaultHeight = "100";

  const [isGetCodeDialogOpened, setIsGetCodeDialogOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(
    window.innerWidth > showPreviewThreshold,
  );
  const [selectedElementType, setSelectedElementType] = useState(
    elementDisplayOptions[0].value,
  );
  const [roomType, setRoomType] = useState(roomTypeOptions[0]);

  const debouncedOnSelect = debounce((items) => {
    toastr.success(items[0].label);
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

  const params = objectToGetParams(config);

  const frameId = config.frameId || "ds-frame";

  const destroyFrame = () => {
    window.DocSpace?.SDK?.frames[frameId]?.destroyFrame();
  };

  const loadFrame = debounce(() => {
    const script = document.getElementById("integration");

    if (script) {
      script.remove();
    }

    const params = objectToGetParams(config);

    loadScript(`${scriptUrl}${params}`, "integration", () =>
      window.DocSpace.SDK.initFrame(config),
    );
  }, 500);

  useEffect(() => {
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
    loadFrame();
    return destroyFrame;
  });

  const toggleButtonMode = (e) => {
    setSelectedElementType(e.target.value);
    setConfig((config) => ({
      ...config,
      isButtonMode: e.target.value === "button",
    }));
  };

  const changeRoomType = (option) => {
    setRoomType(option);
    setConfig((config) => ({ ...config, roomType: option.roomType }));
  };

  const onChangeTab = () => {
    loadFrame();
  };

  const toggleWithSearch = () => {
    setConfig((config) => ({ ...config, withSearch: !config.withSearch }));
  };

  const onChangeAcceptLabel = (e) => {
    setConfig((config) => {
      return { ...config, acceptButtonLabel: e.target.value };
    });
  };

  const onChangeCancelLabel = (e) => {
    setConfig((config) => {
      return { ...config, cancelButtonLabel: e.target.value };
    });
  };

  const openGetCodeModal = () => setIsGetCodeDialogOpened(true);

  const closeGetCodeModal = () => setIsGetCodeDialogOpened(false);

  const onResize = () => {
    const isEnoughWidthForPreview = window.innerWidth > showPreviewThreshold;
    if (isEnoughWidthForPreview !== showPreview)
      setShowPreview(isEnoughWidthForPreview);
  };

  const setButtonColor = (color) => {
    setConfig((config) => ({ ...config, buttonColor: color }));
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [showPreview]);

  const codeBlock = `<div id="${frameId}">Fallback text</div>\n<script src="${scriptUrl}${params}"></script>`;

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

  const code = (
    <CodeToInsert t={t} theme={theme} codeBlock={codeBlock} config={config} />
  );

  const dataTabs = [
    {
      key: "preview",
      title: t("Common:Preview"),
      content: preview,
    },
    {
      key: "code",
      title: t("Code"),
      content: code,
    },
  ];

  return (
    <PresetWrapper
      description={t("RoomSelectorDescription")}
      header={t("CreateSampleRoomSelector")}
    >
      <Container>
        {showPreview && (
          <Preview>
            <TabsContainer onSelect={onChangeTab} elements={dataTabs} />
          </Preview>
        )}
        <Controls>
          <ControlsSection>
            <CategorySubHeader>{t("MainElementParameter")}</CategorySubHeader>
            <RadioButtonGroup
              orientation="vertical"
              options={elementDisplayOptions}
              name="elementDisplayInput"
              selected={selectedElementType}
              onClick={toggleButtonMode}
              spacing="8px"
            />
            {config.isButtonMode && (
              <>
                <CategorySubHeader>
                  {t("ButtonCustomization")}
                </CategorySubHeader>
                <ControlsGroup>
                  <Label className="label" text={t("ButtonColor")} />
                  <ColorInput
                    scale
                    handleChange={setButtonColor}
                    defaultColor={"#5299E0"}
                  />
                </ControlsGroup>
                <ControlsGroup>
                  <Label className="label" text={t("ButtonText")} />
                  <TextInput
                    scale
                    onChange={(e) => {
                      setConfig((config) => ({
                        ...config,
                        buttonText: e.target.value,
                      }));
                    }}
                    placeholder={t("SelectToDocSpace")}
                    value={config.buttonText}
                    tabIndex={3}
                  />
                  <Checkbox
                    className="checkbox"
                    label={t("Logo")}
                    onChange={() => {
                      setConfig((config) => ({
                        ...config,
                        buttonWithLogo: !config.buttonWithLogo,
                      }));
                    }}
                    isChecked={config.buttonWithLogo}
                  />
                </ControlsGroup>
              </>
            )}
          </ControlsSection>

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
            <Label className="label" text={t("SelectButtonText")} />
            <TextInput
              scale={true}
              onChange={onChangeAcceptLabel}
              placeholder={t("Common:SelectAction")}
              value={config.acceptButtonLabel}
              tabIndex={7}
            />
            <Label className="label" text={t("CancelButtonText")} />
            <TextInput
              scale={true}
              onChange={onChangeCancelLabel}
              placeholder={t("Common:CancelButton")}
              value={config.cancelButtonLabel}
              tabIndex={8}
            />
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("AdvancedDisplay")}</CategorySubHeader>

            <Label className="label" text={t("RoomTypeDisplay")} />
            <ComboBox
              onSelect={changeRoomType}
              options={roomTypeOptions}
              scaled={true}
              selectedOption={roomType}
              displaySelectedOption
              directionY="top"
            />
          </ControlsSection>
        </Controls>
      </Container>

      {!showPreview && (
        <>
          <GetCodeButtonWrapper>
            <Button
              id="get-sdk-code-button"
              primary
              size="normal"
              scale
              label={t("GetCode")}
              onClick={openGetCodeModal}
            />
          </GetCodeButtonWrapper>

          <GetCodeDialog
            t={t}
            visible={isGetCodeDialogOpened}
            codeBlock={codeBlock}
            onClose={closeGetCodeModal}
          />
        </>
      )}
    </PresetWrapper>
  );
};

export default inject(({ authStore, settingsStore }) => {
  const { setDocumentTitle } = authStore;
  const { theme } = settingsStore;

  return {
    theme,
    setDocumentTitle,
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
