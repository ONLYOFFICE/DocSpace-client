import { create } from "@storybook/theming/create";
import Logo from "../../../public/images/logo/dark_lightsmall.svg?url";
import { globalColors } from "../themes";
import { ONLYOFFICE_URL } from "../constants";

export default create({
  base: "dark",
  appBg: globalColors.black,

  brandTitle: "ONLYOFFICE",
  brandUrl: `${ONLYOFFICE_URL}/docspace.aspx`,
  brandImage: Logo,
  brandTarget: "_self",
});
