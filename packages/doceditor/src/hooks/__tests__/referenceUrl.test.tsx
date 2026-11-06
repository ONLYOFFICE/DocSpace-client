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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TUser } from "@docspace/shared/api/people/types";

import type { TError } from "@/types";

vi.mock("@docspace/shared/api/people", () => ({ getUser: vi.fn() }));

vi.mock("@docspace/shared/utils/common", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  frameCallCommand: vi.fn(),
}));

import useError from "../useError";
import useSessionLifetime from "../useSessionLifetime";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const owner = { id: "owner-id" } as TUser;
const unauthorized: TError = { message: "unauthorized" };

const EditorFor = ({ user }: { user: TUser }) => {
  useSessionLifetime(user);
  return null;
};

// The editor rendered on the server with no session: the cookie is gone.
const SignedOutEditor = ({ error }: { error: TError }) => {
  useError({ error });
  return null;
};

let root: Root | undefined;
let container: HTMLDivElement | undefined;

const mount = (element: React.ReactElement) => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root!.render(element));
};

const unmount = () => {
  act(() => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
};

describe("the editor tab sent to the login page", () => {
  let open: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sessionStorage.clear();
    // jsdom does not navigate.
    open = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    unmount();
    open.mockRestore();
  });

  it("remembers the user the editor is open for", () => {
    mount(<EditorFor user={owner} />);

    expect(sessionStorage.getItem("sessionUserId")).toBe(owner.id);
  });

  // The client's 84856 in the editor: the owner's document was opened for the
  // user who logged in next in the tab.
  it("keeps the document for the user it was open for", () => {
    mount(<EditorFor user={owner} />);
    unmount();

    mount(<SignedOutEditor error={unauthorized} />);

    expect(sessionStorage.getItem("referenceUrl")).toBe(window.location.href);
    expect(sessionStorage.getItem("loggedOutUserId")).toBe(owner.id);
    expect(open).toHaveBeenCalledWith(
      expect.stringMatching(/\/login$/),
      "_self",
    );
  });

  // A link opened in a new tab leads whoever logs in to the document.
  it("keeps the document for anyone in a tab that never showed a user", () => {
    mount(<SignedOutEditor error={unauthorized} />);

    expect(sessionStorage.getItem("referenceUrl")).toBe(window.location.href);
    expect(sessionStorage.getItem("loggedOutUserId")).toBeNull();
  });
});
