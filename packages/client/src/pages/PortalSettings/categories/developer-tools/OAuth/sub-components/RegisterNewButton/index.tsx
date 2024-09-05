import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";

import { RegisterNewButtonProps } from "./RegisterNewButton.types";

const RegisterNewButton = ({ currentDeviceType }: RegisterNewButtonProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  const navigate = useNavigate();

  const onClick = () => {
    navigate("create");
  };

  return (
    <Button
      className="add-button"
      size={
        currentDeviceType !== "desktop" ? ButtonSize.normal : ButtonSize.small
      }
      label={t("RegisterNewApp")}
      primary
      onClick={onClick}
    />
  );
};

export default RegisterNewButton;
