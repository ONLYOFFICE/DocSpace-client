import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

import type { UserProps } from "../../Share.types";
import { User } from "../User";

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, string>) =>
      vars ? `${key} ${Object.values(vars).join(" / ")}` : key,
  }),
}));

const carol = {
  id: "carol",
  displayName: "Carol Jones",
  email: "carol@example.com",
  canEditAccess: true,
} as unknown as UserProps["user"];

const viewer = { key: "viewer", label: "Viewer", access: 2 };

const renderRow = (props: Partial<UserProps> = {}) =>
  render(
    <User
      user={carol}
      currentUser={{ id: "me" } as unknown as UserProps["currentUser"]}
      options={[viewer]}
      selectedOption={viewer}
      onSelectOption={() => Promise.resolve()}
      {...props}
    />,
  );

describe("Members row: pending access", () => {
  it("exposes the state without the drawn separator and names the retry after the member", () => {
    renderRow({ isAccessPending: true, onRetryAccess: () => Promise.resolve() });

    expect(screen.getByText("Common:EncryptedAccessPending")).toBeVisible();
    expect(screen.getByText("|")).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByRole("button", { name: "Common:RetryAccessFor Carol Jones" }),
    ).toBeInTheDocument();
  });

  it("Retry from the keyboard: the button is busy while the retry runs and starts no second one", async () => {
    let finish = () => {};
    const onRetryAccess = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    renderRow({ isAccessPending: true, onRetryAccess });

    const retry = screen.getByRole("button", {
      name: "Common:RetryAccessFor Carol Jones",
    });
    fireEvent.click(retry);
    fireEvent.click(retry);

    expect(onRetryAccess).toHaveBeenCalledTimes(1);
    expect(retry).toHaveAttribute("aria-busy", "true");

    await act(async () => finish());
    expect(retry).toHaveAttribute("aria-busy", "false");
  });

  it("Retry succeeds: the row takes the focus when the retry button goes", async () => {
    const onRetryAccess = () => Promise.resolve();
    const { rerender } = renderRow({ isAccessPending: true, onRetryAccess });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Common:RetryAccessFor Carol Jones",
        }),
      );
    });
    rerender(
      <User
        user={carol}
        currentUser={{ id: "me" } as unknown as UserProps["currentUser"]}
        options={[viewer]}
        selectedOption={viewer}
        onSelectOption={() => Promise.resolve()}
        isAccessPending={false}
        onRetryAccess={onRetryAccess}
      />,
    );

    expect(screen.getByTestId("info_panel_members_user")).toHaveFocus();
  });

  it("names the role list after the member and the role", () => {
    renderRow();

    expect(
      screen.getByRole("button", {
        name: "Common:RoleOfUser Carol Jones / Viewer",
      }),
    ).toBeInTheDocument();
  });
});
