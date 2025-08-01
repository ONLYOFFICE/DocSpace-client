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

import { useLocation } from "react-router";

import { Consumer } from "@docspace/shared/utils";
import { Nullable } from "@docspace/shared/types";

import { TabsEvent } from "@docspace/shared/components/tabs/PrimaryTabs";
import TopLoadingIndicator from "@docspace/shared/components/top-loading-indicator";

import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import { getContactsView } from "SRC_DIR/helpers/contacts";

import { SectionBodyContent } from "../Section";
import { ContactsSectionBodyContent } from "../Section";

import useContacts, { UseContactsProps } from "../Hooks/useContacts";

type ViewProps = UseContactsProps & {
  setIsChangePageRequestRunning: ClientLoadingStore["setIsChangePageRequestRunning"];
  setCurrentClientView: ClientLoadingStore["setCurrentClientView"];

  usersAbortController: Nullable<AbortController>;
  groupsAbortController: Nullable<AbortController>;
};

const View = ({
  scrollToTop,

  setSelectedNode,

  setContactsTab,
  getUsersList,

  getGroups,
  updateCurrentGroup,

  showGuestReleaseTip,
  setGuestReleaseTipDialogVisible,

  setIsChangePageRequestRunning,
  setCurrentClientView,

  usersAbortController,
  groupsAbortController,
}: ViewProps) => {
  const location = useLocation();

  const isContactsPage = location.pathname.includes("accounts");

  const [currentView, setCurrentView] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const startAnimationTimerRef = React.useRef<NodeJS.Timeout>(null);

  const { fetchContacts } = useContacts({
    isContactsPage,

    setContactsTab,

    scrollToTop,
    setSelectedNode,

    getUsersList,
    getGroups,
    updateCurrentGroup,

    showGuestReleaseTip,
    setGuestReleaseTipDialogVisible,
  });

  React.useEffect(() => {
    if (!isLoading) {
      TopLoadingIndicator.end();
      window.dispatchEvent(new CustomEvent(TabsEvent.END_ANIMATION));
      if (startAnimationTimerRef.current) {
        clearTimeout(startAnimationTimerRef.current);
      }
      startAnimationTimerRef.current = null;
    }

    if (isLoading) {
      const view = getContactsView();
      const tab = document.getElementById("contacts-tabs");

      if (!tab || view === "inside_group") {
        TopLoadingIndicator.start();

        return;
      }
      if (startAnimationTimerRef.current) {
        clearTimeout(startAnimationTimerRef.current);
        startAnimationTimerRef.current = null;
      }

      startAnimationTimerRef.current = setTimeout(() => {
        const event = new CustomEvent(TabsEvent.START_ANIMATION, {
          detail: {
            id: isContactsPage ? "contacts-tabs" : "files",
          },
        });

        window.dispatchEvent(event);
        startAnimationTimerRef.current = null;
      }, 500);
    }
  }, [isLoading, isContactsPage]);

  React.useEffect(() => {
    const getView = async () => {
      try {
        usersAbortController?.abort();
        groupsAbortController?.abort();

        setIsLoading(true);
        setIsChangePageRequestRunning(true);
        const view = await fetchContacts();

        if (view) {
          setCurrentView(view);
          setCurrentClientView(view);
        }
        setIsChangePageRequestRunning(false);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        if ((error as Error).message === "canceled") {
          return;
        }

        setIsChangePageRequestRunning(false);
        setIsLoading(false);
      }
    };

    getView();
  }, [location.pathname, location.search, fetchContacts]);

  return (
    <div
      style={{
        opacity: isLoading ? 0.5 : 1,
        pointerEvents: isLoading ? "none" : "auto",
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <Consumer>
        {(context) =>
          context.sectionWidth &&
          (currentView === "users" || currentView === "groups" ? (
            <ContactsSectionBodyContent
              sectionWidth={context.sectionWidth}
              currentView={currentView}
            />
          ) : (
            <SectionBodyContent sectionWidth={context.sectionWidth} />
          ))
        }
      </Consumer>
    </div>
  );
};

export const ViewComponent = inject(
  ({
    peopleStore,
    treeFoldersStore,
    settingsStore,
    dialogsStore,
    filesStore,
    clientLoadingStore,
  }: TStore) => {
    const { usersStore, groupsStore } = peopleStore;

    const {
      getUsersList,
      setContactsTab,
      abortController: usersAbortController,
    } = usersStore;

    const {
      getGroups,
      updateCurrentGroup,
      abortController: groupsAbortController,
    } = groupsStore!;

    const { setSelectedNode } = treeFoldersStore;

    const { showGuestReleaseTip } = settingsStore;

    const { setGuestReleaseTipDialogVisible } = dialogsStore;

    const { scrollToTop } = filesStore;

    const { setIsChangePageRequestRunning, setCurrentClientView } =
      clientLoadingStore;

    return {
      setContactsTab,
      getUsersList,
      getGroups,
      updateCurrentGroup,

      setSelectedNode,

      showGuestReleaseTip,
      setGuestReleaseTipDialogVisible,

      scrollToTop,

      setIsChangePageRequestRunning,
      setCurrentClientView,

      usersAbortController,
      groupsAbortController,
    };
  },
)(observer(View));
