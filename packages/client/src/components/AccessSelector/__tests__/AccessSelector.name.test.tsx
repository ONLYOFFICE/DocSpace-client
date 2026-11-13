import { render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { describe, expect, it } from "vitest";

import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";
import type { TTranslation } from "@docspace/shared/types";

import AccessSelector from "../index";

const t = ((key: string, vars?: Record<string, string>) =>
  vars ? `${key} ${Object.values(vars).join(" / ")}` : key) as TTranslation;

const renderSelector = (subjectName?: string) =>
  render(
    <Provider settingsStore={{ standalone: false }}>
      <AccessSelector
        t={t}
        roomType={RoomsType.CustomRoom}
        defaultAccess={ShareAccessRights.ReadOnly}
        onSelectAccess={() => {}}
        isOwner
        isAdmin
        className="access"
        isMobileView={false}
        subjectName={subjectName}
      />
    </Provider>,
  );

describe("AccessSelector accessible name", () => {
  it("Invitee row read out: the role list is named after the person and the role", () => {
    renderSelector("Carol Jones");

    expect(
      screen.getByRole("button", {
        name: "Common:RoleOfUser Carol Jones / Common:RoleViewer",
      }),
    ).toBeInTheDocument();
  });

  it("names the role list of new invitees by the role alone", () => {
    renderSelector();

    expect(
      screen.getByRole("button", { name: "Common:RoleWithValue Common:RoleViewer" }),
    ).toBeInTheDocument();
  });
});
