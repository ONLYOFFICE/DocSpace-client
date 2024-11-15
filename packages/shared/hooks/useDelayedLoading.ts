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

const SHOW_LOADER_TIMER = 200;
const MIN_LOADER_TIMER = 500;

// Enables isLoading only if more than the minimum time has elapsed.
function useDelayedLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const minimumDisplayTime = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    timeoutId.current = setTimeout(() => {
      setIsLoading(true);
      minimumDisplayTime.current = setTimeout(() => {
        minimumDisplayTime.current = null;
      }, SHOW_LOADER_TIMER);
    }, MIN_LOADER_TIMER);
  }, []);

  const stopLoading = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }

    if (!minimumDisplayTime.current) {
      setIsLoading(false);
    } else {
      minimumDisplayTime.current = setTimeout(() => {
        setIsLoading(false);
        minimumDisplayTime.current = null;
      }, SHOW_LOADER_TIMER);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      if (minimumDisplayTime.current) clearTimeout(minimumDisplayTime.current);
    };
  }, []);

  return { isLoading, startLoading, stopLoading };
}

export default useDelayedLoading;
