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

  it("Invitation by a user who replaced their key", () => {
    render(
      <InviteResult
        t={t}
        outcome={{
          granted: [],
          pending: [{ member: carol, missingFileIds: [1, 2] }],
          skipped: [],
          refused: [],
          keyReplacedFileIds: [1, 2],
        }}
      />,
    );

    const pending = screen.getByRole("region", {
      name: "Common:EncryptedAccessPending",
    });
    expect(pending).toHaveTextContent("Carol Jones");
    expect(pending).toHaveTextContent("Common:PrivateRoomReplacedKeyBarText_other");
    expect(pending).not.toHaveTextContent(
      "Common:EncryptedReencryptPartialFailure",
    );
  });

  it("Mixed causes", () => {
    render(
      <InviteResult
        t={t}
        outcome={{
          granted: [],
          pending: [{ member: carol, missingFileIds: [1, 2] }],
          skipped: [],
          refused: [],
          keyReplacedFileIds: [1],
        }}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Common:EncryptedAccessPending" }),
    ).toHaveTextContent("Common:EncryptedReencryptPartialFailure");
  });

  it("Result with a skipped invitee: the group is named and holds the reason", () => {
    render(
      <InviteResult
        t={t}
        outcome={{
          granted: [],
          pending: [{ member: carol, missingFileIds: [1] }],
          skipped: [{ ...dan, reason: "no-key", notInvited: true }],
          refused: [],
        }}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Common:EncryptedAccessPending" }),
    ).toHaveTextContent("Carol Jones");
    expect(
      screen.getByRole("region", { name: "Common:NotInvited" }),
    ).toHaveTextContent("Common:EncryptedInviteNoKey");
    expect(screen.queryByText("Common:EncryptedSkippedNoKeys")).toBeNull();
  });

  it("Invitee has no key: skipped before the grant and refused by the server share one sentence", () => {
    render(
      <InviteResult
        t={t}
        outcome={{
          granted: [carol],
          pending: [],
          skipped: [{ ...dan, reason: "no-key", notInvited: true }],
          refused: [{ member: { id: "u-eve", displayName: "Eve" }, noKey: true }],
        }}
      />,
    );

    expect(screen.getAllByText("Common:EncryptedInviteNoKey")).toHaveLength(1);
    expect(screen.queryByTestId("invite_panel_result_skipped")).toBeNull();
  });

  it("A member the wrap left out keeps the text about files", () => {
    render(
      <InviteResult
        t={t}
        outcome={{
          granted: [carol],
          pending: [],
          skipped: [{ ...dan, reason: "no-key" }],
          refused: [],
        }}
      />,
    );

    expect(screen.getByTestId("invite_panel_result_skipped")).toHaveTextContent(
      "Common:EncryptedSkippedNoKeys",
    );
    expect(screen.queryByText("Common:EncryptedInviteNoKey")).toBeNull();
  });
});

describe("A peer key that could not be checked is reported per operation", () => {
  it.each([
    ["Invitee whose key could not be checked", "key-unchecked"],
    ["Invitation with one unusable key", "key-unusable"],
  ] as const)("%s", (_, reason) => {
    render(
      <InviteResult
        t={t}
        outcome={{
          granted: [carol],
          pending: [],
          skipped: [{ ...dan, reason, notInvited: true }],
          refused: [],
        }}
      />,
    );

    const notInvited = screen.getByRole("region", { name: "Common:NotInvited" });
    expect(notInvited).toHaveTextContent("Common:EncryptedInviteFailed");
    expect(notInvited).not.toHaveTextContent("Common:EncryptedInviteNoKey");
    expect(screen.queryByTestId("invite_panel_result_skipped")).toBeNull();
  });
});
