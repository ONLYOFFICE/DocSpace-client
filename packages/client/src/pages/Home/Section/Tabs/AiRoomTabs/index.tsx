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

import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import { SectionSubmenuSkeleton } from "@docspace/shared/skeletons/sections";
import { Tabs, TTabItem } from "@docspace/shared/components/tabs";
import FilesFilter from "@docspace/shared/api/files/filter";
import { SearchArea } from "@docspace/shared/enums";

import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import AiRoomStore from "SRC_DIR/store/AiRoomStore";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";
import SelectedFolderStore from "SRC_DIR/store/SelectedFolderStore";

type AiRoomTabsProps = {
  id?: SelectedFolderStore["id"];

  showTabsLoader?: ClientLoadingStore["showTabsLoader"];
  setIsSectionBodyLoading?: ClientLoadingStore["setIsSectionBodyLoading"];

  currentTab?: AiRoomStore["currentTab"];
  setCurrentTab: AiRoomStore["setCurrentTab"];
};

const AiRoomTabs = ({
  id,

  showTabsLoader,
  setIsSectionBodyLoading,

  currentTab,
  setCurrentTab,
}: AiRoomTabsProps) => {
  const navigate = useNavigate();

  if (showTabsLoader)
    return <SectionSubmenuSkeleton style={{ marginBottom: 0 }} />;

  const onSelect = (tab: TTabItem) => {
    setCurrentTab(tab.id as "chat" | "knowledge" | "result");

    const filesFilter = FilesFilter.getDefault();

    filesFilter.folder = id?.toString() ?? "";

    if (tab.id === "chat") {
      const path = getCategoryUrl(CategoryType.Chat, id);

      filesFilter.searchArea = SearchArea.Any;

      navigate(`${path}?${filesFilter.toUrlParams()}`);
    } else {
      const path = getCategoryUrl(CategoryType.SharedRoom, id);

      filesFilter.searchArea =
        tab.id === "knowledge"
          ? SearchArea.Knowledge
          : SearchArea.ResultStorage;

      setIsSectionBodyLoading?.(true, true);

      navigate(`${path}?${filesFilter.toUrlParams()}`);
    }
  };

  const items: TTabItem[] = [
    {
      id: "chat",
      name: "AI-Chat",
      content: null,
    },
    {
      id: "knowledge",
      name: "Knowledge",
      content: null,
    },
    {
      id: "result",
      name: "Result Storage",
      content: null,
    },
  ];

  return (
    <Tabs
      className="ai-room-tabs"
      selectedItemId={currentTab ?? "chat"}
      items={items}
      onSelect={onSelect}
      withoutStickyIntend
    />
  );
};

export default inject(
  ({ clientLoadingStore, aiRoomStore, selectedFolderStore }: TStore) => {
    const { showTabsLoader, setIsSectionBodyLoading } = clientLoadingStore;

    const { currentTab, setCurrentTab } = aiRoomStore;

    const { id } = selectedFolderStore;

    return {
      id,

      showTabsLoader,
      setIsSectionBodyLoading,

      currentTab,
      setCurrentTab,
    };
  },
)(observer(AiRoomTabs));
