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
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { SelectedItem } from "@docspace/shared/components/selected-item";
import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";
import { inject, observer } from "mobx-react";

import { HelpButton } from "@docspace/shared/components/help-button";

import { TooltipContent } from "../sub-components/TooltipContent";
import { useNavigate } from "react-router-dom";
import FilesFilter from "@docspace/shared/api/files/filter";

import LeftMenuUrl from "PUBLIC_DIR/images/sdk-presets_left-menu.react.svg?url";
import TitleUrl from "PUBLIC_DIR/images/sdk-presets_title.react.svg?url";
import ColumnsUrl from "PUBLIC_DIR/images/sdk-presets_columns.react.svg?url";
import ActionButtonUrl from "PUBLIC_DIR/images/sdk-presets_action-button.react.svg?url";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_search.react.svg?url";
import HeaderUrl from "PUBLIC_DIR/images/sdk-presets_header.react.svg?url";
import LeftMenuDarkUrl from "PUBLIC_DIR/images/sdk-presets_left-menu_dark.png?url";
import TitleDarkUrl from "PUBLIC_DIR/images/sdk-presets_title_dark.png?url";
import ColumnsDarkUrl from "PUBLIC_DIR/images/sdk-presets_columns_dark.png?url";
import ActionButtonDarkUrl from "PUBLIC_DIR/images/sdk-presets_action-button_dark.png?url";
import SearchDarkUrl from "PUBLIC_DIR/images/sdk-presets_search_dark.png?url";
import HeaderDarkUrl from "PUBLIC_DIR/images/sdk-presets_header_dark.png?url";

