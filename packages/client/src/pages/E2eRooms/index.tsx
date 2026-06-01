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

import React from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import SdkIframe, { type SdkIframeHandle } from "SRC_DIR/components/SdkIframe";

// Server identifies this solution as "e2e-rooms"; the SDK route group lives
// at /sdk/private (see packages/sdk/src/app/(private)/). The two names are
// kept distinct on purpose — "e2e-rooms" is the marketing / catalog name,
// while "private" is the runtime path that the rest of the encryption code
// already references.

const getSrc = (section: string): string =>
  section === "archive" ? "/sdk/private/archive" : "/sdk/private";

const E2eRooms = () => {
  const { t } = useTranslation(["Common"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const section =
    searchParams.get("section") === "archive" ? "archive" : "rooms";

  const apiRef = React.useRef<SdkIframeHandle | null>(null);

  const initialSrcRef = React.useRef(getSrc(section));

  const syncedSectionRef = React.useRef(section);

  const handleNavigate = React.useCallback(
    (sec: string) => {
      const normalized = sec === "archive" ? "archive" : "rooms";
      syncedSectionRef.current = normalized;
      setSearchParams(
        (prev) => {
          const cur =
            prev.get("section") === "archive" ? "archive" : "rooms";
          if (cur === normalized) return prev;
          const next = new URLSearchParams(prev);
          if (normalized === "archive") next.set("section", "archive");
          else next.delete("section");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  React.useEffect(() => {
    if (section === syncedSectionRef.current) return;
    syncedSectionRef.current = section;
    apiRef.current?.call("navigateSection", { section });
  }, [section]);

  return (
    <SdkIframe
      src={initialSrcRef.current}
      title={t("Common:DashboardE2eRoomsTitle")}
      onNavigate={handleNavigate}
      apiRef={apiRef}
    />
  );
};

export { E2eRooms };
export default E2eRooms;
