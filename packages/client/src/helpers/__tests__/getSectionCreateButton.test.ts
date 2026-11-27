import { describe, expect, it, vi } from "vitest";

import { DeviceType } from "@docspace/shared/enums";

import {
  getSectionCreateButton,
  isCreateButtonFloating,
} from "../getSectionCreateButton";

const model = [{ key: "upload-from-device", label: "Upload from device" }];

const params = (overrides: Partial<Parameters<typeof getSectionCreateButton>[0]> = {}) => ({
  t: ((key: string) => key) as never,
  isContactsPage: false,
  isContactsGroupsPage: false,
  isContactsGuestsPage: false,
  isRoomsFolder: false,
  isFormsSection: false,
  isFormsFolder: false,
  getFolderModel: () => model,
  getContactsModel: () => null,
  onCreateRoom: vi.fn(),
  createGroup: vi.fn(),
  ...overrides,
});

describe("getSectionCreateButton", () => {
  it("reads New in a folder and offers its create menu", () => {
    const { mainButtonProps } = getSectionCreateButton(params());
    expect(mainButtonProps?.text).toBe("Common:New");
    expect(mainButtonProps?.model).toBe(model);
  });

  it("reads Add files in a knowledge base, with the same upload menu", () => {
    const { showMainButton, mainButtonProps } = getSectionCreateButton(
      params({ isKnowledgeBase: true }),
    );
    expect(showMainButton).toBe(true);
    expect(mainButtonProps?.text).toBe("Common:AddFiles");
    expect(mainButtonProps?.isDropdown).toBe(true);
    expect(mainButtonProps?.model).toBe(model);
  });

  it("offers no button in a knowledge base that takes no files", () => {
    expect(
      getSectionCreateButton(
        params({ isKnowledgeBase: true, getFolderModel: () => [] }),
      ).showMainButton,
    ).toBe(false);
  });
});

describe("isCreateButtonFloating", () => {
  it("floats the Create button on a phone", () => {
    expect(isCreateButtonFloating(DeviceType.mobile)).toBe(true);
  });

  it("keeps the Create button in the filter row on a tablet in either orientation", () => {
    expect(isCreateButtonFloating(DeviceType.tablet)).toBe(false);
  });

  it("keeps the Create button in the filter row on a desktop", () => {
    expect(isCreateButtonFloating(DeviceType.desktop)).toBe(false);
  });

  it("does not float the button before the device type is known", () => {
    expect(isCreateButtonFloating(undefined)).toBe(false);
  });
});
