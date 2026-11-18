import React from "react";

/**
 * The parts of the Info panel's Details that the AI lists' cases do not look
 * at, reduced to nothing, and the props the Details are given.
 */
export const Nothing = () => null;

export const RoomIconMock = ({ title }: { title?: string }) => (
  <div data-testid="room-icon">{title}</div>
);

export const SkillIconMock = ({ kind }: { kind: string }) => (
  <div data-testid={`skill-icon-${kind}`} />
);

export const detailsProps = (selection: Record<string, unknown>) => ({
  selection,
  isArchive: false,
  culture: "en",
  isVisitor: false,
  isCollaborator: false,
  isAdmin: true,
  isDefaultRoomsQuotaSet: true,
  openUser: () => undefined,
  getInfoPanelItemIcon: () => "",
  getLogoCoverModel: () => [],
  roomLifetime: null,
  openFolder: { id: null, roomType: null, title: "" },
});

/** The value of a row of the Details' properties, by the row's title. */
export const propertyValue = (container: HTMLElement, title: string) => {
  const row = Array.from(container.querySelectorAll(".property")).find(
    (element) => element.querySelector(".property-title")?.textContent === title,
  );
  return row ? row.textContent?.slice(title.length) : undefined;
};
