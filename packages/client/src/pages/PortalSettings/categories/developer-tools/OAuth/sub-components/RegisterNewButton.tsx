import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";

import { DeviceUnionType } from "SRC_DIR/Hooks/useViewEffect";

export interface RegisterNewButtonProps {
  currentDeviceType?: DeviceUnionType;
}

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
