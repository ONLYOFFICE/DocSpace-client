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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { Consumer } from "@docspace/shared/utils";

import { SessionsTableProps } from "../SecuritySessions.types";

import TableView from "./TableView";
import RowView from "./RowView";

const SessionsTable = ({
  t,
  viewAs,
  userId,
  setSelection,
  setBufferSelection,
  sessionsData,
}: SessionsTableProps) => {
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (
        e.target instanceof Element &&
        ((e.target.closest(".scroll-body") &&
          !e.target.closest(".user-item") &&
          !e.target.closest(".not-selectable") &&
          !e.target.closest(".info-panel") &&
          !e.target.closest(".table-container_group-menu")) ||
          e.target.closest(".files-main-button") ||
          e.target.closest(".add-button") ||
          e.target.closest(".search-input-block"))
      ) {
        if (setSelection) setSelection([]);
        if (setBufferSelection) setBufferSelection(null);
        window?.getSelection()?.removeAllRanges();
      }
    };

    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [setSelection, setBufferSelection]);
  return (
    <Consumer>
      {(context) => {
        return viewAs === "table" ? (
          <TableView
            t={t}
            userId={userId}
            sectionWidth={context.sectionWidth as number}
            sessionsData={sessionsData}
          />
        ) : (
          <RowView
            t={t}
            sectionWidth={context.sectionWidth as number}
            sessionsData={sessionsData}
          />
        );
      }}
    </Consumer>
  );
};

export default inject<TStore>(({ setup, userStore, activeSessionsStore }) => {
  const userId = userStore.user?.id ?? null;
  const { viewAs } = setup;
  const { setSelection, setBufferSelection } = activeSessionsStore;

  return {
    viewAs,
    userId,
    setSelection,
    setBufferSelection,
  };
})(observer(SessionsTable));
