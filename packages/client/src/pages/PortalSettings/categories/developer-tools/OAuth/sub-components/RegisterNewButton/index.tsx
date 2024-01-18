import { useNavigate } from "react-router-dom";

import { Button, ButtonSize } from "@docspace/shared/components/button";

import { RegisterNewButtonProps } from "./RegisterNewButton.types";

const RegisterNewButton = ({
  t,
  currentDeviceType,
}: RegisterNewButtonProps) => {
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
