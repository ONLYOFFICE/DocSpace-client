import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
} from "react";

function useLoadingWithTimeout<S = undefined>(
  timeout: number
): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
function useLoadingWithTimeout<S extends boolean>(
  timeout: number,
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>];
function useLoadingWithTimeout<S extends boolean | undefined = undefined>(
  timeout: number,
  initialState?: S | (() => S)
) {
  const [state, setState] = useState<S | undefined>(initialState);
  const timerRef = useRef<number>();

  const cleanTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const setStateWithTimeout: Dispatch<SetStateAction<S | undefined>> =
    useCallback((value) => {
      cleanTimer();

      if (value) {
        timerRef.current = window.setTimeout(() => {
          setState(value);
        }, timeout);
      } else {
        setState(value);
      }
    }, []);

  useEffect(() => {
    return () => cleanTimer();
  }, []);

  return [state, setStateWithTimeout];
}

export { useLoadingWithTimeout };
