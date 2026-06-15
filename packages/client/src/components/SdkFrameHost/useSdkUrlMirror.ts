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
import { useLocation, useNavigate } from "react-router";

import type { SdkNavigateExtra } from "./SdkFrameContext";

// SDK Next.js basePath (next.config.js). The host mirrors the SDK app's own
// pathname under its prefix, so the iframe `src` is `${SDK_BASE}${sdkPath}`.
export const SDK_BASE = "/sdk";

type UseSdkUrlMirrorArgs = {
  // Host route prefix this page owns, e.g. "/ai-files" or "/ai-rooms".
  hostPrefix: string;
  // SDK path to load for a bare prefix entry (no trailing segment), e.g.
  // "/personal-files" or "/rooms".
  defaultSdkPath: string;
};

type UseSdkUrlMirror = {
  // The iframe src derived from the current host URL — feed to useSdkFrame.
  src: string;
  // The src the SDK reported it is already on (echo guard for useSdkFrame).
  sdkOwnedSrc: string | null;
  // onNavigate handler for useSdkFrame: mirrors the SDK's pathname+search into
  // the host address bar.
  onNavigate: (section: string, extra?: SdkNavigateExtra) => void;
};

/**
 * Drives a direct-URL SDK host page (ai-files / ai-rooms). The host address
 * bar mirrors the SDK app's own pathname + search 1:1 under `hostPrefix`, so
 * the URL is a real direct filter URL — like the main client. The iframe
 * `src` is derived straight from the host URL; there is no `?section=`
 * indirection or `navigateSection` postMessage.
 *
 * Shared between ai-files and ai-rooms (they differ only in `hostPrefix` /
 * `defaultSdkPath`) so the proxy logic, echo guard and bare-entry redirect
 * stay in one place.
 */
export const useSdkUrlMirror = ({
  hostPrefix,
  defaultSdkPath,
}: UseSdkUrlMirrorArgs): UseSdkUrlMirror => {
  const location = useLocation();
  const navigate = useNavigate();

  // Bare prefix entry -> canonical default URL, preserving any query (e.g. a
  // deep link `/ai-files?folder=@trash`). The SDK fills in the default filter
  // and the bridge's first `onNavigate` canonicalizes the rest.
  React.useEffect(() => {
    if (location.pathname === hostPrefix) {
      navigate(`${hostPrefix}${defaultSdkPath}${location.search}`, {
        replace: true,
      });
    }
  }, [location.pathname, location.search, navigate, hostPrefix, defaultSdkPath]);

  // host location -> iframe src.
  //   "/ai-files/personal-files" + "?folder=@my" -> "/sdk/personal-files?folder=@my"
  const sdkPath = location.pathname.slice(hostPrefix.length) || defaultSdkPath;
  const src = `${SDK_BASE}${sdkPath}${location.search ?? ""}`;

  // Echo guard: when the SDK reports its OWN navigation we mirror it into the
  // address bar, but must not push that src back into the iframe (it would
  // reload the page the SDK just navigated to). `sdkOwnedSrc` holds the src
  // the SDK reported on the render that mirrored it; it is cleared as soon as
  // the host adopts it, so a LATER host-driven navigation (Back, sidebar) to
  // the same URL is not mistaken for an echo.
  const [sdkOwnedSrc, setSdkOwnedSrc] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (sdkOwnedSrc != null && sdkOwnedSrc === src) setSdkOwnedSrc(null);
  }, [sdkOwnedSrc, src]);

  const onNavigate = React.useCallback(
    (_section: string, extra?: SdkNavigateExtra) => {
      if (!extra?.pathname) return;
      const search = extra.search ? `?${extra.search}` : "";
      setSdkOwnedSrc(`${SDK_BASE}${extra.pathname}${search}`);
      navigate(`${hostPrefix}${extra.pathname}${search}`, { replace: true });
    },
    [navigate, hostPrefix],
  );

  return { src, sdkOwnedSrc, onNavigate };
};

export default useSdkUrlMirror;
