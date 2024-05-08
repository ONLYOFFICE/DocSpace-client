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
import { Textarea } from "@docspace/shared/components/textarea";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { ComboBox } from "@docspace/shared/components/combobox";
import { TabsContainer } from "@docspace/shared/components/tabs-container";
import RoomsSelectorInput from "SRC_DIR/components/RoomsSelectorInput";
import { objectToGetParams, loadScript } from "@docspace/shared/utils/common";
import { inject, observer } from "mobx-react";

import { isTablet, isMobile } from "@docspace/shared/utils/device";

import { HelpButton } from "@docspace/shared/components/help-button";
import { Checkbox } from "@docspace/shared/components/checkbox";

import GetCodeDialog from "../sub-components/GetCodeDialog";
import { Button } from "@docspace/shared/components/button";

import EmptyIframeContainer from "../sub-components/EmptyIframeContainer";
import CodeBlock from "../sub-components/CodeBlock";

import { TooltipContent } from "../sub-components/TooltipContent";
import { useNavigate } from "react-router-dom";
import { Link } from "@docspace/shared/components/link";
import FilesFilter from "@docspace/shared/api/files/filter";

import { RoomsType } from "@docspace/shared/enums";

import TitleUrl from "PUBLIC_DIR/images/sdk-presets_title.react.svg?url";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_search.react.svg?url";

import TitleDarkUrl from "PUBLIC_DIR/images/sdk-presets_title_dark.png?url";
import SearchDarkUrl from "PUBLIC_DIR/images/sdk-presets_search_dark.png?url";

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
  LabelGroup,
  Frame,
  Container,
  Preview,
  GetCodeButtonWrapper,
  FilesSelectorInputWrapper,
  ControlsSection,
  CheckboxGroup,
} from "./StyledPresets";

