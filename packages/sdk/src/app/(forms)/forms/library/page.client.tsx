// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { observer } from "mobx-react";

import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import { useLibraryNavigationStore } from "../../_store/LibraryNavigationStore";
import useLibraryData from "../../_hooks/useLibraryData";
import FormsGrid from "../../_components/forms-grid";

const LibraryPage = () => {
  const formsSettingsStore = useFormsSettingsStore();
  const libraryNav = useLibraryNavigationStore();
  const { fetchLibrarySection, fetchMore } = useLibraryData();

  // Fetch when navigation changes (language selected, subfolder opened/closed)
  const fetchRef = React.useRef(fetchLibrarySection);
  fetchRef.current = fetchLibrarySection;
  React.useEffect(() => {
    fetchRef.current();
  }, [libraryNav.languageFolder, libraryNav.folderPath.length]);

  // Back button trap: intercept browser Back to navigate up folder levels.
  // Push a single history entry when entering depth > 0, then re-push on
  // each popstate to keep the trap active. No extra entries are added on
  // deeper navigation — the single sentinel is reused.
  // Back button trap: intercept browser Back to navigate up folder levels.
  // Push a single sentinel history entry on 0→1 transition. The popstate
  // handler re-pushes it while depth > 1 and consumes it on 1→0.
  const prevDepthRef = React.useRef(0);
  React.useEffect(() => {
    const depth = libraryNav.depth;
    const prevDepth = prevDepthRef.current;
    prevDepthRef.current = depth;

    // Entered a subfolder from root — push one sentinel entry
    if (depth > 0 && prevDepth === 0) {
      history.pushState({ libraryTrap: true }, "", window.location.href);
    }

    if (depth === 0) return;

    const handlePopState = () => {
      // Going from depth 2+ → still inside subfolders, keep the trap
      if (libraryNav.depth > 1) {
        history.pushState({ libraryTrap: true }, "", window.location.href);
      }
      // depth 1 → 0: sentinel is consumed by this popstate, no re-push needed
      libraryNav.goBack();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [libraryNav.depth, libraryNav]);

  return (
    <FormsGrid
      filesSettings={formsSettingsStore.filesSettings!}
      fetchMore={fetchMore}
    />
  );
};

export default observer(LibraryPage);
