import { useParams } from "react-router-dom";

import ClientForm from "../sub-components/ClientForm";

const OAuthEditPage = () => {
  const { id } = useParams();

  return <ClientForm id={id} />;
};

export default OAuthEditPage;
