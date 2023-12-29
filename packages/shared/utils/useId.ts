import React from "react";

let ID = 0;
const genId = () => {
  ID += 1;
};
let serverHandoffComplete = false;

const hook =
  typeof document !== "undefined" && document.createElement !== undefined
    ? "useLayoutEffect"
    : "useEffect";

const usePassiveLayoutEffect = React[hook];

const useId = (fallbackId?: string | number, prefix = "prefix") => {
  const [id, setId] = React.useState<number | void | undefined>(
    serverHandoffComplete ? genId : undefined,
  );

  usePassiveLayoutEffect(() => {
    if (id === undefined) {
      ID += 1;
      setId(ID);
    }

    serverHandoffComplete = true;
  }, []);

  const calcId = id === undefined ? id : prefix + id;

  return fallbackId || calcId;
};

export default useId;
