import { useState, useEffect, useRef, useCallback } from "react";
import { withTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import { Box } from "@docspace/shared/components/box";
import { TextInput } from "@docspace/shared/components/text-input";
import { Textarea } from "@docspace/shared/components/textarea";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { TabsContainer } from "@docspace/shared/components/tabs-container";
import { SelectedItem } from "@docspace/shared/components/selected-item";
import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";
import { objectToGetParams, loadScript } from "@docspace/shared/utils/common";
import { inject, observer } from "mobx-react";

import { isTablet, isMobile } from "@docspace/shared/utils/device";

import { HelpButton } from "@docspace/shared/components/help-button";

import GetCodeDialog from "../sub-components/GetCodeDialog";
import { Button } from "@docspace/shared/components/button";
import { TooltipContent } from "../sub-components/TooltipContent";
import { useNavigate } from "react-router-dom";
import { Link } from "@docspace/shared/components/link";
import FilesFilter from "@docspace/shared/api/files/filter";

import LeftMenuUrl from "PUBLIC_DIR/images/sdk-presets_left-menu.react.svg?url";
import TitleUrl from "PUBLIC_DIR/images/sdk-presets_title.react.svg?url";
import ColumnsUrl from "PUBLIC_DIR/images/sdk-presets_columns.react.svg?url";
import ActionButtonUrl from "PUBLIC_DIR/images/sdk-presets_action-button.react.svg?url";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_search.react.svg?url";
import HeaderUrl from "PUBLIC_DIR/images/sdk-presets_header.react.svg?url";
import LeftMenuDarkUrl from "PUBLIC_DIR/images/sdk-presets_left-menu_dark.react.svg?url";
import TitleDarkUrl from "PUBLIC_DIR/images/sdk-presets_title_dark.react.svg?url";
import ColumnsDarkUrl from "PUBLIC_DIR/images/sdk-presets_columns_dark.react.svg?url";
import ActionButtonDarkUrl from "PUBLIC_DIR/images/sdk-presets_action-button_dark.react.svg?url";
import SearchDarkUrl from "PUBLIC_DIR/images/sdk-presets_search_dark.react.svg?url";
import HeaderDarkUrl from "PUBLIC_DIR/images/sdk-presets_header_dark.react.svg?url";

const showPreviewThreshold = 720;

// import { FilterType, RoomsType } from "@docspace/shared/enums";

// import { ToggleButton } from "@docspace/shared/components/toggle-button";

// import styled from "styled-components";
// import { DropDown } from "@docspace/shared/components/drop-down";
// import Filter from "@docspace/shared/api/people/filter";
// import { getUserList, getMembersList } from "@docspace/shared/api/people";
// import { DropDownItem } from "@docspace/shared/components/drop-down-item";
// import { Avatar } from "@docspace/shared/components/avatar";
// import Base from "@docspace/shared/themes/base";

// const UserInputContainer = styled.div`
//   position: relative;
//   display: flex;
//   align-items: center;
//   width: 100%;

//   .header_aside-panel {
//     max-width: 100% !important;
//   }
// `;

// const UserInput = styled.div`
//   width: 100%;
//   width: -moz-available;
//   width: -webkit-fill-available;
//   width: fill-available;

//   .input-link {
//     height: 32px;

//     > input {
//       height: 30px;
//     }
//   }
// `;

// const StyledDropDown = styled(DropDown)`
//   ${(props) => props.width && `width: ${props.width}px`};
//   left: 0;

//   .list-item {
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     height: 48px;

//     .list-item_content {
//       text-overflow: ellipsis;
//       overflow: hidden;
//     }
//   }
// `;

// const SearchItemText = styled(Text)`
//   line-height: 16px;

//   text-overflow: ellipsis;
//   overflow: hidden;
//   font-size: ${(props) =>
//     props.theme.getCorrectFontSize(props.primary ? "14px" : props.info ? "11px" : "12px")};
//   font-weight: ${(props) => (props.primary || props.info ? "600" : "400")};

//   color: ${(props) =>
//     (props.primary && !props.disabled) || props.info
//       ? props.theme.text.color
//       : props.theme.text.emailColor};
//   ${(props) => props.info && `margin-left: auto`}
// `;

// SearchItemText.defaultProps = { theme: Base };

// const minSearchValue = 3;

import {
  SDKContainer,
  Controls,
  CategoryHeader,
  CategorySubHeader,
  CategoryDescription,
  ControlsGroup,
  LabelGroup,
  ControlsSection,
  Frame,
  Container,
  RowContainer,
  ColumnContainer,
  Preview,
  GetCodeButtonWrapper,
  FilesSelectorInputWrapper,
  SelectedItemsContainer,
  CheckboxGroup,
  CodeWrapper,
} from "./StyledPresets";

const Manager = (props) => {
  const { t, setDocumentTitle, fetchExternalLinks, theme, currentColorScheme } =
    props;
  const navigate = useNavigate();

  setDocumentTitle(t("JavascriptSdk"));

  const scriptUrl = `${window.location.origin}/static/scripts/api.js`;

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

  const dataDimensions = [
    { key: "percent", label: "%", default: true },
    { key: "pixel", label: "px" },
  ];

  const columnDisplayOptions = [
    { value: "default", label: t("DefaultColumnsOption") },
    { value: "custom", label: t("SetItUp") },
  ];

  const [columnsOptions, setColumnsOptions] = useState([
    { key: "Owner", label: t("Common:Owner") },
    { key: "Activity", label: t("Files:ByLastModified") },
  ]);

  const settingsTranslations = {
    password: t("Common:Password").toLowerCase(),
    denyDownload: t("FileContentCopy").toLowerCase(),
    expirationDate: t("LimitByTime").toLowerCase(),
  };

  // const roomTypeOptions = [
  //   {
  //     key: "room-type-collaboration",
  //     label: t("CreateEditRoomDialog:CollaborationRoomTitle"),
  //     roomType: RoomsType.EditingRoom,
  //   },
  //   { key: "room-type-public", label: t("Files:PublicRoom"), roomType: RoomsType.PublicRoom },
  //   {
  //     key: "room-type-custom",
  //     label: t("CreateEditRoomDialog:CustomRoomTitle"),
  //     roomType: RoomsType.CustomRoom,
  //   },
  // ];

  // const filterOptions = [
  //   { key: "filter-type-all", label: t("Files:AllFiles"), typeKey: FilterType.FilesOnly },
  //   {
  //     key: "filter-type-documents",
  //     label: t("Common:Documents"),
  //     typeKey: FilterType.DocumentsOnly,
  //   },
  //   {
  //     key: "filter-type-folders",
  //     label: t("Translations:Folders"),
  //     typeKey: FilterType.FoldersOnly,
  //   },
  //   {
  //     key: "filter-type-spreadsheets",
  //     label: t("Translations:Spreadsheets"),
  //     typeKey: FilterType.SpreadsheetsOnly,
  //   },
  //   { key: "filter-type-archives", label: t("Files:Archives"), typeKey: FilterType.ArchiveOnly },
  //   {
  //     key: "filter-type-presentations",
  //     label: t("Translations:Presentations"),
  //     typeKey: FilterType.PresentationsOnly,
  //   },
  //   { key: "filter-type-images", label: t("Filse:Images"), typeKey: FilterType.ImagesOnly },
  //   { key: "filter-type-media", label: t("Files:Media"), typeKey: FilterType.MediaOnly },
  //   {
  //     key: "filter-type-forms-templates",
  //     label: t("Files:FormsTemplates"),
  //     typeKey: FilterType.OFormTemplateOnly,
  //   },
  //   { key: "filter-type-forms", label: t("Files:Forms"), typeKey: FilterType.OFormOnly },
  // ];

  const [sortBy, setSortBy] = useState(dataSortBy[0]);
  const [sortOrder, setSortOrder] = useState(dataSortOrder[0]);
  const [widthDimension, setWidthDimension] = useState(dataDimensions[0]);
  const [heightDimension, setHeightDimension] = useState(dataDimensions[0]);
  const [width, setWidth] = useState("100");
  const [height, setHeight] = useState("100");
  const [withSubfolders, setWithSubfolders] = useState(false);
  const [isGetCodeDialogOpened, setIsGetCodeDialogOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(
    window.innerWidth > showPreviewThreshold,
  );
  const [sharedLinks, setSharedLinks] = useState(null);
  const [columnDisplay, setColumnDisplay] = useState(
    columnDisplayOptions[0].value,
  );
  const [selectedColumns, setSelectedColumns] = useState([
    { key: "Name", label: t("Common:Name") },
    { key: "Type", label: t("Common:Type") },
    { key: "Tags", label: t("Common:Tags") },
  ]);

  const [selectedLink, setSelectedLink] = useState(null);

  // const [filterBy, setFilterBy] = useState({
  //   key: "filter-type-default",
  //   label: t("Common:SelectAction"),
  //   default: true,
  // });
  // const [author, setAuthor] = useState("");

  // const searchRef = useRef();
  // const [searchPanelVisible, setSearchPanelVisible] = useState(false);
  // const [usersList, setUsersList] = useState([]);
  // const dropDownMaxHeight = usersList.length > 5 ? { maxHeight: 240 } : {};
  // const [isUserFilterSet, setIsUserFilterSet] = useState(false);
  // const [isTypeFilterSet, setIsTypeFilterSet] = useState(false);
  // const [selectedUser, setSelectedUser] = useState(null);
  // const [selectedType, setSelectedType] = useState(null);

  const [config, setConfig] = useState({
    mode: "manager",
    width: `${width}${widthDimension.label}`,
    height: `${height}${heightDimension.label}`,
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
    return () => destroyFrame();
  });

  const onChangeTab = () => {
    loadFrame();
  };

  const onChangeWidth = (e) => {
    setConfig((config) => {
      return { ...config, width: `${e.target.value}${widthDimension.label}` };
    });

    setWidth(e.target.value);
  };

  const onChangeHeight = (e) => {
    setConfig((config) => {
      return { ...config, height: `${e.target.value}${heightDimension.label}` };
    });

    setHeight(e.target.value);
  };

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
    // setAuthor("");
    // setUsersList([]);
    // setIsUserFilterSet(false);
    // setIsTypeFilterSet(false);

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

  const onChangeFrameId = (e) => {
    setConfig((config) => {
      return { ...config, frameId: e.target.value };
    });
  };

  const onChangeWithSubfolders = (e) => {
    setConfig((config) => {
      return { ...config, withSubfolders: !withSubfolders };
    });

    setWithSubfolders(!withSubfolders);
  };

  const onChangeSortBy = (item) => {
    setConfig((config) => {
      return { ...config, sortby: item.key };
    });

    setSortBy(item);
  };

  const onChangeSortOrder = (item) => {
    setConfig((config) => {
      return { ...config, sortorder: item.key };
    });

    setSortOrder(item);
  };

  const onChangeWidthDimension = (item) => {
    setConfig((config) => {
      return { ...config, width: `${width}${item.label}` };
    });

    setWidthDimension(item);
  };

  const onChangeHeightDimension = (item) => {
    setConfig((config) => {
      return { ...config, height: `${height}${item.label}` };
    });

    setHeightDimension(item);
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

  const onChangeCount = (e) => {
    setConfig((config) => {
      return { ...config, count: e.target.value };
    });
  };

  const onChangePage = (e) => {
    setConfig((config) => {
      return { ...config, page: e.target.value };
    });
  };

  const onChangeSearch = (e) => {
    setConfig((config) => {
      return { ...config, search: e.target.value };
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

  const openGetCodeModal = () => setIsGetCodeDialogOpened(true);

  const closeGetCodeModal = () => setIsGetCodeDialogOpened(false);

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

  const onResize = () => {
    const isEnoughWidthForPreview = window.innerWidth > showPreviewThreshold;
    if (isEnoughWidthForPreview !== showPreview)
      setShowPreview(isEnoughWidthForPreview);
  };

  // const onFilterSelect = (option) => {
  //   setFilterBy(option);
  //   setConfig((config) => ({
  //     ...config,
  //     filter: {
  //       ...config.filter,
  //       filterType: option.typeKey,
  //     },
  //   }));
  // };

  // const closeInviteInputPanel = (e) => {
  //   if (e?.target?.tagName?.toUpperCase() === "INPUT") return;

  //   setSearchPanelVisible(false);
  // };

  // const openInviteInputPanel = () => {
  //   setSearchPanelVisible(true);
  // };

  // const onKeyDown = (event) => {
  //   const keyCode = event.code;

  //   const isAcceptableEvents =
  //     keyCode === "ArrowUp" || keyCode === "ArrowDown" || keyCode === "Enter";

  //   if (isAcceptableEvents && author.length > 2) return;

  //   event.stopPropagation();
  // };

  // const searchByQuery = async (value) => {
  //   const query = value.trim();

  //   if (query.length >= minSearchValue) {
  //     const filter = Filter.getFilterWithOutDisabledUser();
  //     filter.search = query;

  //     // const users = await getMembersList(roomId, filter);
  //     const users = await getUserList(filter);

  //     setUsersList(users.items);
  //   }

  //   if (!query) {
  //     closeInviteInputPanel();
  //     setInputValue("");
  //     setUsersList([]);
  //   }
  // };

  // const debouncedSearch = useCallback(
  //   debounce((value) => searchByQuery(value), 300),
  //   [],
  // );

  // const onChangeAuthor = (e) => {
  //   const value = e.target.value;
  //   const clearValue = value.trim();

  //   setAuthor(value);

  //   if (clearValue.length < minSearchValue) {
  //     setUsersList([]);
  //     return;
  //   }

  //   if ((!!usersList.length || clearValue.length >= minSearchValue) && !searchPanelVisible) {
  //     openInviteInputPanel();
  //   }

  //   debouncedSearch(clearValue);
  // };
  // const getItemContent = (item) => {
  //   const { avatar, displayName, email, id } = item;

  //   const addUser = () => {
  //     closeInviteInputPanel();
  //     setAuthor("");
  //     setUsersList([]);
  //     setSelectedUser(displayName);
  //     setConfig((config) => ({
  //       ...config,
  //       filter:
  //         "id" in config
  //           ? { ...config.filter, authorType: `user_${item.id}` }
  //           : { ...config.filter, subjectId: item.id },
  //     }));
  //   };

  //   return (
  //     <DropDownItem key={id} onClick={addUser} height={48} heightTablet={48} className="list-item">
  //       <Avatar size="min" role="user" source={avatar} />
  //       <div className="list-item_content">
  //         <SearchItemText primary>{displayName}</SearchItemText>
  //         <SearchItemText>{email}</SearchItemText>
  //       </div>
  //     </DropDownItem>
  //   );
  // };

  // const foundUsers = usersList.map((user) => getItemContent(user));

  // const toggleMembers = (e) => {
  //   if (!e.target.checked) {
  //     const filtered = { ...config.filter };
  //     delete filtered.subjectId;
  //     setConfig((config) => ({ ...config, filter: filtered }));
  //   }
  //   setIsUserFilterSet(e.target.checked);
  // };

  // const toggleAuthor = (e) => {
  //   if (!e.target.checked) {
  //     const filtered = { ...config.filter };
  //     delete filtered.authorType;
  //     setConfig((config) => ({ ...config, filter: filtered }));
  //   }
  //   setIsUserFilterSet(e.target.checked);
  // };

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
        config.id !== undefined && widthDimension.label === "px"
          ? width + widthDimension.label
          : undefined
      }
      height={
        config.id !== undefined && heightDimension.label === "px"
          ? height + heightDimension.label
          : undefined
      }
      targetId={frameId}
    >
      <Box id={frameId}></Box>
    </Frame>
  );

  const code = (
    <CodeWrapper
      width={width + widthDimension.label}
      height={height + heightDimension.label}
    >
      <CategorySubHeader className="copy-window-code">
        {t("CopyWindowCode")}
      </CategorySubHeader>
      <Textarea value={codeBlock} heightTextArea={153} />
    </CodeWrapper>
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
    <SDKContainer>
      <CategoryDescription>
        <Text className="sdk-description">{t("CustomDescription")}</Text>
      </CategoryDescription>
      <CategoryHeader>{t("CreateSampleDocSpace")}</CategoryHeader>
      <Container>
        {showPreview && (
          <Preview>
            <TabsContainer onSelect={onChangeTab} elements={dataTabs} />
          </Preview>
        )}
        <Controls>
          <ControlsSection>
            <CategorySubHeader>{t("CustomizingDisplay")}</CategorySubHeader>
            <ControlsGroup>
              <Label className="label" text={t("EmbeddingPanel:Width")} />
              <RowContainer combo>
                <TextInput
                  onChange={onChangeWidth}
                  placeholder={t("EnterWidth")}
                  value={width}
                  tabIndex={2}
                />
                <ComboBox
                  size="content"
                  scaled={false}
                  scaledOptions={true}
                  onSelect={onChangeWidthDimension}
                  options={dataDimensions}
                  selectedOption={widthDimension}
                  displaySelectedOption
                  directionY="bottom"
                />
              </RowContainer>
            </ControlsGroup>
            <ControlsGroup>
              <Label className="label" text={t("EmbeddingPanel:Height")} />
              <RowContainer combo>
                <TextInput
                  onChange={onChangeHeight}
                  placeholder={t("EnterHeight")}
                  value={height}
                  tabIndex={3}
                />
                <ComboBox
                  size="content"
                  scaled={false}
                  scaledOptions={true}
                  onSelect={onChangeHeightDimension}
                  options={dataDimensions}
                  selectedOption={heightDimension}
                  displaySelectedOption
                  directionY="bottom"
                />
              </RowContainer>
            </ControlsGroup>
            <ControlsGroup>
              <Label className="label" text={t("FrameId")} />
              <TextInput
                scale={true}
                onChange={onChangeFrameId}
                placeholder={t("EnterId")}
                value={config.frameId}
                tabIndex={4}
              />
            </ControlsGroup>
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
                      description={t("HeaderDescription")}
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
                      {t("LinkSettings", {
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
                      {t("LinkSettings2", {
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
                      {t("LinkSettings3", {
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
            <CategorySubHeader>{t("AdvancedDisplay")}</CategorySubHeader>
            {/* <ControlsGroup>
            {"id" in config ? (
              <>
                <Label className="label" text={t("Files:Filter")} />
                <ToggleButton
                  className="toggle"
                  label={t("Files:ByAuthor")}
                  onChange={toggleAuthor}
                  isChecked={isUserFilterSet}
                />
                {isUserFilterSet && (
                  <UserInputContainer>
                    <UserInput ref={searchRef}>
                      <TextInput
                        scale
                        onChange={onChangeAuthor}
                        placeholder={t("Common:Search")}
                        value={author}
                        onFocus={openInviteInputPanel}
                        isAutoFocussed
                        onKeyDown={onKeyDown}
                        tabIndex={5}
                      />
                    </UserInput>
                    {author.length >= minSearchValue && (
                      <StyledDropDown
                        width={searchRef?.current?.offsetWidth}
                        isDefaultMode={false}
                        open={searchPanelVisible}
                        manualX="16px"
                        showDisabledItems
                        clickOutsideAction={closeInviteInputPanel}
                        eventTypes="click"
                        {...dropDownMaxHeight}
                      >
                        {!!usersList.length ? foundUsers : ""}
                      </StyledDropDown>
                    )}
                  </UserInputContainer>
                )}
                <ToggleButton
                  className="toggle"
                  label={t("Common:Type")}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      const filtered = { ...config.filter };
                      delete filtered.filterType;
                      setConfig((config) => ({ ...config, filter: filtered }));
                    }
                    setIsTypeFilterSet(e.target.checked);
                  }}
                  isChecked={isTypeFilterSet}
                />
                {isTypeFilterSet && (
                  <ComboBox
                    onSelect={onFilterSelect}
                    options={filterOptions}
                    scaled
                    selectedOption={filterBy}
                    displaySelectedOption
                    directionY="top"
                  />
                )}
              </>
            ) : (
              <>
                <Label className="label" text={t("Files:Filter")} />
                <ToggleButton
                  className="toggle"
                  label={t("Common:Member")}
                  onChange={toggleMembers}
                  isChecked={isUserFilterSet}
                />
                {isUserFilterSet && (
                  <>
                    {"subjectId" in config.filter ? (
                      <SelectedItem
                        onClick={() => {
                          const filtered = { ...config.filter };
                          delete filtered.subjectId;
                          setConfig((config) => ({ ...config, filter: filtered }));
                        }}
                        onClose={() => {}}
                        label={selectedUser}
                      />
                    ) : (
                      <UserInputContainer>
                        <UserInput ref={searchRef}>
                          <TextInput
                            scale
                            onChange={onChangeAuthor}
                            placeholder={t("Common:Search")}
                            value={author}
                            onFocus={openInviteInputPanel}
                            isAutoFocussed
                            onKeyDown={onKeyDown}
                            tabIndex={5}
                          />
                        </UserInput>
                        {author.length >= minSearchValue && (
                          <StyledDropDown
                            width={searchRef?.current?.offsetWidth}
                            isDefaultMode={false}
                            open={searchPanelVisible}
                            manualX="16px"
                            showDisabledItems
                            clickOutsideAction={closeInviteInputPanel}
                            eventTypes="click"
                            {...dropDownMaxHeight}
                          >
                            {!!usersList.length ? foundUsers : ""}
                          </StyledDropDown>
                        )}
                      </UserInputContainer>
                    )}

                    <Checkbox
                      className="checkbox"
                      label={t("Translations:SearchByOwner")}
                      onChange={(e) => {
                        setConfig((config) => ({
                          ...config,
                          filter: { ...config.filter, subjectFilter: e.target.checked ? 0 : 1 },
                        }));
                      }}
                      isChecked={false}
                    />
                  </>
                )}
                <ToggleButton
                  className="toggle"
                  label={t("Common:Type")}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      const filtered = { ...config.filter };
                      delete filtered.type;
                      setConfig((config) => ({ ...config, filter: filtered }));
                    }
                    setIsTypeFilterSet(e.target.checked);
                  }}
                  isChecked={isTypeFilterSet}
                />
                {isTypeFilterSet &&
                  ("type" in config.filter ? (
                    <SelectedItem
                      onClick={() => {
                        const filtered = { ...config.filter };
                        delete filtered.type;
                        setConfig((config) => ({ ...config, filter: filtered }));
                      }}
                      onClose={() => {}}
                      label={selectedType}
                    />
                  ) : (
                    <ComboBox
                      onSelect={(option) => {
                        setConfig((config) => ({
                          ...config,
                          filter: { ...config.filter, type: option.roomType },
                        }));
                        setSelectedType(option.label);
                      }}
                      options={roomTypeOptions}
                      scaled={true}
                      selectedOption={filterBy}
                      displaySelectedOption
                      directionY="top"
                    />
                  ))}
              </>
            )}
          </ControlsGroup> */}
            <ControlsGroup>
              <Label className="label" text={t("SearchTerm")} />
              <ColumnContainer>
                <TextInput
                  scale={true}
                  onChange={onChangeSearch}
                  placeholder={t("Common:Search")}
                  value={config.search}
                  tabIndex={5}
                />
                <Checkbox
                  className="checkbox"
                  label={t("Files:WithSubfolders")}
                  onChange={onChangeWithSubfolders}
                  isChecked={withSubfolders}
                />
              </ColumnContainer>
            </ControlsGroup>
            <ControlsGroup>
              <Label className="label" text={t("Common:SortBy")} />
              <ComboBox
                onSelect={onChangeSortBy}
                options={dataSortBy}
                scaled={true}
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
                scaled={true}
                selectedOption={sortOrder}
                displaySelectedOption
                directionY="top"
              />
            </ControlsGroup>
            <ControlsGroup>
              <LabelGroup>
                <Label className="label" text={t("ItemsCount")} />
                <HelpButton
                  offsetRight={0}
                  size={12}
                  tooltipContent={
                    <Text fontSize="12px">{t("ItemsCountDescription")}</Text>
                  }
                />
              </LabelGroup>
              <TextInput
                scale={true}
                onChange={onChangeCount}
                placeholder={t("EnterCount")}
                value={config.count}
                tabIndex={6}
              />
            </ControlsGroup>
            <ControlsGroup>
              <Label className="label" text={t("Page")} />
              <TextInput
                scale={true}
                onChange={onChangePage}
                placeholder={t("EnterPage")}
                value={config.page}
                isDisabled={!config.count}
                tabIndex={7}
              />
            </ControlsGroup>
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
                  scaled={true}
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
    </SDKContainer>
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
  ])(observer(Manager)),
);
