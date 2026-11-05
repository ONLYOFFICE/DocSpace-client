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

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ShareAccessRights } from "../../../../enums";
import { ShareLinkService } from "../../../../services/share-link.service";
import { useShare } from "../useShare";
import type { UseShareProps } from "../../Share.types";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })),
});

vi.mock("../../Share.helpers", async (io) => ({
  ...((await io()) as object),
  copyShareLink: vi.fn(),
}));

const primaryLink = {
  access: ShareAccessRights.ReadOnly,
  canEditAccess: true,
  canEditInternal: true,
  canEditExpirationDate: true,
  canRevoke: true,
  isLocked: false,
  isOwner: false,
  sharedTo: {
    id: "link-1",
    title: "Shared link",
    shareLink: "https://example.com/s/1",
    linkType: 1,
    internal: false,
    primary: true,
    isExpired: false,
    denyDownload: false,
    requestToken: "token",
  },
};

// Stable across renders, as the share panel's are: the hook's effects
// depend on them.
const shareProps = {
  infoPanelSelection: {
    id: 1,
    isFolder: false,
    canShare: true,
    shareSettings: { ExternalLink: 1 },
  },
  fileLinkProps: [],
  setIsLoading: vi.fn(),
} as unknown as UseShareProps;

// The links as the share panel lays them out, without its virtualized list.
const Links = () => {
  const { getLinkElements } = useShare(shareProps);
  return <div data-testid="links">{getLinkElements()}</div>;
};

describe("useShare", () => {
  // The create row gives way to the link it made: the focus on it fell to
  // the page's body, and the keyboard started over from the top.
  it("moves the focus to the link it creates from the keyboard", async () => {
    // jsdom lays nothing out, and Tab stops are the controls with a box.
    vi.spyOn(Element.prototype, "getClientRects").mockImplementation(() => {
      const rects = [new DOMRect(0, 0, 10, 10)];
      return Object.assign(rects, { item: (i: number) => rects[i] ?? null });
    });
    vi.spyOn(ShareLinkService, "getPrimaryLink").mockResolvedValue(
      // The fields of a link the row reads.
      primaryLink as unknown as Awaited<
        ReturnType<typeof ShareLinkService.getPrimaryLink>
      >,
    );
    render(<Links />);
    const create = screen.getByTestId("info_panel_share_create_and_copy_link");
    act(() => create.focus());

    fireEvent.keyDown(create, { key: "Enter" });

    await waitFor(() =>
      expect(
        screen.queryByTestId("info_panel_share_create_and_copy_link"),
      ).toBeNull(),
    );
    await waitFor(() =>
      expect(
        screen.getByTestId("links").contains(document.activeElement),
      ).toBe(true),
    );
  });

  // The panel outlives the selection: a link still on its way for the item
  // the user left must not pull the focus into the next item's links.
  it("leaves the focus alone when the selection changes before the link comes", async () => {
    vi.spyOn(Element.prototype, "getClientRects").mockImplementation(() => {
      const rects = [new DOMRect(0, 0, 10, 10)];
      return Object.assign(rects, { item: (i: number) => rects[i] ?? null });
    });
    let resolveLink: (link: unknown) => void = () => {};
    vi.spyOn(ShareLinkService, "getPrimaryLink").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLink = resolve as (link: unknown) => void;
        }) as ReturnType<typeof ShareLinkService.getPrimaryLink>,
    );

    const otherProps = {
      ...shareProps,
      infoPanelSelection: { ...shareProps.infoPanelSelection, id: 2 },
      fileLinkProps: [
        { ...primaryLink, sharedTo: { ...primaryLink.sharedTo, id: "link-2" } },
      ],
    } as unknown as UseShareProps;
    const SwitchingLinks = ({ props }: { props: UseShareProps }) => {
      const { getLinkElements } = useShare(props);
      return <div data-testid="links">{getLinkElements()}</div>;
    };

    const { rerender } = render(
      <>
        <SwitchingLinks props={shareProps} />
        <button type="button" data-testid="elsewhere">
          elsewhere
        </button>
      </>,
    );
    const create = screen.getByTestId("info_panel_share_create_and_copy_link");
    act(() => create.focus());
    fireEvent.keyDown(create, { key: "Enter" });

    act(() => screen.getByTestId("elsewhere").focus());
    rerender(
      <>
        <SwitchingLinks props={otherProps} />
        <button type="button" data-testid="elsewhere">
          elsewhere
        </button>
      </>,
    );
    await act(async () => resolveLink(primaryLink));

    expect(screen.getByTestId("elsewhere")).toHaveFocus();
  });
});
