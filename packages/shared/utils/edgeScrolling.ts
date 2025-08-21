const edgeSize = 200;
const maxStep = 50;

let timer: null | ReturnType<typeof setTimeout> = null;

export const clearEdgeScrollingTimer = () => {
  if (timer) clearTimeout(timer);
};

export const onEdgeScrolling = (e: MouseEvent) => {
  const bodyScroll = document.querySelector(".section-scroll");

  if (bodyScroll) {
    const viewportY = e.clientY;
    const viewportHeight = document.documentElement.clientHeight;
    const edgeTop = edgeSize;
    const edgeBottom = viewportHeight - edgeSize;
    const isInTopEdge = viewportY < edgeTop;
    const isInBottomEdge = viewportY > edgeBottom;

    if (!(isInTopEdge || isInBottomEdge)) {
      clearEdgeScrollingTimer();
      return;
    }

    const maxScrollY = bodyScroll.scrollHeight - viewportHeight;

    const adjustWindowScroll = () => {
      const currentScrollY = bodyScroll.scrollTop;

      const canScrollUp = currentScrollY > 0;
      const canScrollDown = currentScrollY < maxScrollY;
      let nextScrollY = currentScrollY;

      if (isInTopEdge && canScrollUp) {
        const intensity = (edgeTop - viewportY) / edgeSize;
        nextScrollY -= maxStep * intensity;
      } else if (isInBottomEdge && canScrollDown) {
        const intensity = (viewportY - edgeBottom) / edgeSize;

        nextScrollY += maxStep * intensity;
      }

      nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));

      if (nextScrollY !== currentScrollY) {
        bodyScroll.scrollTo(0, nextScrollY);
        return true;
      }
      return false;
    };

    const checkForWindowScroll = () => {
      clearEdgeScrollingTimer();
      if (adjustWindowScroll()) {
        timer = setTimeout(checkForWindowScroll, 30);
      }
    };

    checkForWindowScroll();
  }
};
