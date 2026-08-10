/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Bug 81714 - the anonymous sign-in toast on a public room must never be built
 * in the browser language.
 *
 * An anonymous visit boots i18n from the LANGUAGE cookie or `navigator.language`
 * and only switches to the portal culture once `AuthStore.init` has the portal
 * settings. The toast is handed to `toastr` as an already-rendered element, so
 * it is a one-shot snapshot: built too early it keeps the browser language
 * forever, while the rest of the page re-renders in the portal culture.
 *
 * The whole page shell is stubbed - these tests only care about whether the
 * toast is emitted, and when.
 */

import React from "react";
import { act, render } from "@testing-library/react";
import { Provider } from "mobx-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ShareAccessRights } from "@docspace/shared/enums";

const i18nState = vi.hoisted(() => ({
  language: "en",
  // Set by the mocked `useTranslation` below - lets a test push a language the
  // way react-i18next does on `languageChanged`: through the consumer's own
  // state, which re-renders it even though `observer` memoizes its props.
  setLanguage: null as null | ((language: string) => void),
}));
const toastrMock = vi.hoisted(() => ({ info: vi.fn() }));

vi.mock("react-i18next", async () => {
  const react = await import("react");

  return {
    useTranslation: () => {
      const [language, setLanguage] = react.useState(i18nState.language);

      i18nState.setLanguage = setLanguage;

      return {
        t: (key: string) => key,
        i18n: { language, changeLanguage: vi.fn() },
        ready: true,
      };
    },
    Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
    initReactI18next: { type: "3rdParty", init: () => {} },
    I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/rooms/share", search: "" }),
  Outlet: () => null,
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({ toastr: toastrMock }));

vi.mock("@docspace/ui-kit/components/section", () => {
  const Passthrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", null, children);

  return {
    default: {
      SectionHeader: Passthrough,
      SectionFilter: Passthrough,
      SectionBody: Passthrough,
    },
  };
});

vi.mock("@docspace/ui-kit/components/text", () => ({
  Text: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("span", null, children),
}));

vi.mock("@docspace/ui-kit/components/link", () => ({
  Link: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("a", null, children),
}));

vi.mock("@docspace/shared/utils/common", () => ({ isPublicRoom: () => true }));

vi.mock("@docspace/shared/constants/brands", () => ({
  getBrandName: () => "ProductName",
}));

vi.mock("SRC_DIR/components/Section", () => ({
  default: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("../../Home/Section/Header", () => ({ default: () => null }));
vi.mock("../../Home/Section/Filter", () => ({ default: () => null }));
vi.mock("../../../components/FilesPanels", () => ({ default: () => null }));
vi.mock("../../Home/SelectionArea/FilesSelectionArea", () => ({
  default: () => null,
}));
vi.mock("../../Home/MediaViewer", () => ({ default: () => null }));
vi.mock("../../Home/Hooks", () => ({
  usePublic: () => {},
  useSDK: () => {},
}));

// Imported last on purpose: the vi.mock factories above must be registered
// before the component pulls its dependencies in.
import PublicRoomPage from "../PublicRoomPage";

const createStore = (culture: string) => ({
  authStore: { isAuthenticated: false },
  settingsStore: {
    culture,
    isFrame: false,
    frameConfig: null,
    setFrameConfig: () => {},
  },
  filesStore: { fetchFiles: () => {}, isEmptyPage: true },
  publicRoomStore: {
    isLoaded: true,
    roomStatus: null,
    fetchPublicRoom: () => {},
    onOpenSignInWindow: () => {},
    windowIsOpen: false,
    validationData: { isAuthenticated: false },
  },
  uploadDataStore: { secondaryProgressDataStore: {} },
  filesSettingsStore: { getFilesSettings: () => {} },
  mediaViewerDataStore: { fetchPreviewMediaFile: () => {} },
  selectedFolderStore: {
    access: ShareAccessRights.ReadOnly,
    roomType: null,
    parentRoomType: null,
  },
  clientLoadingStore: { isLoading: false },
});

const renderPage = (culture: string) =>
  render(
    <Provider {...createStore(culture)}>
      <PublicRoomPage />
    </Provider>,
  );

describe("PublicRoomPage sign-in toast localization", () => {
  beforeEach(() => {
    sessionStorage.clear();
    i18nState.language = "en";
  });

  it("holds the toast back while i18n still runs the browser language", () => {
    renderPage("ru");

    expect(toastrMock.info).not.toHaveBeenCalled();
  });

  it("emits the toast once the portal culture reaches i18n", () => {
    renderPage("ru");

    expect(toastrMock.info).not.toHaveBeenCalled();

    // `AuthStore.init` has applied the portal culture: react-i18next re-renders
    // its consumers, and that is the render in which the toast may be built.
    act(() => i18nState.setLanguage?.("ru"));

    expect(toastrMock.info).toHaveBeenCalledTimes(1);
  });

  it("emits the toast right away when the portal culture is already applied", () => {
    renderPage("en");

    expect(toastrMock.info).toHaveBeenCalledTimes(1);
  });

  it("emits the toast when the portal reports no culture", () => {
    renderPage("");

    expect(toastrMock.info).toHaveBeenCalledTimes(1);
  });
});
