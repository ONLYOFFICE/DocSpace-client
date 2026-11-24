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

import { render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const encryption = vi.hoisted(() => ({ isUnlocked: true }));

vi.mock("@docspace/shared/context/encryption", () => ({
  useEncryption: () => encryption,
}));

const { default: PrivateRoomReplacedKeyNotice } = (await import(
  "../PrivateRoomReplacedKeyNotice"
)) as unknown as { default: React.ComponentType };

const NOTICE = "private_room_replaced_key_notice";

const renderNotice = (count: number, isPrivacyFolder = true) =>
  render(
    <Provider
      filesStore={{ replacedKeyFilesCount: count }}
      treeFoldersStore={{ isPrivacyFolder }}
    >
      <PrivateRoomReplacedKeyNotice />
    </Provider>,
  );

describe("A private room names the files wrapped for a key the user no longer holds", () => {
  beforeEach(() => {
    encryption.isUnlocked = true;
  });

  it("Room of a user who replaced the key", () => {
    renderNotice(6);

    const notice = screen.getByRole("region", {
      name: "Common:PrivateRoomReplacedKeyBarTitle",
    });
    expect(notice).toHaveAttribute("data-testid", NOTICE);
    expect(notice).toHaveTextContent("Common:PrivateRoomReplacedKeyBarText_other");
    expect(notice.querySelector("button, a")).toBeNull();
  });

  it("one file takes the singular text", () => {
    renderNotice(1);

    expect(screen.getByTestId(NOTICE)).toHaveTextContent(
      "Common:PrivateRoomReplacedKeyBarText_one",
    );
  });

  it("No such files", () => {
    renderNotice(0);

    expect(screen.queryByTestId(NOTICE)).toBeNull();
  });

  it("Key locked", () => {
    encryption.isUnlocked = false;
    renderNotice(6);

    expect(screen.queryByTestId(NOTICE)).toBeNull();
  });

  it("Leaving the room", () => {
    renderNotice(6, false);

    expect(screen.queryByTestId(NOTICE)).toBeNull();
  });
});
