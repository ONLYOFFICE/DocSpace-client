import { create } from "@storybook/theming/create";

import Logo from "../../../public/images/logo/lightsmall.svg?url";
import { ONLYOFFICE_URL } from "../constants";
export default create({
  base: "light",

  brandTitle: "ONLYOFFICE",
  brandUrl: `${ONLYOFFICE_URL}/docspace.aspx`,
  brandImage: Logo,
  brandTarget: "_self",
});
