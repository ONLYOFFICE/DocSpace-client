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

import { RoomsType } from "@docspace/shared/enums";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));

// The row's quick buttons, reduced to the "Use in chat" button they draw
// when the row offers it.
vi.mock("@docspace/shared/components/quick-buttons", () => ({
  QuickButtons: ({ onUseInChat }: { onUseInChat?: () => void }) =>
    onUseInChat ? (
      <button type="button" onClick={onUseInChat}>
        Use in chat
      </button>
    ) : null,
}));

const { default: withQuickButtons } = await import("../withQuickButtons");

const Row = ({ quickButtonsComponent }: { quickButtonsComponent: React.ReactNode }) => (
  <div>{quickButtonsComponent}</div>
);
const RowWithQuickButtons = withQuickButtons(Row) as unknown as React.FC<
  Record<string, unknown>
>;

const knowledgeBase = {
  id: 21,
  title: "Company policies",
  isRoom: true,
  roomType: RoomsType.KnowledgeRoom,
};

const renderRow = (props: Record<string, unknown> = {}) => {
  const requestUseInChat = vi.fn();
  render(
    <RowWithQuickButtons
      t={(key: string) => key}
      item={knowledgeBase}
      canUseAiChat
      vectorizationEnabled
      isArchiveFolder={false}
      openFolder={{ id: null, title: "", roomType: null }}
      requestUseInChat={requestUseInChat}
      {...props}
    />,
  );
  return requestUseInChat;
};

describe("withQuickButtons: Use in chat on a Knowledge bases row", () => {
  it("connects the knowledge base to a new chat", () => {
    const requestUseInChat = renderRow();
    fireEvent.click(screen.getByRole("button", { name: "Use in chat" }));
    expect(requestUseInChat).toHaveBeenCalledWith({
      id: 21,
      title: "Company policies",
      knowledge: true,
    });
  });

  it("is not offered while vectorization is off", () => {
    renderRow({ vectorizationEnabled: false });
    expect(screen.queryByRole("button", { name: "Use in chat" })).toBeNull();
  });

  it("is not offered without the AI chat", () => {
    renderRow({ canUseAiChat: false });
    expect(screen.queryByRole("button", { name: "Use in chat" })).toBeNull();
  });

  it("is not offered in the archive", () => {
    renderRow({ isArchiveFolder: true });
    expect(screen.queryByRole("button", { name: "Use in chat" })).toBeNull();
  });

  it("still connects a skill set as a skill set", () => {
    const requestUseInChat = renderRow({
      item: { ...knowledgeBase, roomType: RoomsType.InstructionsRoom },
      vectorizationEnabled: false,
    });
    fireEvent.click(screen.getByRole("button", { name: "Use in chat" }));
    expect(requestUseInChat).toHaveBeenCalledWith({
      id: 21,
      title: "Company policies",
    });
  });
});
