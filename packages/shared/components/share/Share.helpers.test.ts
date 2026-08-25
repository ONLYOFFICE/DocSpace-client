import { describe, expect, it } from "vitest";

import { ShareAccessRights, ShareRights } from "../../enums";
import type { TTranslation } from "../../types";

import {
  getLinkAccessRightOptions,
  getRoomLinkAccessOptions,
} from "./Share.helpers";

const t: TTranslation = (key) => key;

describe("getLinkAccessRightOptions", () => {
  it("builds the options from the available rights of a non-primary link", () => {
    const { options, selectedOption } = getLinkAccessRightOptions(
      t,
      ShareAccessRights.ReadOnly,
      {
        ExternalLink: [ShareRights.Editing, ShareRights.Read],
        PrimaryExternalLink: [ShareRights.Comment],
      },
    );

    expect(options.map((option) => option.key)).toEqual(["editing", "viewing"]);
    expect(selectedOption?.access).toBe(ShareAccessRights.ReadOnly);
    expect(selectedOption?.disabled).toBeUndefined();
  });

  it("reads the primary list for a primary link", () => {
    const { options } = getLinkAccessRightOptions(
      t,
      ShareAccessRights.Comment,
      {
        ExternalLink: [ShareRights.Editing],
        PrimaryExternalLink: [ShareRights.Comment],
      },
      true,
    );

    expect(options.map((option) => option.key)).toEqual(["commenting"]);
  });

  it("appends the current access as a disabled option when it is no longer available", () => {
    const { options, selectedOption } = getLinkAccessRightOptions(
      t,
      ShareAccessRights.Editing,
      { ExternalLink: [ShareRights.Read] },
    );

    expect(options.map((option) => option.key)).toEqual(["viewing", "editing"]);
    expect(selectedOption?.access).toBe(ShareAccessRights.Editing);
    expect(selectedOption?.disabled).toBe(true);
  });

  it("keeps the current access even when no right is available at all", () => {
    const { options, selectedOption } = getLinkAccessRightOptions(
      t,
      ShareAccessRights.ReadOnly,
      {},
    );

    expect(options).toHaveLength(1);
    expect(selectedOption?.access).toBe(ShareAccessRights.ReadOnly);
    expect(selectedOption?.disabled).toBe(true);
  });

  it("leaves no selected option for an access links cannot carry", () => {
    const { options, selectedOption } = getLinkAccessRightOptions(
      t,
      ShareAccessRights.RoomManager,
      { ExternalLink: [ShareRights.Read] },
    );

    expect(options.map((option) => option.key)).toEqual(["viewing"]);
    expect(selectedOption).toBeUndefined();
  });
});

describe("getRoomLinkAccessOptions", () => {
  it("uses the room labels and drops rights without a room option", () => {
    const { options, selectedOption } = getRoomLinkAccessOptions(
      t,
      ShareAccessRights.Editing,
      { ExternalLink: [ShareRights.Editing, ShareRights.CustomFilter] },
    );

    expect(options.map((option) => option.key)).toEqual(["editing"]);
    expect(selectedOption?.label).toBe("Common:Editor");
  });

  it("appends the current access as a disabled option when it is no longer available", () => {
    const { options, selectedOption } = getRoomLinkAccessOptions(
      t,
      ShareAccessRights.ReadOnly,
      { ExternalLink: [ShareRights.Editing] },
    );

    expect(options.map((option) => option.key)).toEqual(["editing", "viewing"]);
    expect(selectedOption?.disabled).toBe(true);
  });
});
