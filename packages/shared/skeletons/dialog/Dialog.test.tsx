import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DialogSkeleton } from "./index";
import { DialogAsideSkeleton } from "./Dialog.aside";
import { DialogInvitePanelSkeleton } from "./Dialog.invite";
import { DialogReassignmentSkeleton } from "./Dialog.reassignment";

describe("Dialog Skeleton Components", () => {
  describe("DialogSkeleton", () => {
    it("renders without crashing", () => {
      render(<DialogSkeleton isLarge={false} withFooterBorder={false} />);
      const skeleton = screen.getByTestId("dialog-skeleton");
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute("data-is-large", "false");
      expect(skeleton).toHaveAttribute("data-with-footer-border", "false");
    });

    it("renders with large size and footer border", () => {
      render(<DialogSkeleton isLarge withFooterBorder />);
      const skeleton = screen.getByTestId("dialog-skeleton");
      expect(skeleton).toHaveAttribute("data-is-large", "true");
      expect(skeleton).toHaveAttribute("data-with-footer-border", "true");
    });
  });

  describe("DialogAsideSkeleton", () => {
    it("renders without crashing", () => {
      render(
        <DialogAsideSkeleton
          isPanel={false}
          withoutAside={false}
          withFooterBorder={false}
        />,
      );
      const skeleton = screen.getByTestId("dialog-aside-skeleton");
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute("data-is-panel", "false");
      expect(skeleton).toHaveAttribute("data-with-footer-border", "false");
    });

    it("renders with panel and footer border", () => {
      render(
        <DialogAsideSkeleton isPanel withoutAside={false} withFooterBorder />,
      );
      const skeleton = screen.getByTestId("dialog-aside-skeleton");
      expect(skeleton).toHaveAttribute("data-is-panel", "true");
      expect(skeleton).toHaveAttribute("data-with-footer-border", "true");
    });

    it("renders without aside", () => {
      render(
        <DialogAsideSkeleton
          isPanel={false}
          withoutAside
          withFooterBorder={false}
        />,
      );
      const skeleton = screen.getByTestId("dialog-aside-skeleton");
      expect(skeleton).toBeInTheDocument();
    });

    it("renders invite panel loader when isInvitePanelLoader is true", () => {
      render(
        <DialogAsideSkeleton
          isPanel={false}
          withoutAside={false}
          withFooterBorder={false}
          isInvitePanelLoader
        />,
      );
      const invitePanel = screen.getByTestId("dialog-invite-panel-skeleton");
      expect(invitePanel).toBeInTheDocument();
    });
  });

  describe("DialogInvitePanelSkeleton", () => {
    it("renders without crashing", () => {
      render(<DialogInvitePanelSkeleton />);
      const skeleton = screen.getByTestId("dialog-invite-panel-skeleton");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("DialogReassignmentSkeleton", () => {
    it("renders without crashing", () => {
      render(<DialogReassignmentSkeleton />);
      const skeleton = screen.getByTestId("dialog-reassignment-skeleton");
      expect(skeleton).toBeInTheDocument();
    });
  });
});
