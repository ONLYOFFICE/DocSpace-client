import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Error404SvgUrl from "PUBLIC_DIR/images/error404.svg?url";
import ErrorContainer from "../error-container/ErrorContainer";

const Error404 = () => {
  const { t, ready } = useTranslation("Common");
  const navigate = useNavigate();

  const onClick = () => {
    navigate(-1);
  };

  return (
    ready && (
      <ErrorContainer
        headerText={t("Error404HeaderText")}
        customizedBodyText={t("Error404BodyText")}
        img={Error404SvgUrl}
        withImg
        buttonText={t("GoBack")}
        onClickButton={onClick}
      />
    )
  );
};

export default Error404;
