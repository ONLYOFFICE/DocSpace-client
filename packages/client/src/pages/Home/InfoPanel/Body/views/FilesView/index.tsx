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

import React from "react";
import { inject, observer } from "mobx-react";

import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { TRoom } from "@docspace/shared/api/rooms/types";
import ScrollbarContext from "@docspace/shared/components/scrollbar/custom-scrollbar/ScrollbarContext";
import { TabsEvent } from "@docspace/shared/components/tabs/PrimaryTabs";

import InfoPanelStore, { InfoPanelView } from "SRC_DIR/store/InfoPanelStore";
import PublicRoomStore from "SRC_DIR/store/PublicRoomStore";

import { useLoader } from "../../helpers/useLoader";
import ItemTitle from "../../sub-components/ItemTitle";

import Details from "../Details";
import History from "../History";
import ThirdPartyComponent from "../History/HistoryBlockContent/ThirdParty";
import Members from "../Members";
import Share from "../Share";
import Plugin from "../Plugin";

import { useHistory } from "./hooks/useHistory";
import { useMembers } from "./hooks/useMembers";

type FilesViewProps = {
  currentView: InfoPanelView | `info_plugin-${string}`;
  selection: TRoom | TFile | TFolder;

  isArchive: boolean;

  setExternalLinks?: PublicRoomStore["setExternalLinks"];

  infoPanelRoomSelection?: InfoPanelStore["infoPanelRoomSelection"];
  isMembersPanelUpdating?: InfoPanelStore["isMembersPanelUpdating"];
  setIsMembersPanelUpdating?: InfoPanelStore["setIsMembersPanelUpdating"];
};

const FilesView = ({
  currentView,
  selection,
  isArchive,
  setExternalLinks,

  infoPanelRoomSelection,
  isMembersPanelUpdating,
  setIsMembersPanelUpdating,
}: FilesViewProps) => {
  const isThirdParty = "providerId" in selection && selection?.providerId;

  const [value, setValue] = React.useState<string | null>(null);

  const [isLoadingSuspense, setIsLoadingSuspense] = React.useState(false);

  const {
    history,
    total: historyTotal,
    showLoading,
    isLoading,
    isFirstLoading: historyIsFirstLoading,
    fetchHistory,
    fetchMoreHistory,
  } = useHistory({
    selection,
    setExternalLinks: setExternalLinks!,
  });

  const scrollContext = React.use(ScrollbarContext);

  const scrollToTop = React.useCallback(() => {
    scrollContext?.parentScrollbar?.scrollToTop();
  }, []);

  const {
    members,
    total: membersTotal,
    searchValue,
    isFirstLoading: membersIsFirstLoading,
    fetchMembers,
    fetchMoreMembers,
    changeUserRole,
    setSearchValue,
  } = useMembers({
    room: infoPanelRoomSelection!,
    isMembersPanelUpdating: isMembersPanelUpdating!,
    setIsMembersPanelUpdating: setIsMembersPanelUpdating!,
    setExternalLinks: setExternalLinks!,
    scrollToTop,
  });

  const fetchValue = async (v: FilesViewProps["currentView"]) => {
    if (v === InfoPanelView.infoDetails) {
      return v;
    }

    if (v === InfoPanelView.infoHistory) {
      if (isThirdParty) return v;

      setIsLoadingSuspense(true);

      await fetchHistory();

      setIsLoadingSuspense(false);

      return v;
    }

    if (v === InfoPanelView.infoMembers) {
      setIsLoadingSuspense(true);

      await fetchMembers();
      scrollToTop();

      setIsLoadingSuspense(false);

      return v;
    }

    return v;
  };

  const { showLoading: showLoadingSuspense } = useLoader({
    isFirstLoading: isLoadingSuspense,
  });

  React.useEffect(() => {
    const onStartAnimation = () => {
      const event = new CustomEvent(TabsEvent.START_ANIMATION, {
        detail: {
          infoPanel: true,
        },
      });
      window.dispatchEvent(event);
    };

    const onEndAnimation = () => {
      const event = new CustomEvent(TabsEvent.END_ANIMATION);

      window.dispatchEvent(event);
    };

    if (showLoadingSuspense) {
      onStartAnimation();
    } else {
      onEndAnimation();
    }
  }, [showLoadingSuspense]);

  React.useEffect(() => {
    fetchValue(currentView).then((v) => setValue(v));
  }, [currentView]);

  const getView = () => {
    if (value === InfoPanelView.infoDetails)
      return <Details selection={selection} isArchive={isArchive} />;

    if (value === InfoPanelView.infoHistory) {
      if (isThirdParty) return <ThirdPartyComponent />;

      return (
        <History
          infoPanelSelection={selection}
          history={history}
          total={historyTotal}
          showLoading={showLoading}
          isLoading={isLoading}
          isFirstLoading={historyIsFirstLoading}
          fetchHistory={fetchHistory}
          fetchMoreHistory={fetchMoreHistory}
        />
      );
    }

    if (value === InfoPanelView.infoMembers) {
      return (
        <Members
          members={members}
          total={membersTotal}
          searchValue={searchValue}
          isFirstLoading={membersIsFirstLoading}
          fetchMoreMembers={fetchMoreMembers}
          changeUserRole={changeUserRole}
          scrollToTop={scrollToTop}
        />
      );
    }

    if (value === InfoPanelView.infoShare) {
      if (!("fileExst" in selection)) return null;

      return <Share infoPanelSelection={selection} />;
    }

    // @ts-expect-error fixed after rewrite plugin to ts
    if (currentView.indexOf("info_plugin") > -1) return <Plugin />;

    return value;
  };

  const isRoomMembersPanel = value === InfoPanelView.infoMembers;

  const roomMembersProps = isRoomMembersPanel
    ? {
        isRoomMembersPanel,
        searchProps: {
          setSearchValue,
          resetSearch: () => {
            setSearchValue("");
          },
        },
      }
    : {};

  return (
    <>
      <ItemTitle
        infoPanelSelection={
          isRoomMembersPanel ? infoPanelRoomSelection! : selection
        }
        {...roomMembersProps}
      />
      <div style={{ opacity: isLoadingSuspense ? 0.5 : 1 }}>{getView()}</div>
    </>
  );
};

FilesView.displayName = "FilesView";

export default inject(({ publicRoomStore, infoPanelStore }: TStore) => {
  const { setExternalLinks } = publicRoomStore;

  const {
    infoPanelRoomSelection,
    isMembersPanelUpdating,
    setIsMembersPanelUpdating,
  } = infoPanelStore;

  return {
    infoPanelRoomSelection,

    setExternalLinks,

    isMembersPanelUpdating,
    setIsMembersPanelUpdating,
  };
})(observer(FilesView));
