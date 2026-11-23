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

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const env = vi.hoisted(() => ({
  modalOnClose: null as null | (() => void),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: object) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
    ready: true,
  }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const Part = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  const Dialog = ({
    children,
    onClose,
  }: {
    children?: React.ReactNode;
    onClose: () => void;
  }) => {
    env.modalOnClose = onClose;
    return <div role="dialog">{children}</div>;
  };
  return {
    ModalDialog: Object.assign(Dialog, {
      Header: Part,
      Body: Part,
      Footer: Part,
    }),
  };
});

vi.mock("@onlyoffice/apps-ui-kit/components/button", () => ({
  ButtonSize: { normal: "normal" },
  Button: ({
    label,
    onClick,
    testId,
  }: {
    label: string;
    onClick: () => void;
    testId: string;
  }) => (
    <button type="button" data-testid={testId} onClick={onClick}>
      {label}
    </button>
  ),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/text", () => ({
  Text: ({ children }: { children?: React.ReactNode }) => <p>{children}</p>,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn() },
}));

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import RemoveUserConfirmationDialog from "./RemoveUserConfirmationDialog";

describe("Removal confirmation dialog", () => {
  let root: Root | null = null;
  let container: HTMLElement;
  const onClose = vi.fn();

  const render = (onConfirm: () => Promise<void>) => {
    container = document.createElement("div");
    root = createRoot(container);
    act(() =>
      root?.render(
        <RemoveUserConfirmationDialog
          visible
          displayName="Bob Tester"
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      ),
    );
  };

  const button = (testId: string) =>
    container.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`)!;

  beforeEach(() => {
    onClose.mockReset();
    vi.mocked(toastr.error).mockReset();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("names the member in the warning", () => {
    render(vi.fn(async () => {}));

    expect(container.textContent).toContain("Common:RoomMembersRemoveUser");
    expect(container.textContent).toContain(
      'Common:RemoveUserFromEncryptedRoomWarning {"displayName":"Bob Tester"}',
    );
  });

  it("confirms once and then closes", async () => {
    const onConfirm = vi.fn(async () => {});
    render(onConfirm);

    await act(async () => button("private_remove_user_confirmation_ok").click());

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose.mock.invocationCallOrder[0]).toBeGreaterThan(
      onConfirm.mock.invocationCallOrder[0],
    );
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("shows a refused removal and still closes", async () => {
    const refusal = new Error("refused");
    render(vi.fn(async () => Promise.reject(refusal)));

    await act(async () => button("private_remove_user_confirmation_ok").click());

    expect(toastr.error).toHaveBeenCalledWith(refusal);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("cannot be closed while the removal runs", async () => {
    let finish: () => void = () => {};
    render(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );

    act(() => button("private_remove_user_confirmation_ok").click());
    act(() => env.modalOnClose?.());
    act(() => button("private_remove_user_confirmation_cancel").click());

    expect(onClose).not.toHaveBeenCalled();

    await act(async () => finish());

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