const SimpleRoom = (props) => {
  const { t, setDocumentTitle, fetchExternalLinks, currentColorScheme, theme } =
    props;
  const navigate = useNavigate();

  setDocumentTitle(t("JavascriptSdk"));

  const scriptUrl = `${window.location.origin}/static/scripts/sdk/1.0.0/api.js`;

  const dataDimensions = [
    { key: "percent", label: "%", default: true },
    { key: "pixel", label: "px" },
  ];

  const defaultWidthDimension = dataDimensions[0],
    defaultHeightDimension = dataDimensions[0],
    defaultWidth = "100",
    defaultHeight = "100";

  const settingsTranslations = {
    password: t("Common:Password").toLowerCase(),
    denyDownload: t("FileContentCopy").toLowerCase(),
    expirationDate: t("LimitByTime").toLowerCase(),
  };

  const [isGetCodeDialogOpened, setIsGetCodeDialogOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(
    window.innerWidth > showPreviewThreshold,
  );
  const [sharedLinks, setSharedLinks] = useState(null);

  const [selectedLink, setSelectedLink] = useState(null);

  const [config, setConfig] = useState({
    mode: "manager",
    width: `${defaultWidth}${defaultWidthDimension.label}`,
    height: `${defaultHeight}${defaultHeightDimension.label}`,
    frameId: "ds-frame",
    showHeader: false,
    showTitle: true,
    showMenu: false,
    showFilter: true,
    disableActionButton: false,
    infoPanelVisible: false,
    init: false,
    filter: {
      count: 100,
      page: 1,
      sortorder: "descending",
      sortby: "DateAndTime",
      search: "",
      withSubfolders: false,
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
    loadFrame();
    return () => destroyFrame();
  });
  
  useEffect(() => {
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }, []);

  const onChangeTab = () => {
    loadFrame();
  };

  const onChangeFolderId = async (rooms) => {
    const publicRoom = rooms[0];

    let newConfig = {
      id: publicRoom.id,
      requestToken: null,
      rootPath: "/rooms/shared/",
    };

    const links = await fetchExternalLinks(publicRoom.id);

    if (links.length > 1) {
      const linksOptions = links.map((link) => {
        const { id, title, requestToken } = link.sharedTo;
        const linkSettings = [];

        if ("password" in link.sharedTo) {
          linkSettings.push("password");
        }
        if ("expirationDate" in link.sharedTo) {
          linkSettings.push("expirationDate");
        }
        if (link.sharedTo.denyDownload) {
          linkSettings.push("denyDownload");
        }

        return {
          key: id,
          label: title,
          requestToken: requestToken,
          settings: linkSettings,
        };
      });

      setSelectedLink(linksOptions[0]);
      setSharedLinks(linksOptions);
    }

    newConfig.requestToken = links[0].sharedTo?.requestToken;
    newConfig.rootPath = "/rooms/share";

    setConfig((config) => {
      return { ...config, ...newConfig, init: true };
    });
  };

  const onChangeSharedLink = (link) => {
    setSelectedLink(link);
    setConfig((config) => {
      return { ...config, requestToken: link.requestToken };
    });
  };

  const onChangeShowTitle = () => {
    setConfig((config) => {
      return { ...config, showTitle: !config.showTitle };
    });
  };

  const onChangeShowFilter = (e) => {
    setConfig((config) => {
      return { ...config, showFilter: !config.showFilter };
    });
  };

  const openGetCodeModal = () => setIsGetCodeDialogOpened(true);

  const closeGetCodeModal = () => setIsGetCodeDialogOpened(false);

  const onResize = () => {
    const isEnoughWidthForPreview = window.innerWidth > showPreviewThreshold;
    if (isEnoughWidthForPreview !== showPreview)
      setShowPreview(isEnoughWidthForPreview);
  };

  const navigateRoom = (id) => {
    const filter = FilesFilter.getDefault();
    filter.folder = id;
    navigate(`/rooms/shared/${id}/filter?${filter.toUrlParams()}`);
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
      {config.id !== undefined ? (
        <>
          <Box id={frameId}></Box>
        </>
      ) : (
        <EmptyIframeContainer
          text={t("RoomPreview")}
          width="100%"
          height="100%"
        />
      )}
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
      description={t("PublicRoomDescription")}
      header={t("CreateSamplePublicRoom")}
    >
      <Container>
        {showPreview && (
          <Preview>
            <TabsContainer
              isDisabled={config?.id === undefined}
              onSelect={onChangeTab}
              elements={dataTabs}
            />
          </Preview>
        )}
        <Controls>
          <ControlsSection>
            <CategorySubHeader>{t("DataDisplay")}</CategorySubHeader>
            <ControlsGroup>
              <LabelGroup>
                <Label className="label" text={t("Common:Room")} />
                <HelpButton
                  offsetRight={0}
                  size={12}
                  tooltipContent={
                    <Text fontSize="12px">{t("RoomOrFolderDescription")}</Text>
                  }
                />
              </LabelGroup>
              <FilesSelectorInputWrapper>
                <RoomsSelectorInput
                  roomType={RoomsType.PublicRoom}
                  withSearch
                  withCancelButton
                  onSubmit={onChangeFolderId}
                  withHeader
                  headerProps={{ headerLabel: t("Common:SelectAction") }}
                />
              </FilesSelectorInputWrapper>
            </ControlsGroup>
            {sharedLinks && (
              <ControlsGroup>
                <LabelGroup>
                  <Label
                    className="label"
                    text={t("SharingPanel:ExternalLink")}
                  />
                  <HelpButton
                    offsetRight={0}
                    size={12}
                    tooltipContent={
                      <Text fontSize="12px">
                        {t("CreateEditRoomDialog:PublicRoomDescription")}
                      </Text>
                    }
                  />
                </LabelGroup>
                <ComboBox
                  scaled={true}
                  onSelect={onChangeSharedLink}
                  options={sharedLinks}
                  selectedOption={selectedLink}
                  displaySelectedOption
                  directionY="bottom"
                />
                {selectedLink && selectedLink.settings.length === 1 ? (
                  <div>
                    <Text
                      className="linkHelp"
                      fontSize="12px"
                      lineHeight="16px"
                    >
                      {t("LinkSetDescription", {
                        parameter:
                          settingsTranslations[selectedLink.settings[0]],
                      })}
                    </Text>
                    <Link
                      color={currentColorScheme?.main?.accent}
                      fontSize="12px"
                      lineHeight="16px"
                      onClick={() => navigateRoom(config.id)}
                    >
                      {" "}
                      {t("GoToRoom")}.
                    </Link>
                  </div>
                ) : selectedLink.settings.length === 2 ? (
                  <div>
                    <Text
                      className="linkHelp"
                      fontSize="12px"
                      lineHeight="16px"
                    >
                      {t("LinkSetDescription2", {
                        parameter1:
                          settingsTranslations[selectedLink.settings[0]],
                        parameter2:
                          settingsTranslations[selectedLink.settings[1]],
                      })}
                    </Text>
                    <Link
                      color={currentColorScheme?.main?.accent}
                      fontSize="12px"
                      lineHeight="16px"
                      onClick={() => navigateRoom(config.id)}
                    >
                      {" "}
                      {t("GoToRoom")}.
                    </Link>
                  </div>
                ) : selectedLink.settings.length === 3 ? (
                  <div>
                    <Text
                      className="linkHelp"
                      fontSize="12px"
                      lineHeight="16px"
                    >
                      {t("LinkSetDescription3", {
                        parameter1:
                          settingsTranslations[selectedLink.settings[0]],
                        parameter2:
                          settingsTranslations[selectedLink.settings[1]],
                        parameter3:
                          settingsTranslations[selectedLink.settings[2]],
                      })}
                    </Text>
                    <Link
                      color={currentColorScheme?.main?.accent}
                      fontSize="12px"
                      lineHeight="16px"
                      onClick={() => navigateRoom(config.id)}
                    >
                      {" "}
                      {t("GoToRoom")}.
                    </Link>
                  </div>
                ) : (
                  <></>
                )}
              </ControlsGroup>
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
            <CategorySubHeader>{t("InterfaceElements")}</CategorySubHeader>

            <CheckboxGroup>
              <LabelGroup>
                <Checkbox
                  className="checkbox"
                  label={t("Common:Title")}
                  onChange={onChangeShowTitle}
                  isChecked={config.showTitle}
                />
                <HelpButton
                  place="right"
                  offsetRight={4}
                  size={12}
                  tooltipContent={
                    <TooltipContent
                      title={t("Common:Title")}
                      description={t("ManagerTitleDescription")}
                      img={theme.isBase ? TitleUrl : TitleDarkUrl}
                    />
                  }
                />
              </LabelGroup>
              <LabelGroup>
                <Checkbox
                  className="checkbox"
                  label={t("SearchFilterAndSort")}
                  onChange={onChangeShowFilter}
                  isChecked={config.showFilter}
                />
                <HelpButton
                  place="right"
                  offsetRight={4}
                  size={12}
                  tooltipContent={
                    <TooltipContent
                      title={t("SearchBlock")}
                      description={t("ManagerSearchBlockDescription")}
                      img={theme.isBase ? SearchUrl : SearchDarkUrl}
                    />
                  }
                />
              </LabelGroup>
            </CheckboxGroup>
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

export default inject(({ authStore, settingsStore, publicRoomStore }) => {
  const { setDocumentTitle } = authStore;
  const { theme, currentColorScheme } = settingsStore;
  const { fetchExternalLinks } = publicRoomStore;

  return {
    theme,
    setDocumentTitle,
    fetchExternalLinks,
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
  ])(observer(SimpleRoom)),
);
