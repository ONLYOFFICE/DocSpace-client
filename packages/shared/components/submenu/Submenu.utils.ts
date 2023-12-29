import { DomHelpers, size } from "../../utils";
import { TSubmenuItem } from "./Submenu.types";

const paddingGap = 14;
const flexGap = 4;
const offset = 32;
const wrapperPadding = DomHelpers.getViewport().width <= size.desktop ? 16 : 20;

const countText = (text: string) => {
  const inputText = text;
  const font = "600 13px open sans";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) context.font = font;
  return { id: text, width: context?.measureText(inputText).width };
};

const countItemsAndGaps = (
  texts: {
    id: string;
    width: number | undefined;
  }[],
) => {
  const result: {
    type: string;
    length?: number;
    start: number;
    end: number;
    id?: string;
  }[] = [];

  texts.forEach(({ id, width }) => {
    if (!result.length)
      result.push(
        {
          type: "gap",
          length: paddingGap,
          start: 0,
          end: paddingGap + wrapperPadding,
        },
        {
          id,
          type: "item",
          length: width,
          start: paddingGap,
          end: width ? paddingGap + width : paddingGap,
        },
      );
    else {
      const lastItem = result[result.length - 1];
      result.push(
        {
          type: "gap",
          length: paddingGap * 2 + flexGap,
          start: lastItem.end,
          end: lastItem.end + paddingGap * 2 + flexGap,
        },
        {
          id,
          type: "item",
          length: width,
          start: lastItem.end + paddingGap * 2 + flexGap,
          end: width
            ? lastItem.end + paddingGap * 2 + flexGap + width
            : lastItem.end + paddingGap * 2 + flexGap,
        },
      );
    }
  });

  result.push({
    type: "gap",
    length: paddingGap,
    start: result[result.length - 1].end,
    end: result[result.length - 1].end + paddingGap + wrapperPadding,
  });

  return result;
};

const countParams = (data: TSubmenuItem[], submenuItemsRef: HTMLDivElement) => {
  const refCurrent = submenuItemsRef;

  const texts = data.map((d) => countText(d.name));
  const itemsAndGaps = countItemsAndGaps(texts);

  const submenuWidth = refCurrent.offsetWidth;
  const marker = refCurrent.scrollLeft + submenuWidth - wrapperPadding;

  const [itemOnMarker] = itemsAndGaps.filter(
    (obj) => obj.start < marker && marker < obj.end,
  );

  return [marker, itemsAndGaps, itemOnMarker];
};

export const countAutoOffset = (
  data: TSubmenuItem[],
  submenuItemsRef: HTMLDivElement | null,
) => {
  if (submenuItemsRef) {
    const [marker, itemsAndGaps, itemOnMarker] = countParams(
      data,
      submenuItemsRef,
    );

    if (itemOnMarker === undefined) return 0;

    if (
      !Array.isArray(itemOnMarker) &&
      Array.isArray(itemsAndGaps) &&
      typeof marker === "number" &&
      typeof itemOnMarker !== "number"
    ) {
      if (
        itemOnMarker.type === "gap" &&
        itemOnMarker !== itemsAndGaps[itemsAndGaps.length - 1]
      )
        return itemOnMarker.end - marker + offset - wrapperPadding;
      if (itemOnMarker.type === "item" && marker - itemOnMarker.start < 32) {
        return -(marker - itemOnMarker.start - offset) - wrapperPadding;
      }
      if (
        itemOnMarker.type === "item" &&
        itemOnMarker.end - marker < 7.5 &&
        itemOnMarker !== itemsAndGaps[itemsAndGaps.length - 2]
      ) {
        return itemOnMarker.end - marker + offset * 2 - wrapperPadding;
      }
      return 0;
    }
  }
};

export const countAutoFocus = (
  itemId: string,
  data: TSubmenuItem[],
  submenuItemsRef: HTMLDivElement | null,
) => {
  if (submenuItemsRef) {
    const [marker, itemsAndGaps, itemOnMarker] = countParams(
      data,
      submenuItemsRef,
    );

    if (
      !Array.isArray(itemOnMarker) &&
      Array.isArray(itemsAndGaps) &&
      typeof marker === "number" &&
      typeof itemOnMarker !== "number"
    ) {
      const [focusedItem] = itemsAndGaps.filter((obj) => obj.id === itemId);
      const submenuWidth = submenuItemsRef.offsetWidth;

      if (itemOnMarker?.id && focusedItem.id === itemOnMarker.id)
        return focusedItem.end - marker;
      if (
        focusedItem.start < marker - submenuWidth ||
        focusedItem.start - offset < marker - submenuWidth
      )
        return (
          focusedItem.start - marker + submenuWidth - wrapperPadding - offset
        );
      return 0;
    }
  }
};
