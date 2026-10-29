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

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KeyChangeDialog } from "..";

const KEY = btoa(String.fromCharCode(...new Uint8Array(32).fill(7)));

const renderDialog = () => {
  const onAccept = vi.fn();
  const onRefuse = vi.fn();

  render(
    <KeyChangeDialog
      visible
      userId="peer-1"
      displayName="Alice"
      knownPublicKey={KEY}
      newPublicKey={KEY}
      knownFirstSeenAt={1000}
      knownLastSeenAt={2000}
      onAccept={onAccept}
      onRefuse={onRefuse}
    />,
  );

  return { onAccept, onRefuse };
};

describe("KeyChangeDialog", () => {
  it("Key-change dialog opened", () => {
    renderDialog();

    expect(screen.getByRole("dialog")).toHaveFocus();
    expect(document.activeElement?.tagName).not.toBe("BUTTON");
  });

  // Spec: private-rooms/key-management, "Key dialogs ignore a click beside them"
  it("Backdrop click on the key-change dialog", () => {
    const { onAccept, onRefuse } = renderDialog();

    fireEvent.mouseDown(document.getElementById("modal-onMouseDown-close")!);

    expect(onRefuse).not.toHaveBeenCalled();
    expect(onAccept).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
