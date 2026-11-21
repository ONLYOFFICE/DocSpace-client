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

import { act, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "mobx-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import { roomDto } from "SRC_DIR/store/filesStore/__tests__/listItem.fixture";

type TSelectorProps = {
  infoText?: string;
  withFooterCheckbox?: boolean | null;
  onSubmit: (
    user: { id: string }[],
    access: unknown,
    footerInput: unknown,
    isChecked: boolean,
  ) => Promise<void>;
};

const mocks = vi.hoisted(() => ({
  selector: null as TSelectorProps | null,
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  withTranslation:
    () =>
    (Component: React.ComponentType<{ t: (key: string) => string }>) =>
    (props: object) => <Component t={(key: string) => key} {...props} />,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

vi.mock("@onlyoffice/apps-ui-kit/selectors/People", () => ({
  default: (props: TSelectorProps) => {
    mocks.selector = props;
    return <div data-testid="people_selector" />;
  },
}));

const ChangeRoomOwnerPanel = (await import("../index"))
  .default as unknown as React.ComponentType<{
  useModal?: boolean;
  showBackButton?: boolean;
  onOwnerChange?: (owner: unknown) => void;
}>;

const agent = (ownerId: string) =>
  roomDto({
    roomType: RoomsType.AiProjectRoom,
    createdBy: { id: ownerId },
  } as never);

const renderPanelAs = (userId: string, ownerId = "owner") => {
  const changeOwner = vi.fn(async () => {});

  render(
    <Provider
      dialogsStore={{
        changeRoomOwnerIsVisible: true,
        setChangeRoomOwnerIsVisible: vi.fn(),
      }}
      filesStore={{ selection: [agent(ownerId)], bufferSelection: null }}
      selectedFolderStore={{}}
      filesActionsStore={{ changeRoomOwner: vi.fn() }}
      userStore={{ user: { id: userId } }}
      infoPanelStore={{ updateInfoPanelMembers: vi.fn() }}
      aiProjectsStore={{ changeOwner }}
    >
      <ChangeRoomOwnerPanel useModal={false} />
    </Provider>,
  );

  return { changeOwner };
};

describe("Change owner of an agent", () => {
  beforeEach(() => {
    mocks.selector = null;
  });

  it("Hand over and leave", async () => {
    renderPanelAs("owner");

    await waitFor(() => expect(screen.getByTestId("people_selector")));
    expect(mocks.selector?.withFooterCheckbox).toBe(true);
    expect(mocks.selector?.infoText).toBe(
      "Common:AIProjectChangeOwnerLeaveInfo",
    );
  });

  it("Admin changes another's owner", async () => {
    renderPanelAs("admin");

    await waitFor(() => expect(screen.getByTestId("people_selector")));
    expect(mocks.selector?.withFooterCheckbox).toBe(false);
    expect(mocks.selector?.infoText).toBe("Common:AIProjectChangeOwnerInfo");
  });

  it("leaves the agent only when the box is ticked", async () => {
    const { changeOwner } = renderPanelAs("owner");
    await waitFor(() => expect(screen.getByTestId("people_selector")));

    await act(() => mocks.selector!.onSubmit([{ id: "bob" }], null, "", true));

    expect(changeOwner).toHaveBeenCalledWith(expect.anything(), "bob", false);
  });
});
