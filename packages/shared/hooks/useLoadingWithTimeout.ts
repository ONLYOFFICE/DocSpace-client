import { useState, useEffect, Dispatch, useCallback, useRef } from "react";

function useLoadingWithTimeout<S = undefined>(
  timeout: number,
): [S | undefined, Dispatch<S | undefined>];

function useLoadingWithTimeout<S extends boolean>(
  timeout: number,
  initialState: S,
): [S, Dispatch<S>];

function useLoadingWithTimeout<S extends boolean | undefined = undefined>(
  timeout: number,
  initialState?: S,
) {
  const [state, setState] = useState<S | undefined>(initialState);
  const timerRef = useRef<number>();

  const cleanTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const setStateWithTimeout: Dispatch<S | undefined> = useCallback(
    (value) => {
      cleanTimer();
      if (value) {
        timerRef.current = window.setTimeout(() => {
          setState(value);
        }, timeout);
      } else {
        setState(value);
      }
    },
    [cleanTimer, timeout],
  );

  useEffect(() => {
    return () => cleanTimer();
  }, [cleanTimer]);

  return [state, setStateWithTimeout];
}

export default useLoadingWithTimeout;
