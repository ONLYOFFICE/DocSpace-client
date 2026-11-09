import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TAiProject } from "@docspace/shared/api/ai/projects";

vi.mock("../sub-components/list/ProjectLogo", () => ({
  ProjectLogo: ({ project }: { project: { title: string } }) => <span data-testid="logo">{project.title[0]}</span>,
}));

import { WorkspaceIntro } from "../sub-components/workspace/WorkspaceIntro";

const project = (id: number, title: string) => ({ id, title, logo: {} }) as unknown as TAiProject;

describe("WorkspaceIntro", () => {
  it("lists the agents as cards that open their chat", () => {
    const onOpen = vi.fn();
    render(<WorkspaceIntro projects={[project(16, "Lawyer"), project(19, "Marketing")]} onOpen={onOpen} />);
    const cards = screen.getAllByTestId("ai-workspace-agent");
    expect(cards.map((card) => card.textContent)).toEqual(["LLawyer", "MMarketing"]);
    fireEvent.click(cards[1]);
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 19 }));
    expect(screen.queryByTestId("ai-workspace-create-agent")).toBeNull();
  });

  it("offers to create an agent when the caller may", () => {
    const onCreate = vi.fn();
    render(<WorkspaceIntro projects={[]} onOpen={vi.fn()} onCreate={onCreate} />);
    fireEvent.click(screen.getByTestId("ai-workspace-create-agent"));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("renders nothing with no agents and no way to create one", () => {
    const { container } = render(<WorkspaceIntro projects={[]} onOpen={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
