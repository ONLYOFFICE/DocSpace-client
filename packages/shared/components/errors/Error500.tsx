import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Error500SvgUrl from "PUBLIC_DIR/images/error500.svg?url";
import ErrorContainer from "../error-container/ErrorContainer";

const Error500 = () => {
  const { t } = useTranslation("Common");
  const navigate = useNavigate();

  const onClick = () => {
    navigate(-1);
  };

  return (
    <ErrorContainer
      headerText={t("Error500HeaderText")}
      customizedBodyText={t("Error500BodyText")}
      img={Error500SvgUrl}
      withImg
      buttonText={t("GoBack")}
      onClickButton={onClick}
    />
  );
};

export default Error500;
