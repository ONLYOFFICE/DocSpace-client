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
import { useTranslation } from "react-i18next";

import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { TRoom } from "@docspace/shared/api/rooms/types";
import ScrollbarContext from "@docspace/shared/components/scrollbar/custom-scrollbar/ScrollbarContext";
import { AnimationEvents } from "@docspace/shared/hooks/useAnimation";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import ShareLoader from "@docspace/shared/skeletons/share";
import { isFolder, isRoom } from "@docspace/shared/utils/typeGuards";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";
import { FolderType } from "@docspace/shared/enums";
import { LoaderWrapper } from "@docspace/shared/components/loader-wrapper";
import { useEventListener } from "@docspace/shared/hooks/useEventListener";
import { INFO_PANEL_LOADER_EVENT } from "@docspace/shared/constants";

import InfoPanelStore, { InfoPanelView } from "SRC_DIR/store/InfoPanelStore";
import PublicRoomStore from "SRC_DIR/store/PublicRoomStore";

import ItemTitle from "../../sub-components/ItemTitle";

import Details from "../Details";
import History from "../History";
import ThirdPartyComponent from "../History/HistoryBlockContent/ThirdParty";
import Members from "../Members";
import Share from "../Share";
import Plugin from "../Plugin";

import { useHistory } from "./hooks/useHistory";
import { useMembers } from "./hooks/useMembers";
import { useShare } from "./hooks/useShare";

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
  const { t } = useTranslation(["Common"]);
  const isThirdParty = "providerId" in selection && selection?.providerId;
  const currentViewRef = React.useRef<FilesViewProps["currentView"] | null>(
    null,
  );

  const [value, setValue] = React.useState<string | null>(null);
  const [prevSelectionId, setPrevSelectionId] = React.useState<string | null>(
    null,
  );

  const [isLoadingSuspense, setIsLoadingSuspense] = React.useState(false);

  const [isFirstLoadingSuspense, setIsFirstLoadingSuspense] =
    React.useState(true);

  const generatePrimaryLink = useEventCallback(() => {
    if (
      !selection ||
      isRoom(selection) ||
      !selection.canShare ||
      selection.shared
    )
      return;

    const parentRoomType = selection.parentRoomType;

    if (
      parentRoomType === FolderType.FormRoom ||
      parentRoomType === FolderType.PublicRoom
    )
      return ShareLinkService.getPrimaryLink(selection);
  });

  const {
    history,
    total: historyTotal,
    showLoading,
    isLoading,
    isFirstLoading: historyIsFirstLoading,
    fetchHistory,
    fetchMoreHistory,
    abortController,
  } = useHistory({
    selection,
    setExternalLinks: setExternalLinks!,
  });

  const {
    filesLink,
    shareMembers,
    fetchExternalLinks,
    abortController: shareAbortController,
  } = useShare({
    id: selection.id?.toString() || "",
    isFolder: isFolder(selection),
    generatePrimaryLink,
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
    handleSearchMembers,
    abortController: membersAbortController,
  } = useMembers({
    room: infoPanelRoomSelection!,
    isMembersPanelUpdating: isMembersPanelUpdating!,
    setIsMembersPanelUpdating: setIsMembersPanelUpdating!,
    setExternalLinks: setExternalLinks!,
    scrollToTop,
  });

  useEventListener(INFO_PANEL_LOADER_EVENT, (event: CustomEvent<boolean>) => {
    setIsLoadingSuspense(event.detail);
  });

  const onEndAnimation = React.useCallback(() => {
    const event = new CustomEvent(AnimationEvents.END_ANIMATION);

    window.dispatchEvent(event);
  }, []);

  const fetchValue = React.useCallback(
    async (v: FilesViewProps["currentView"]) => {
      currentViewRef.current = v;

      abortController.current?.abort();
      membersAbortController.current?.abort();
      shareAbortController.current?.abort();

      setIsLoadingSuspense(true);

      if (v === InfoPanelView.infoDetails) {
        if (currentViewRef.current !== v) return undefined;

        onEndAnimation();
        setIsLoadingSuspense(false);
        setIsFirstLoadingSuspense(false);

        return v;
      }

      if (v === InfoPanelView.infoHistory) {
        if (isThirdParty) {
          if (currentViewRef.current !== v) return undefined;

          setIsLoadingSuspense(false);
          setIsFirstLoadingSuspense(false);
          onEndAnimation();

          return v;
        }

        try {
          await fetchHistory();

          if (currentViewRef.current !== v) return undefined;

          setIsLoadingSuspense(false);
          setIsFirstLoadingSuspense(false);

          return v;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") {
            return undefined;
          }
          console.log(e);
          return undefined;
        }
      }

      if (v === InfoPanelView.infoMembers) {
        try {
          await fetchMembers();

          if (currentViewRef.current !== v) return undefined;

          scrollToTop();

          setIsLoadingSuspense(false);
          setIsFirstLoadingSuspense(false);

          return v;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") {
            return undefined;
          }
          console.log(e);
          return undefined;
        }
      }

      if (v === InfoPanelView.infoShare) {
        try {
          await fetchExternalLinks();

          if (currentViewRef.current !== v) return undefined;

          setIsLoadingSuspense(false);
          setIsFirstLoadingSuspense(false);

          return v;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") {
            return undefined;
          }
          console.log(e);
          return undefined;
        }
      }

      if (currentViewRef.current !== v) return undefined;

      setIsFirstLoadingSuspense(false);
      setIsLoadingSuspense(false);
      onEndAnimation();

      return v;
    },
    [
      abortController,
      membersAbortController,
      shareAbortController,
      fetchHistory,
      fetchMembers,
      fetchExternalLinks,
      scrollToTop,
      onEndAnimation,
      isThirdParty,
    ],
  );

  React.useEffect(() => {
    if (!isLoadingSuspense) {
      onEndAnimation();
    }
  }, [isLoadingSuspense, onEndAnimation]);

  React.useEffect(() => {
    if (currentView === value && selection.id?.toString() === prevSelectionId) {
      return;
    }

    fetchValue(currentView).then((v) => {
      if (!v || currentViewRef.current !== currentView) return;

      setPrevSelectionId(selection.id?.toString() || "");
      setValue(v);
    });
  }, [currentView, fetchValue, selection.id, prevSelectionId, value]);

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
      if (isRoom(selection)) return null;

      return (
        <Share
          members={shareMembers}
          fileLinkProps={filesLink}
          infoPanelSelection={selection}
        />
      );
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
          setSearchValue: handleSearchMembers,
          resetSearch: () => {
            handleSearchMembers("");
          },
        },
      }
    : {};

  return (
    <div data-testid="info_panel_files_view_container">
      <ItemTitle
        infoPanelSelection={
          isRoomMembersPanel
            ? { ...infoPanelRoomSelection!, isRoom: true }!
            : selection
        }
        {...roomMembersProps}
      />
      <LoaderWrapper
        isLoading={isLoadingSuspense}
        testId="info_panel_files_view_content"
      >
        {isFirstLoadingSuspense ? (
          currentView === InfoPanelView.infoShare ? (
            <ShareLoader t={t} />
          ) : (
            <InfoPanelViewLoader
              view={
                currentView === InfoPanelView.infoMembers
                  ? "members"
                  : currentView === InfoPanelView.infoHistory
                    ? "history"
                    : "details"
              }
              data-testid="info_panel_files_view_loader"
            />
          )
        ) : (
          <div
            data-testid={`info_panel_files_view_${value?.replace("info_", "")}`}
          >
            {getView()}
          </div>
        )}
      </LoaderWrapper>
    </div>
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
