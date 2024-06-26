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

import { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import debounce from "lodash.debounce";

import { FilterType, RoomsType } from "@docspace/shared/enums";

import Filter from "@docspace/shared/api/people/filter";
import { getUserList } from "@docspace/shared/api/people";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { Avatar } from "@docspace/shared/components/avatar";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Label } from "@docspace/shared/components/label";
import { TextInput } from "@docspace/shared/components/text-input";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { SelectedItem } from "@docspace/shared/components/selected-item";
import { ComboBox } from "@docspace/shared/components/combobox";

import { DropDown } from "@docspace/shared/components/drop-down";
import { Text } from "@docspace/shared/components/text";

import Base from "@docspace/shared/themes/base";

const UserInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  .header_aside-panel {
    max-width: 100% !important;
  }
`;

const UserInput = styled.div`
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: fill-available;

  .input-link {
    height: 32px;

    > input {
      height: 30px;
    }
  }
`;

const StyledDropDown = styled(DropDown)`
  ${(props) => props.width && `width: ${props.width}px`};
  left: 0;

  .list-item {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 48px;

    .list-item_content {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
`;

const SearchItemText = styled(Text)`
  line-height: 16px;

  text-overflow: ellipsis;
  overflow: hidden;
  font-size: ${(props) =>
    props.theme.getCorrectFontSize(
      props.primary ? "14px" : props.info ? "11px" : "12px",
    )};
  font-weight: ${(props) => (props.primary || props.info ? "600" : "400")};

  color: ${(props) =>
    (props.primary && !props.disabled) || props.info
      ? props.theme.text.color
      : props.theme.text.emailColor};
  ${(props) => props.info && `margin-left: auto`}
`;

SearchItemText.defaultProps = { theme: Base };

const minSearchValue = 3;

export const FilterBlock = ({ t, config, setConfig }) => {
  const roomTypeOptions = [
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

  const filterOptions = [
    {
      key: "filter-type-all",
      label: t("Files:AllFiles"),
      typeKey: FilterType.FilesOnly,
    },
    {
      key: "filter-type-documents",
      label: t("Common:Documents"),
      typeKey: FilterType.DocumentsOnly,
    },
    {
      key: "filter-type-folders",
      label: t("Translations:Folders"),
      typeKey: FilterType.FoldersOnly,
    },
    {
      key: "filter-type-spreadsheets",
      label: t("Translations:Spreadsheets"),
      typeKey: FilterType.SpreadsheetsOnly,
    },
    {
      key: "filter-type-archives",
      label: t("Files:Archives"),
      typeKey: FilterType.ArchiveOnly,
    },
    {
      key: "filter-type-presentations",
      label: t("Translations:Presentations"),
      typeKey: FilterType.PresentationsOnly,
    },
    {
      key: "filter-type-images",
      label: t("Filse:Images"),
      typeKey: FilterType.ImagesOnly,
    },
    {
      key: "filter-type-media",
      label: t("Files:Media"),
      typeKey: FilterType.MediaOnly,
    },
    {
      key: "filter-type-forms-templates",
      label: t("Files:FormsTemplates"),
      typeKey: FilterType.OFormTemplateOnly,
    },
    {
      key: "filter-type-forms",
      label: t("Files:Forms"),
      typeKey: FilterType.OFormOnly,
    },
  ];

  const [filterBy, setFilterBy] = useState({
    key: "filter-type-default",
    label: t("Common:SelectAction"),
    default: true,
  });

  const [author, setAuthor] = useState("");
  const searchRef = useRef();

  const [searchPanelVisible, setSearchPanelVisible] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const dropDownMaxHeight = usersList.length > 5 ? { maxHeight: 240 } : {};

  const [isUserFilterSet, setIsUserFilterSet] = useState(false);
  const [isTypeFilterSet, setIsTypeFilterSet] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const onFilterSelect = (option) => {
    setFilterBy(option);
    setConfig((config) => ({
      ...config,
      filter: {
        ...config.filter,
        filterType: option.typeKey,
      },
    }));
    setSelectedType(option.label);
  };

  const closeInviteInputPanel = (e) => {
    if (e?.target?.tagName?.toUpperCase() === "INPUT") return;

    setSearchPanelVisible(false);
  };

  const openInviteInputPanel = () => {
    setSearchPanelVisible(true);
  };

  const onKeyDown = (event) => {
    const keyCode = event.code;

    const isAcceptableEvents =
      keyCode === "ArrowUp" || keyCode === "ArrowDown" || keyCode === "Enter";

    if (isAcceptableEvents && author.length > 2) return;

    event.stopPropagation();
  };

  const searchByQuery = async (value) => {
    const query = value.trim();

    if (query.length >= minSearchValue) {
      const filter = Filter.getFilterWithOutDisabledUser();
      filter.search = query;

      const users = await getUserList(filter);

      setUsersList(users.items);
    }

    if (!query) {
      closeInviteInputPanel();
      setInputValue("");
      setUsersList([]);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => searchByQuery(value), 300),
    [],
  );

  const onChangeAuthor = (e) => {
    const query = e.target.value;
    const trimmedQuery = query.trim();

    setAuthor(query);

    if (trimmedQuery.length < minSearchValue) {
      setUsersList([]);
      return;
    }

    if (
      (usersList.length > 0 || trimmedQuery.length >= minSearchValue) &&
      !searchPanelVisible
    ) {
      openInviteInputPanel();
    }

    debouncedSearch(trimmedQuery);
  };

  const getItemContent = (item) => {
    const { avatar, displayName, email, id } = item;

    const addUser = () => {
      closeInviteInputPanel();
      setAuthor("");
      setUsersList([]);
      setSelectedUser(displayName);
      setConfig((config) => ({
        ...config,
        filter:
          "id" in config
            ? { ...config.filter, authorType: `user_${item.id}` }
            : { ...config.filter, subjectId: item.id },
      }));
    };

    return (
      <DropDownItem
        key={id}
        onClick={addUser}
        height={48}
        heightTablet={48}
        className="list-item"
      >
        <Avatar size="min" role="user" source={avatar} />
        <div className="list-item_content">
          <SearchItemText primary>{displayName}</SearchItemText>
          <SearchItemText>{email}</SearchItemText>
        </div>
      </DropDownItem>
    );
  };

  const foundUsers = usersList.map((user) => getItemContent(user));

  const clearConstructor = (filterProperty) => {
    return () => {
      const filtered = { ...config.filter };
      delete filtered[filterProperty];
      setConfig((config) => ({ ...config, filter: filtered }));
    };
  };

  const toggleConstructor = (clearProperty, setPropertyState) => {
    return (e) => {
      if (!e.target.checked) {
        clearProperty();
      }
      setPropertyState(e.target.checked);
    };
  };

  const clearMembers = clearConstructor("subjectId");
  const toggleMembers = toggleConstructor(clearMembers, setIsUserFilterSet);

  const clearAuthorType = clearConstructor("authorType");
  const toggleAuthor = toggleConstructor(clearAuthorType, setIsUserFilterSet);

  const clearFilterType = clearConstructor("filterType");
  const toggleFilterType = toggleConstructor(
    clearFilterType,
    setIsTypeFilterSet,
  );

  const clearType = clearConstructor("type");
  const toggleType = toggleConstructor(clearType, setIsTypeFilterSet);

  const toggleSubjectFilter = (e) => {
    setConfig((config) => ({
      ...config,
      filter: {
        ...config.filter,
        subjectFilter: e.target.checked ? 0 : 1,
      },
    }));
  };

  const selectRoomType = (option) => {
    setConfig((config) => ({
      ...config,
      filter: { ...config.filter, type: option.roomType },
    }));
    setSelectedType(option.label);
  };

  const clearFilter = () => {
    setAuthor("");
    setUsersList([]);
    setIsUserFilterSet(false);
    setIsTypeFilterSet(false);
  };

  useEffect(() => {
    clearFilter();
  }, [config.id]);

  return "id" in config ? (
    <>
      <Label className="label" text={t("FileFilter")} />
      <ToggleButton
        className="toggle"
        label={t("Files:ByAuthor")}
        onChange={toggleAuthor}
        isChecked={isUserFilterSet}
        isDisabled={!!config.requestToken}
      />
      {isUserFilterSet && (
        <>
          {"authorType" in config.filter ? (
            <SelectedItem
              onClick={clearAuthorType}
              onClose={() => {}}
              label={selectedUser}
            />
          ) : (
            <UserInputContainer>
              <UserInput ref={searchRef}>
                <TextInput
                  scale
                  onChange={onChangeAuthor}
                  placeholder={t("SearchByNameEmail")}
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
        </>
      )}
      <ToggleButton
        className="toggle"
        label={t("Common:Type")}
        onChange={toggleFilterType}
        isChecked={isTypeFilterSet}
        isDisabled={!!config.requestToken}
      />
      {isTypeFilterSet &&
        ("filterType" in config.filter ? (
          <SelectedItem
            onClick={clearFilterType}
            onClose={() => {}}
            label={selectedType}
          />
        ) : (
          <ComboBox
            onSelect={onFilterSelect}
            options={filterOptions}
            scaled
            selectedOption={filterBy}
            displaySelectedOption
            directionY="top"
          />
        ))}
    </>
  ) : (
    <>
      <Label className="label" text={t("RoomFilter")} />
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
              onClick={clearMembers}
              onClose={() => {}}
              label={selectedUser}
            />
          ) : (
            <UserInputContainer>
              <UserInput ref={searchRef}>
                <TextInput
                  scale
                  onChange={onChangeAuthor}
                  placeholder={t("SearchByNameEmail")}
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
            onChange={toggleSubjectFilter}
            isChecked={false}
          />
        </>
      )}
      <ToggleButton
        className="toggle"
        label={t("Common:Type")}
        onChange={toggleType}
        isChecked={isTypeFilterSet}
      />
      {isTypeFilterSet &&
        ("type" in config.filter ? (
          <SelectedItem
            onClick={clearType}
            onClose={() => {}}
            label={selectedType}
          />
        ) : (
          <ComboBox
            onSelect={selectRoomType}
            options={roomTypeOptions}
            scaled={true}
            selectedOption={filterBy}
            displaySelectedOption
            directionY="top"
          />
        ))}
    </>
  );
};
