import type { BoundsType, Point } from "./MediaViewer.types";

export const compareTo = (a: number, b: number) => {
  return Math.trunc(a) > Math.trunc(b);
};

export const getSizeByAngle = (
  width: number,
  height: number,
  angle: number,
): [number, number] => {
  const { abs, cos, sin, PI } = Math;

  const angleByRadians = (PI / 180) * angle;

  const c = cos(angleByRadians);
  const s = sin(angleByRadians);
  const halfw = 0.5 * width;
  const halfh = 0.5 * height;
  const newWidth = 2 * (abs(c * halfw) + abs(s * halfh));
  const newHeight = 2 * (abs(s * halfw) + abs(c * halfh));

  return [newWidth, newHeight];
};

export const getBounds = (
  image: HTMLImageElement | null,
  container: HTMLDivElement | null,
  diffScale: number = 1,
  angle: number = 0,
): BoundsType | null => {
  if (!image || !container) return null;

  let imageBounds = image.getBoundingClientRect();
  const containerBounds = container.getBoundingClientRect();

  const [width, height] = getSizeByAngle(
    imageBounds.width,
    imageBounds.height,
    angle,
  );

  if (diffScale !== 1)
    imageBounds = {
      ...imageBounds,
      width: width * diffScale,
      height: height * diffScale,
    };
  else {
    imageBounds = {
      ...imageBounds,
      width,
      height,
    };
  }
  const originalWidth = image.clientWidth;
  const widthOverhang = (imageBounds.width - originalWidth) / 2;

  const originalHeight = image.clientHeight;
  const heightOverhang = (imageBounds.height - originalHeight) / 2;

  const isWidthOutContainer = imageBounds.width >= containerBounds.width;

  const isHeightOutContainer = imageBounds.height >= containerBounds.height;

  const bounds = {
    right: isWidthOutContainer
      ? widthOverhang
      : containerBounds.width - imageBounds.width + widthOverhang,
    left: isWidthOutContainer
      ? -(imageBounds.width - containerBounds.width) + widthOverhang
      : widthOverhang,
    bottom: isHeightOutContainer
      ? heightOverhang
      : containerBounds.height - imageBounds.height + heightOverhang,
    top: isHeightOutContainer
      ? -(imageBounds.height - containerBounds.height) + heightOverhang
      : heightOverhang,
  };

  return bounds;
};

export const getImagePositionAndSize = (
  imageNaturalWidth: number,
  imageNaturalHeight: number,
  container: HTMLDivElement | null,
) => {
  if (!container) return null;

  const { width: containerWidth, height: containerHeight } =
    container.getBoundingClientRect();

  let width = Math.min(containerWidth, imageNaturalWidth);
  let height = (width / imageNaturalWidth) * imageNaturalHeight;

  if (height > containerHeight) {
    height = containerHeight;
    width = (height / imageNaturalHeight) * imageNaturalWidth;
  }
  const x = (containerWidth - width) / 2;
  const y = (containerHeight - height) / 2;

  return { width, height, x, y };
};

export const calculateAdjustImageUtil = (
  element: HTMLElement | null,
  container: HTMLElement | null,
  point: Point,
  diffScale: number = 1,
) => {
  if (!element || !container) return point;

  // debugger;

  let imageBounds = element.getBoundingClientRect();
  const containerBounds = container.getBoundingClientRect();

  if (diffScale !== 1) {
    const { x, y, width, height } = imageBounds;

    const newWidth = imageBounds.width * diffScale;
    const newHeight = imageBounds.height * diffScale;

    const newX = x + width / 2 - newWidth / 2;
    const newY = y + height / 2 - newHeight / 2;

    imageBounds = {
      ...imageBounds,
      width: newWidth,
      height: newHeight,
      left: newX,
      top: newY,
      right: newX + newWidth,
      bottom: newY + newHeight,
      x: newX,
      y: newY,
    };
  }

  const originalWidth = element.clientWidth;
  const widthOverhang = (imageBounds.width - originalWidth) / 2;

  const originalHeight = element.clientHeight;
  const heightOverhang = (imageBounds.height - originalHeight) / 2;

  const isWidthOutContainer = imageBounds.width >= containerBounds.width;

  const isHeightOutContainer = imageBounds.height >= containerBounds.height;

  if (
    compareTo(imageBounds.left, containerBounds.left) &&
    isWidthOutContainer
  ) {
    point.x = widthOverhang;
  } else if (
    compareTo(containerBounds.right, imageBounds.right) &&
    isWidthOutContainer
  ) {
    point.x = containerBounds.width - imageBounds.width + widthOverhang;
  } else if (!isWidthOutContainer) {
    point.x = (containerBounds.width - imageBounds.width) / 2 + widthOverhang;
  }

  if (compareTo(imageBounds.top, containerBounds.top) && isHeightOutContainer) {
    point.y = heightOverhang;
  } else if (
    compareTo(containerBounds.bottom, imageBounds.bottom) &&
    isHeightOutContainer
  ) {
    point.y = containerBounds.height - imageBounds.height + heightOverhang;
  } else if (!isHeightOutContainer) {
    point.y =
      (containerBounds.height - imageBounds.height) / 2 + heightOverhang;
  }

  return point;
};

export const calculateAdjustBoundsUtils = (
  x: number,
  y: number,
  bounds: BoundsType | null,
): Point => {
  if (!bounds) return { x, y };

  const { left, right, top, bottom } = bounds;

  if (x > right) {
    x = right;
  } else if (x < left) {
    x = left;
  }

  if (y > bottom) {
    y = bottom;
  } else if (y < top) {
    y = top;
  }

  return { x, y };
};