import { FilterBlock } from "../sub-components/FilterBlock";
import { WidthSetter } from "../sub-components/WidthSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { SharedLinkHint } from "../sub-components/SharedLinkHint";
import { SearchTerm } from "../sub-components/SearchTerm";
import { ItemsCountBlock } from "../sub-components/ItemsCountBlock";
import { DisplayPageBlock } from "../sub-components/DisplayPageBlock";
import { PreviewBlock } from "../sub-components/PreviewBlock";

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
  ControlsGroup,
  LabelGroup,
  ControlsSection,
  Frame,
  Container,
  ColumnContainer,
  FilesSelectorInputWrapper,
  SelectedItemsContainer,
  CheckboxGroup,
} from "./StyledPresets";
import { SDK_SCRIPT_URL } from "@docspace/shared/constants";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const Manager = (props) => {
  const { t, fetchExternalLinks, theme, currentColorScheme } = props;
  const navigate = useNavigate();

  setDocumentTitle(t("JavascriptSdk"));

  const dataSortBy = [
    { key: "DateAndTime", label: t("Common:LastModifiedDate"), default: true },
    { key: "AZ", label: t("Common:Title") },
    { key: "Type", label: t("Common:Type") },
    { key: "Size", label: t("Common:Size") },
    { key: "DateAndTimeCreation", label: t("Files:ByCreation") },
    { key: "Author", label: t("Files:ByAuthor") },
  ];

  const dataSortOrder = [
    { key: "descending", label: t("Descending"), default: true },
    { key: "ascending", label: t("Ascending") },
  ];

  const columnDisplayOptions = [
    { value: "default", label: t("DefaultColumnsOption") },
    { value: "custom", label: t("SetItUp") },
  ];

  const [columnsOptions, setColumnsOptions] = useState([
    { key: "Owner", label: t("Common:Owner") },
    { key: "Activity", label: t("Files:LastActivity") },
  ]);

  const [sortBy, setSortBy] = useState(dataSortBy[0]);
  const [sortOrder, setSortOrder] = useState(dataSortOrder[0]);
  const [sharedLinks, setSharedLinks] = useState(null);
  const [columnDisplay, setColumnDisplay] = useState(
    columnDisplayOptions[0].value,
  );
  const [selectedColumns, setSelectedColumns] = useState([
    { key: "Name", label: t("Common:Name") },
    { key: "Size", label: t("Common:Size") },
    { key: "Type", label: t("Common:Type") },
    { key: "Tags", label: t("Common:Tags") },
  ]);

  const [selectedLink, setSelectedLink] = useState(null);

  const [config, setConfig] = useState({
    mode: "manager",
    width: `${defaultWidth}${defaultWidthDimension.label}`,
    height: `${defaultHeight}${defaultHeightDimension.label}`,
    frameId: "ds-frame",
    showHeader: true,
    showTitle: true,
    showMenu: true,
    showFilter: true,
    disableActionButton: false,
    init: true,
    viewTableColumns: selectedColumns.map((column) => column.key).join(","),
    filter: {
      count: 100,
      page: 1,
      sortorder: "descending",
      sortby: "DateAndTime",
      search: "",
      withSubfolders: false,
    },
  });

  const frameId = config.frameId || "ds-frame";

  const destroyFrame = () => {
    window.DocSpace?.SDK?.frames[frameId]?.destroyFrame();
  };

  const loadCurrentFrame = () => loadFrame(config, SDK_SCRIPT_URL);

  useEffect(() => {
    loadCurrentFrame();
    return () => destroyFrame();
  });

  useEffect(() => {
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }, []);

  const onChangeFolderId = async (id, publicInPath) => {
    let newConfig = { id, requestToken: null, rootPath: "/rooms/shared/" };

    if (!!publicInPath) {
      const links = await fetchExternalLinks(publicInPath.id);

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
    } else {
      setSelectedLink(null);
      setSharedLinks(null);
    }

    setConfig((config) => {
      return { ...config, ...newConfig };
    });
  };

  const onChangeSharedLink = (link) => {
    setSelectedLink(link);
    setConfig((config) => {
      return { ...config, requestToken: link.requestToken };
    });
  };

  const onChangeSortBy = (item) => {
    setConfig((config) => {
      return { ...config, filter: { ...config.filter, sortby: item.key } };
    });

    setSortBy(item);
  };

  const onChangeSortOrder = (item) => {
    setConfig((config) => {
      return { ...config, filter: { ...config.filter, sortorder: item.key } };
    });

    setSortOrder(item);
  };

  const onChangeShowHeader = (e) => {
    setConfig((config) => {
      return { ...config, showHeader: !config.showHeader };
    });
  };

  const onChangeShowTitle = () => {
    setConfig((config) => {
      return { ...config, showTitle: !config.showTitle };
    });
  };

  const toggleShowSettings = () => {
    setConfig((config) => {
      return { ...config, showSettings: !config.showSettings };
    });
  };

  const toggleActionButton = () => {
    setConfig((config) => {
      return { ...config, disableActionButton: !config.disableActionButton };
    });
  };

  const onChangeShowMenu = (e) => {
    setConfig((config) => {
      return { ...config, showMenu: !config.showMenu };
    });
  };

  const onChangeShowFilter = (e) => {
    setConfig((config) => {
      return { ...config, showFilter: !config.showFilter };
    });
  };

  const changeColumnsOption = (e) => {
    if (e.target.value === "default") {
      setConfig((config) => ({
        ...config,
        viewTableColumns: "Name,Type,Tags",
      }));
    } else if (e.target.value === "custom") {
      setConfig((config) => ({
        ...config,
        viewTableColumns: selectedColumns.map((column) => column.key).join(","),
      }));
    }
    setColumnDisplay(e.target.value);
  };

  const onColumnSelect = (option) => {
    setColumnsOptions((prevColumnsOptions) =>
      prevColumnsOptions.filter((column) => column.key !== option.key),
    );
    if (!selectedColumns.find((column) => column.key === option.key)) {
      setConfig((config) => ({
        ...config,
        viewTableColumns: [...selectedColumns, option]
          .map((column) => column.key)
          .join(","),
      }));
      setSelectedColumns((prevSelectedColumns) => [
        ...prevSelectedColumns,
        option,
      ]);
    }
  };

  const deleteSelectedColumn = (option) => {
    setColumnsOptions((prevColumnsOptions) => [option, ...prevColumnsOptions]);
    const filteredColumns = selectedColumns.filter(
      (column) => column.key !== option.key,
    );
    setConfig((config) => ({
      ...config,
      viewTableColumns: filteredColumns.map((column) => column.key).join(","),
    }));
    setSelectedColumns(filteredColumns);
  };

  const navigateRoom = (id) => {
    const filter = FilesFilter.getDefault();
    filter.folder = id;
    navigate(`/rooms/shared/${id}/filter?${filter.toUrlParams()}`);
  };

  const redirectToSelectedRoom = () => navigateRoom(config.id);

  const preview = (
    <Frame
      width={config.width.includes("px") ? config.width : undefined}
      height={config.height.includes("px") ? config.height : undefined}
      targetId={frameId}
    >
      <Box id={frameId}></Box>
    </Frame>
  );

  return (
    <PresetWrapper
      description={t("CustomDescription", {
        productName: t("Common:ProductName"),
      })}
      header={t("CreateSamplePortal", { productName: t("Common:ProductName") })}
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
                  label={t("Menu")}
                  onChange={onChangeShowMenu}
                  isChecked={config.showMenu}
                />
                <HelpButton
                  place="right"
                  offsetRight={4}
                  size={12}
                  tooltipContent={
                    <TooltipContent
                      title={t("Menu")}
                      description={t("MenuDescription")}
                      img={theme.isBase ? LeftMenuUrl : LeftMenuDarkUrl}
                    />
                  }
                />
              </LabelGroup>

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
                  label={t("SettingUpColumns")}
                  onChange={toggleShowSettings}
                  isChecked={config.showSettings}
                />
                <HelpButton
                  place="right"
                  offsetRight={4}
                  size={12}
                  tooltipContent={
                    <TooltipContent
                      title={t("SettingUpColumns")}
                      description={t("SettingUpColumnsDescription")}
                      img={theme.isBase ? ColumnsUrl : ColumnsDarkUrl}
                    />
                  }
                />
              </LabelGroup>
              <LabelGroup>
                <Checkbox
                  className="checkbox"
                  label={t("ActionButton")}
                  onChange={toggleActionButton}
                  isChecked={!config.disableActionButton}
                />
                <HelpButton
                  place="right"
                  offsetRight={4}
                  size={12}
                  tooltipContent={
                    <TooltipContent
                      title={t("ActionButton")}
                      description={t("ActionButtonDescription")}
                      img={theme.isBase ? ActionButtonUrl : ActionButtonDarkUrl}
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
              <LabelGroup>
                <Checkbox
                  className="checkbox"
                  label={t("Header")}
                  onChange={onChangeShowHeader}
                  isChecked={config.showHeader}
                />
                <Text color="gray">{`(${t("MobileOnly")})`}</Text>
                <HelpButton
                  place="right"
                  offsetRight={4}
                  size={12}
                  tooltipContent={
                    <TooltipContent
                      title={t("Header")}
                      description={t("HeaderDescription", {
                        productName: t("Common:ProductName"),
                      })}
                      img={theme.isBase ? HeaderUrl : HeaderDarkUrl}
                    />
                  }
                />
              </LabelGroup>
            </CheckboxGroup>
          </ControlsSection>
          <ControlsSection>
            <CategorySubHeader>{t("DataDisplay")}</CategorySubHeader>
            <ControlsGroup>
              <LabelGroup>
                <Label className="label" text={t("RoomOrFolder")} />
                <HelpButton
                  offsetRight={0}
                  size={12}
                  tooltipContent={
                    <Text fontSize="12px">{t("RoomOrFolderDescription")}</Text>
                  }
                />
              </LabelGroup>
              <FilesSelectorInputWrapper>
                <FilesSelectorInput
                  onSelectFolder={onChangeFolderId}
                  isSelect
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
                        {t("Common:PublicRoomDescription")}
                      </Text>
                    }
                  />
                </LabelGroup>
                <ComboBox
                  scaled
                  onSelect={onChangeSharedLink}
                  options={sharedLinks}
                  selectedOption={selectedLink}
                  displaySelectedOption
                  directionY="bottom"
                />

                {selectedLink && (
                  <SharedLinkHint
                    t={t}
                    linkSettings={selectedLink.settings}
                    redirectToSelectedRoom={redirectToSelectedRoom}
                    currentColorScheme={currentColorScheme}
                  />
                )}
              </ControlsGroup>
            )}
          </ControlsSection>
          <ControlsSection>
            <CategorySubHeader>{t("AdvancedDisplay")}</CategorySubHeader>
            <ColumnContainer>
              <FilterBlock t={t} config={config} setConfig={setConfig} />
            </ColumnContainer>
            <ControlsGroup>
              <SearchTerm t={t} config={config} setConfig={setConfig} />
            </ControlsGroup>
            <ControlsGroup>
              <Label className="label" text={t("Common:SortBy")} />
              <ComboBox
                onSelect={onChangeSortBy}
                options={dataSortBy}
                scaled
                selectedOption={sortBy}
                displaySelectedOption
                directionY="top"
              />
            </ControlsGroup>
            <ControlsGroup>
              <Label className="label" text={t("SortOrder")} />
              <ComboBox
                onSelect={onChangeSortOrder}
                options={dataSortOrder}
                scaled
                selectedOption={sortOrder}
                displaySelectedOption
                directionY="top"
              />
            </ControlsGroup>
            <ItemsCountBlock
              t={t}
              count={config.filter.count}
              setConfig={setConfig}
            />
            <DisplayPageBlock t={t} config={config} setConfig={setConfig} />
            <Label className="label" text={t("DisplayColumns")} />
            <RadioButtonGroup
              orientation="vertical"
              options={columnDisplayOptions}
              name="columnsDisplayOptions"
              selected={columnDisplay}
              onClick={changeColumnsOption}
              spacing="8px"
            />
            {columnDisplay === "custom" && (
              <ControlsGroup>
                <ComboBox
                  onSelect={onColumnSelect}
                  options={
                    columnsOptions || {
                      key: "Select",
                      label: t("Common:SelectAction"),
                    }
                  }
                  scaled
                  directionY="top"
                  selectedOption={{
                    key: "Select",
                    label: t("Common:SelectAction"),
                  }}
                />

                <SelectedItemsContainer>
                  {selectedColumns.map((column) => (
                    <SelectedItem
                      key={column.key}
                      isDisabled={column.key === "Name"}
                      onClick={() => deleteSelectedColumn(column)}
                      onClose={() => {}}
                      label={column.label}
                    />
                  ))}
                </SelectedItemsContainer>
              </ControlsGroup>
            )}
          </ControlsSection>
        </Controls>
      </Container>
    </PresetWrapper>
  );
};

export default inject(({ settingsStore, publicRoomStore }) => {
  const { theme, currentColorScheme } = settingsStore;
  const { fetchExternalLinks } = publicRoomStore;

  return {
    theme,
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
  ])(observer(Manager)),
);
