import { createContext } from "react";

export const DirectionContext = createContext("ltr");

const DirectionWrapper = ({ interfaceDirection, children }) => {
  return (
    <DirectionContext value={interfaceDirection}>{children}</DirectionContext>
  );
};

const DirectionSwitcher = {
  icon: "transfer",
  title: "Interface direction",
  components: [DirectionWrapper],
  params: [
    {
      name: "left-to-right",
      props: { interfaceDirection: "ltr" },
      default: true,
    },
    {
      name: "right-to-left",
      props: { interfaceDirection: "rtl" },
    },
  ],
};

export default DirectionSwitcher;
