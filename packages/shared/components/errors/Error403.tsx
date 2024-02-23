import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Error403SvgUrl from "PUBLIC_DIR/images/error403.svg?url";
import ErrorContainer from "../error-container/ErrorContainer";

const Error403 = () => {
  const { t } = useTranslation("Common");
  const navigate = useNavigate();

  const onClick = () => {
    navigate(-1);
  };

  return (
    <ErrorContainer
      headerText={t("Error403HeaderText")}
      customizedBodyText={t("Error403BodyText")}
      img={Error403SvgUrl}
      withImg
      buttonText={t("GoBack")}
      onClickButton={onClick}
    />
  );
};

export default Error403;
