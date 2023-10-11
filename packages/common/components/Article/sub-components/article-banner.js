import { useState, useEffect } from "react";
import { ADS_TIMEOUT } from "@docspace/client/src/helpers/filesConstants";
import { LANGUAGE } from "@docspace/common/constants";
import { getLanguage, getCookie } from "@docspace/common/utils";

import { StyledIframe, StyledAction, StyledCrossIcon } from "../styled-article";

const Banner = () => {
  const [url, setUrl] = useState("");

  const banners = (localStorage.getItem("docspace_banners") || "")
    .split(",")
    .filter((banner) => banner.length > 0);

  const lng = getCookie(LANGUAGE) || "en";
  const language = getLanguage(lng instanceof Array ? lng[0] : lng);

  const getBanner = async () => {
    let index = Number(localStorage.getItem("bannerIndex") || 0);
    const currentBanner = banners[index];
    if (banners.length < 1 || index + 1 >= banners.length) {
      index = 0;
    } else {
      index++;
    }

    localStorage.setItem("bannerIndex", index);

    const url = window.firebaseHelper.config.authDomain
      ? `https://${window.firebaseHelper.config.authDomain}/${language}/${currentBanner}/index.html`
      : null;
    setUrl(url);
  };

  useEffect(() => {
    getBanner();
    const adsInterval = setInterval(getBanner, ADS_TIMEOUT);
    return () => clearInterval(adsInterval);
  }, []);

  return (
    <>
      {url && (
        <div id="campaigns-banner" style={{ position: "relative" }}>
          <StyledIframe
            id="campaigns-frame"
            src={url}
            scrolling="no"
            loading="lazy"
          />{" "}
          <StyledAction className="action">
            <StyledCrossIcon size="medium" />
          </StyledAction>
        </div>
      )}
    </>
  );
};

export default Banner;
