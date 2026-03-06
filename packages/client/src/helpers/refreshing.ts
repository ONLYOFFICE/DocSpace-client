export type TSetRefreshing = (value: boolean) => void;

type TFinishRefreshingOptions = {
  startTime: number;
  setRefreshing: TSetRefreshing;
  animationCycleTime?: number;
};

export const finishRefreshingWithMinCycle = ({
  startTime,
  setRefreshing,
  animationCycleTime = 1000,
}: TFinishRefreshingOptions) => {
  const elapsedTime = Date.now() - startTime;

  if (elapsedTime < animationCycleTime) {
    const delay = animationCycleTime - elapsedTime;

    return window.setTimeout(() => {
      setRefreshing(false);
    }, delay);
  }

  const totalNeededTime =
    Math.ceil(elapsedTime / animationCycleTime) * animationCycleTime;
  const remainingTime = totalNeededTime - elapsedTime;

  if (remainingTime > 0) {
    return window.setTimeout(() => {
      setRefreshing(false);
    }, remainingTime);
  }

  setRefreshing(false);
  return undefined;
};
