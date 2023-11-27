import { tablet } from "../utils/device";
import DomHelpers from "../utils/domHelpers";

const paddingGap = 14;
const flexGap = 4;
const offset = 32;
// @ts-expect-error TS(2365): Operator '<=' cannot be applied to types '{ width:... Remove this comment to see the full error message
const wrapperPadding = DomHelpers.getViewport() <= tablet ? 16 : 20;

export const countAutoOffset = (data: any, submenuItemsRef: any) => {
  const [marker, itemsAndGaps, itemOnMarker] = countParams(
    data,
    submenuItemsRef
  );

  if (itemOnMarker === undefined) return 0;
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
};

export const countAutoFocus = (itemId: any, data: any, submenuItemsRef: any) => {
  const [marker, itemsAndGaps, itemOnMarker] = countParams(
    data,
    submenuItemsRef
  );

  const [focusedItem] = itemsAndGaps.filter((obj: any) => obj.id === itemId);
  const submenuWidth = submenuItemsRef.current.offsetWidth;

  if (itemOnMarker?.id && focusedItem.id === itemOnMarker.id)
    return focusedItem.end - marker;
  if (
    focusedItem.start < marker - submenuWidth ||
    focusedItem.start - offset < marker - submenuWidth
  )
    return focusedItem.start - marker + submenuWidth - wrapperPadding - offset;
  return 0;
};

const countParams = (data: any, submenuItemsRef: any) => {
  const refCurrent = submenuItemsRef.current;

  const texts = data.map((d: any) => countText(d.name));
  const itemsAndGaps = countItemsAndGaps(texts);

  const submenuWidth = refCurrent.offsetWidth;
  const marker = refCurrent.scrollLeft + submenuWidth - wrapperPadding;

  const [itemOnMarker] = itemsAndGaps.filter(
    // @ts-expect-error TS(7006): Parameter 'obj' implicitly has an 'any' type.
    (obj) => obj.start < marker && marker < obj.end
  );

  return [marker, itemsAndGaps, itemOnMarker];
};

const countText = (text: any) => {
  const inputText = text;
  const font = "600 13px open sans";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  context.font = font;
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  return { id: text, width: context.measureText(inputText).width };
};

const countItemsAndGaps = (texts: any) => {
  const result: any = [];

  texts.forEach(({
    id,
    width
  }: any) => {
    if (!result.length)
      result.push(
        {
          type: "gap",
          length: paddingGap,
          start: 0,
          end: paddingGap + wrapperPadding,
        },
        {
          id: id,
          type: "item",
          length: width,
          start: paddingGap,
          end: paddingGap + width,
        }
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
          id: id,
          type: "item",
          length: width,
          start: lastItem.end + paddingGap * 2 + flexGap,
          end: lastItem.end + paddingGap * 2 + flexGap + width,
        }
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
