import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Error401SvgUrl from "PUBLIC_DIR/images/error401.svg?url";
import ErrorContainer from "../error-container/ErrorContainer";

const Error401 = () => {
  const { t } = useTranslation("Common");
  const navigate = useNavigate();

  const onClick = () => {
    navigate(-1);
  };

  return (
    <ErrorContainer
      headerText={t("Error401HeaderText")}
      customizedBodyText={t("Error401BodyText")}
      img={Error401SvgUrl}
      withImg
      buttonText={t("GoBack")}
      onClickButton={onClick}
    />
  );
};

export default Error401;
