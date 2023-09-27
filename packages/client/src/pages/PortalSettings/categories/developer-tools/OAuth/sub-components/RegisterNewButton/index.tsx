import { useNavigate } from "react-router-dom";
import { isMobile } from "react-device-detect";

import Button from "@docspace/components/button";

import { RegisterNewButtonProps } from "./RegisterNewButton.types";

const RegisterNewButton = ({ t }: RegisterNewButtonProps) => {
  const navigate = useNavigate();

  const onClick = () => {
    navigate("create");
  };

  return (
    <Button
      //@ts-ignore
      size={isMobile ? "normal" : "small"}
      label={t("RegisterNewApp")}
      primary={true}
      onClick={onClick}
    />
  );
};

export default RegisterNewButton;
