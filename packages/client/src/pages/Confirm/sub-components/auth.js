import React, { useEffect } from "react";
import { Loader } from "@docspace/shared/components/loader";
import Section from "@docspace/shared/components/section";
import { loginWithConfirmKey } from "@docspace/shared/api/user";
import { useSearchParams } from "react-router-dom";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { toastr } from "@docspace/shared/components/toast";
import { frameCallEvent } from "@docspace/shared/utils/common";
import SectionWrapper from "SRC_DIR/components/Section";
const Auth = (props) => {
  //console.log("Auth render");
  const { linkData } = props;
  let [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    loginWithConfirmKey({
      ConfirmData: {
        Email: linkData.email,
        Key: linkData.key,
      },
    })
      .then((res) => {
        //console.log("Login with confirm key success", res);
        frameCallEvent({ event: "onAuthSuccess" });

        const url = searchParams.get("referenceUrl");
        if (url) {
          return window.location.replace(
            combineUrl(window.location.origin, url)
          );
        }

        if (typeof res === "string") window.location.replace(res);
        else window.location.replace("/");
      })
      .catch((error) => {
        frameCallEvent({ event: "onAppError", data: error });
        toastr.error(error);
      });
  });

  return <Loader className="pageLoader" type="rombs" size="40px" />;
};

const AuthPage = (props) => (
  <SectionWrapper>
    <Section.SectionBody>
      <Auth {...props} />
    </Section.SectionBody>
  </SectionWrapper>
);

export default AuthPage;
