export default class DomHelpers {
  static calculatedScrollbarWidth: number | null = null;

  static zIndex: number;

  static getViewport() {
    const win = window;
    const d = document;
    const e = d.documentElement;
    const g = d.getElementsByTagName("body")[0];
    const w = win.innerWidth || e.clientWidth || g.clientWidth;
    const h = win.innerHeight || e.clientHeight || g.clientHeight;

    return { width: w, height: h };
  }

  static getOffset(el: HTMLElement) {
    if (el) {
      const rect = el.getBoundingClientRect();

      return {
        top:
          rect.top +
          (window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0),
        left:
          rect.left +
          (window.pageXOffset ||
            document.documentElement.scrollLeft ||
            document.body.scrollLeft ||
            0),
      };
    }

    return {
      top: "auto",
      left: "auto",
    };
  }

  static getOuterWidth(el: HTMLElement, margin: string) {
    if (el) {
      let width = el.offsetWidth;

      if (margin) {
        const style = getComputedStyle(el);
        width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
      }

      return width;
    }
    return 0;
  }

  static getHiddenElementOuterWidth(element: HTMLElement) {
    if (element) {
      element.style.visibility = "hidden";
      element.style.display = "block";
      const elementWidth = element.offsetWidth;
      element.style.display = "none";
      element.style.visibility = "visible";

      return elementWidth;
    }
    return 0;
  }

  static getHiddenElementOuterHeight(element: HTMLElement) {
    if (element) {
      element.style.visibility = "hidden";
      element.style.display = "block";
      const elementHeight = element.offsetHeight;
      element.style.display = "none";
      element.style.visibility = "visible";

      return elementHeight;
    }
    return 0;
  }

  static calculateScrollbarWidth(el: HTMLElement) {
    if (el) {
      const style = getComputedStyle(el);
      return (
        el.offsetWidth -
        el.clientWidth -
        parseFloat(style.borderLeftWidth) -
        parseFloat(style.borderRightWidth)
      );
    }
    if (this.calculatedScrollbarWidth != null)
      return this.calculatedScrollbarWidth;

    const scrollDiv = document.createElement("div");
    scrollDiv.className = "p-scrollbar-measure";
    document.body.appendChild(scrollDiv);

    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);

    this.calculatedScrollbarWidth = scrollbarWidth;

    return scrollbarWidth;
  }

  static generateZIndex() {
    this.zIndex = this.zIndex || 1000;

    this.zIndex += 1;

    return this.zIndex;
  }

  static revertZIndex() {
    this.zIndex = this.zIndex > 1000 ? this.zIndex - 1 : 1000;
  }

  static getCurrentZIndex() {
    return this.zIndex;
  }
}
