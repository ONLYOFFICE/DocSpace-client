import { TRoom } from "../../api/rooms/types";

export const convertToItems = (folders: TRoom[]) => {
  const items = folders.map((folder) => {
    const { id, title, roomType, logo, shared } = folder;

    const icon = logo.medium;
    const color = logo.color;

    return { id, label: title, icon, color, roomType, shared };
  });

  return items;
};
