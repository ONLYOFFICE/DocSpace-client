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

import React, { createContext, useContext, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

/**
 * Top-level sections. Everything not matched here is treated as home ("/").
 */
const SECTION_PREFIXES = [
  "/portal-settings",
  "/developer-tools",
  "/accounts",
  "/dashboard",
  "/ai-files",
  "/ai-forms",
  "/ai-rooms",
] as const;

function getSectionPrefix(pathname: string): string {
  const match = SECTION_PREFIXES.find((prefix) =>
    pathname.startsWith(prefix),
  );
  return match ?? "/";
}

type SectionNavigationContextValue = {
  navigateBack: () => void;
};

const SectionNavigationContext =
  createContext<SectionNavigationContextValue | null>(null);

export const SectionNavigationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const stackRef = useRef<string[]>([]);
  const prevPathnameRef = useRef<string>(location.pathname);

  useEffect(() => {
    const currentSection = getSectionPrefix(location.pathname);
    const prevSection = getSectionPrefix(prevPathnameRef.current);

    if (currentSection !== prevSection) {
      stackRef.current.push(prevPathnameRef.current);
    }

    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

  const navigateBack = () => {
    const prev = stackRef.current.pop();

    if (prev) {
      navigate(prev);
    } else {
      navigate(-1 as unknown as string);
    }
  };

  return (
    <SectionNavigationContext.Provider value={{ navigateBack }}>
      {children}
    </SectionNavigationContext.Provider>
  );
};

export const useSectionNavigation = (): SectionNavigationContextValue => {
  const ctx = useContext(SectionNavigationContext);

  if (!ctx) {
    throw new Error(
      "useSectionNavigation must be used within SectionNavigationProvider",
    );
  }

  return ctx;
};
