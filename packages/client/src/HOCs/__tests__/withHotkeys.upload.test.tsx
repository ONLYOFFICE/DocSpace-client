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

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));

vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));

const { default: withHotkeys } = await import("../withHotkeys");
const { default: HotkeyStore } = await import("SRC_DIR/store/HotkeyStore");

// makeAutoObservable deep-clones plain objects; a real store is a class instance.
const asStore = <T extends object>(fake: T): T =>
  Object.assign(Object.create({}), fake);

/** react-hotkeys-hook 3 listens through hotkeys-js, which reads keyCode. */
const pressShiftWith = (letter: string) => {
  const keyCode = letter.toUpperCase().charCodeAt(0);
  fireEvent.keyDown(document, { key: "Shift", keyCode: 16, shiftKey: true });
  fireEvent.keyDown(document, { key: letter, keyCode, shiftKey: true });
  fireEvent.keyUp(document, { key: letter, keyCode, shiftKey: true });
  fireEvent.keyUp(document, { key: "Shift", keyCode: 16 });
};

/** The upload inputs the section renders; the hotkeys click them. */
const UploadInputs = () => (
  <>
    <input id="customFileInput" type="file" />
    <input id="customFolderInput" type="file" />
  </>
);

const renderSection = (isPrivacyFolder: boolean) => {
  const store = new HotkeyStore(
    ...([
      asStore({}),
      asStore({}),
      asStore({}),
      asStore({}),
      asStore({ isPrivacyFolder }),
      asStore({}),
      asStore({}),
      asStore({}),
    ] as unknown as ConstructorParameters<typeof HotkeyStore>),
  );
  const Section = withHotkeys(UploadInputs) as unknown as React.ComponentType<
    Record<string, unknown>
  >;

  render(
    <Section
      t={(key: string) => key}
      enabledHotkeys
      mediaViewerIsVisible={false}
      filesIsLoading={false}
      security={{ Create: true }}
      isPrivacyFolder={isPrivacyFolder}
      activateHotkeys={vi.fn()}
      uploadFile={store.uploadFile}
    />,
  );

  return {
    filePicker: vi.spyOn(
      document.getElementById("customFileInput") as HTMLInputElement,
      "click",
    ),
    folderPicker: vi.spyOn(
      document.getElementById("customFolderInput") as HTMLInputElement,
      "click",
    ),
  };
};

describe("withHotkeys — upload hotkeys in a private room", () => {
  it("Shift+U pressed", () => {
    const { filePicker, folderPicker } = renderSection(true);

    pressShiftWith("u");

    expect(filePicker).toHaveBeenCalledTimes(1);
    expect(folderPicker).not.toHaveBeenCalled();
  });

  it("Shift+I pressed", () => {
    const { filePicker, folderPicker } = renderSection(true);

    pressShiftWith("i");

    expect(folderPicker).not.toHaveBeenCalled();
    expect(filePicker).not.toHaveBeenCalled();
  });

  it("opens the folder picker for Shift+I outside a private room", () => {
    const { folderPicker } = renderSection(false);

    pressShiftWith("i");

    expect(folderPicker).toHaveBeenCalledTimes(1);
  });
});

const pressAltShiftO = () => {
  const modifiers = { altKey: true, shiftKey: true };
  fireEvent.keyDown(document, { key: "Alt", keyCode: 18, altKey: true });
  fireEvent.keyDown(document, { key: "Shift", keyCode: 16, ...modifiers });
  fireEvent.keyDown(document, { key: "o", keyCode: 79, ...modifiers });
  fireEvent.keyUp(document, { key: "o", keyCode: 79, ...modifiers });
  fireEvent.keyUp(document, { key: "Shift", keyCode: 16, altKey: true });
  fireEvent.keyUp(document, { key: "Alt", keyCode: 18 });
};

const renderForFormFromFile = (isPrivacyFolder: boolean) => {
  const setSelectFileDialogVisible = vi.fn();
  const Section = withHotkeys(UploadInputs) as unknown as React.ComponentType<
    Record<string, unknown>
  >;

  render(
    <Section
      t={(key: string) => key}
      enabledHotkeys
      mediaViewerIsVisible={false}
      filesIsLoading={false}
      security={{ Create: true }}
      isPrivacyFolder={isPrivacyFolder}
      canCreateEncrypted
      activateHotkeys={vi.fn()}
      setSelectFileDialogVisible={setSelectFileDialogVisible}
    />,
  );

  pressAltShiftO();

  return { setSelectFileDialogVisible };
};

describe("withHotkeys — form from a file", () => {
  it("Form from a file", () => {
    const { setSelectFileDialogVisible } = renderForFormFromFile(true);

    expect(setSelectFileDialogVisible).not.toHaveBeenCalled();
  });

  it("opens the file picker outside a private room", () => {
    const { setSelectFileDialogVisible } = renderForFormFromFile(false);

    expect(setSelectFileDialogVisible).toHaveBeenCalledWith(true);
  });
});

// A forced confirmation stands for a private room with confirmDelete off; the
// getter has its own cases in FilesActionsStore.deleteDownload.test.ts.
const renderForDelete = (isDeleteConfirmationForced: boolean) => {
  const setDeleteDialogVisible = vi.fn();
  const deleteAction = vi.fn(async () => {});
  const Section = withHotkeys(UploadInputs) as unknown as React.ComponentType<
    Record<string, unknown>
  >;

  render(
    <Section
      t={(key: string) => key}
      enabledHotkeys
      mediaViewerIsVisible={false}
      filesIsLoading={false}
      security={{}}
      activateHotkeys={vi.fn()}
      isAvailableOption={(option: string) => option === "delete"}
      isGroupMenuBlocked={false}
      isDeleteConfirmationForced={isDeleteConfirmationForced}
      setDeleteDialogVisible={setDeleteDialogVisible}
      deleteAction={deleteAction}
    />,
  );

  fireEvent.keyDown(document, { key: "Delete", keyCode: 46 });
  fireEvent.keyUp(document, { key: "Delete", keyCode: 46 });

  return { setDeleteDialogVisible, deleteAction };
};

describe("withHotkeys — the Delete key", () => {
  it("Confirmation disabled in settings", () => {
    const { setDeleteDialogVisible, deleteAction } = renderForDelete(true);

    expect(setDeleteDialogVisible).toHaveBeenCalledWith(true);
    expect(deleteAction).not.toHaveBeenCalled();
  });

  it("deletes without the dialog when the confirmation is not forced", () => {
    const { setDeleteDialogVisible, deleteAction } = renderForDelete(false);

    expect(setDeleteDialogVisible).not.toHaveBeenCalled();
    expect(deleteAction).toHaveBeenCalledTimes(1);
  });
});
