import { useNavigate } from "react-router-dom";

import Button from "@docspace/components/button";

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
      //@ts-ignore
      className="add-button"
      size={currentDeviceType !== "desktop" ? "normal" : "small"}
      label={t("RegisterNewApp")}
      primary={true}
      onClick={onClick}
    />
  );
};

export default RegisterNewButton;
