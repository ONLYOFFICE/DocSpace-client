import { create } from "@storybook/theming/create";
import Logo from "./darksmall.svg?url";
import { globalColors } from "../themes";

export default create({
  base: "dark",
  appBg: globalColors.black,

  brandTitle: "ONLYOFFICE",
  brandUrl: "https://www.onlyoffice.com/docspace.aspx",
  brandImage: Logo,
  brandTarget: "_self",
});
