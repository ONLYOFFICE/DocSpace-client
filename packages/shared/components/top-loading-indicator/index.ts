const intervalTimeout = 10;

const MAX = 100;
let timerId: ReturnType<typeof setTimeout> | null;
let width = 0;
let percentage = 0;
const increasePercentage = 0.75;
const moreIncreasePercentage = 3;

let elem =
  typeof document !== "undefined" &&
  document.getElementById("ipl-progress-indicator");

const animatingWidth = () => {
  if (width >= MAX) {
    if (timerId) clearTimeout(timerId);
    timerId = null;
    if (elem) elem.style.width = "0px";
    width = 0;
    return;
  }

  width += percentage !== MAX ? increasePercentage : moreIncreasePercentage;
  if (elem) elem.style.width = `${width}%`;
};

const startInterval = () => {
  if (timerId) return;

  if (!elem) elem = document.getElementById("ipl-progress-indicator");

  timerId = setInterval(animatingWidth, intervalTimeout);
};

export default class TopLoaderService {
  static start() {
    percentage = 0;
    startInterval();
  }

  static end() {
    percentage = MAX;
  }
}
