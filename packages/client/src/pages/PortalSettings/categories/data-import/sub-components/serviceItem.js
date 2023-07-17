import { ReactSVG } from "react-svg";
import Link from "@docspace/components/link";
import Box from "@docspace/components/box";

const ServiceItem = ({ t, logo, onClick }) => {
  return (
    <Box className="service-wrapper">
      <ReactSVG src={logo} />
      <Link
        type="page"
        fontWeight="600"
        color="#4781D1"
        isTextOverflow
        onClick={onClick}
      >
        {t("Settings:Import")}
      </Link>
    </Box>
  );
};

export default ServiceItem;
