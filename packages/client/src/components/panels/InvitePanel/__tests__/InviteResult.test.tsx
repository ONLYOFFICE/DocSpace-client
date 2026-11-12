import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import InviteResult from "../sub-components/InviteResult";

const t = (key: string) => key;

const carol = { id: "carol", displayName: "Carol Jones" };
const dan = { id: "dan", displayName: "Dan Brown" };

describe("InviteResult", () => {
  it("Result shown: the result is a named region that has the focus", () => {
    render(
      <InviteResult
        t={t}
        outcome={{ granted: [carol], pending: [], skipped: [], refused: [] }}
      />,
    );

    const region = screen.getByRole("region", {
      name: "Common:EncryptedInviteResultTitle",
    });
    expect(region).toHaveFocus();
    expect(
      screen.getByRole("region", { name: "Common:Invited" }),
    ).toHaveTextContent("Carol Jones");
  });

  it("Result with a skipped invitee: the group is named and holds the reason", () => {
    render(
      <InviteResult
        t={t}
        outcome={{
          granted: [],
          pending: [{ member: carol, missingFileIds: [1] }],
          skipped: [{ ...dan, reason: "no-key" }],
          refused: [],
        }}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Common:EncryptedAccessPending" }),
    ).toHaveTextContent("Carol Jones");
    expect(
      screen.getByRole("region", { name: "Common:NotInvited" }),
    ).toHaveTextContent("Common:EncryptedSkippedNoKeys");
  });
});
