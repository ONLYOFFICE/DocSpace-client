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

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimationEvents } from "@docspace/shared/hooks/useAnimation";

type Options = {
  autoEndOnPathChange?: boolean;
};

export const useRouteAnimation = (options: Options = {}) => {
  const pathname = usePathname();
  const router = useRouter();

  const pathnameRef = useRef(pathname);

  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const waitForPath = useCallback((expectedPath: string) => {
    return new Promise<void>((resolve) => {
      const done = () =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));

      if (pathnameRef.current === expectedPath) {
        done();
        return;
      }

      const intervalId = setInterval(() => {
        if (pathnameRef.current === expectedPath) {
          clearInterval(intervalId);
          done();
        }
      }, 10);

      setTimeout(() => {
        clearInterval(intervalId);
        done();
      }, 3000);
    });
  }, []);

  const startNavigation = useCallback(
    async (targetPath: string) => {
      const target = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;

      window.dispatchEvent(new CustomEvent(AnimationEvents.ANIMATION_STARTED));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      setPendingPath(target);

      if (pathnameRef.current !== target) {
        router.push(target);
        await waitForPath(target);
      }

      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));

      requestAnimationFrame(() => setPendingPath(null));
    },
    [router, waitForPath],
  );

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const onStart = () => setIsNavigating(true);
    const onEnd = () => setIsNavigating(false);
    window.addEventListener(
      AnimationEvents.ANIMATION_STARTED,
      onStart as EventListener,
    );
    window.addEventListener(
      AnimationEvents.END_ANIMATION,
      onEnd as EventListener,
    );
    return () => {
      window.removeEventListener(
        AnimationEvents.ANIMATION_STARTED,
        onStart as EventListener,
      );
      window.removeEventListener(
        AnimationEvents.END_ANIMATION,
        onEnd as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (!isNavigating) return;
    const id = window.setTimeout(() => setIsNavigating(false), 3500);
    return () => window.clearTimeout(id);
  }, [isNavigating]);

  const isActiveBy = useCallback(
    (predicate: (path: string) => boolean) => {
      const source = pendingPath ?? pathname;
      return predicate(source);
    },
    [pendingPath, pathname],
  );

  useEffect(() => {
    if (!options.autoEndOnPathChange) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
      }),
    );
  }, [options.autoEndOnPathChange, pathname]);

  return {
    isActiveBy,
    startNavigation,
    pendingPath,
    isNavigating,
  };
};
