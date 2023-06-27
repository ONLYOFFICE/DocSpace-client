import { useState, useEffect } from "react";
import { observer, inject } from "mobx-react";
import { ReactSVG } from "react-svg";
// import { mockData } from "./mockData.js";
import { FillingStatusContainer } from "./StyledFillingStatusLine";
import FillingStatusAccordion from "./FillingStatusAccordion";
import StatusDoneReactSvgUrl from "PUBLIC_DIR/images/done.react.svg?url";
import StatusInterruptedSvgUrl from "PUBLIC_DIR/images/interrupted.react.svg?url";

import Text from "@docspace/components/text";
import Box from "@docspace/components/box";

const FillingStatusLine = ({
  selection,
  fileId,
  locale,
  statusDone,
  statusInterrupted,
  getStatusFillingForm,
}) => {
  const [fillingStatusInfo, setfillingStatusInfo] = useState([]);
  const [showIcon, setShowIcon] = useState(false);

  const getStatusIcon = (value) => {
    setShowIcon(value);
  };

  useEffect(() => {
    getStatusFillingForm(selection?.id || fileId).then((res) => {
      setfillingStatusInfo(res);
    });
  }, []);

  const statusIcon = statusInterrupted
    ? StatusInterruptedSvgUrl
    : StatusDoneReactSvgUrl;

  const statusIconClassName = statusInterrupted
    ? "status-interrupted-icon"
    : "status-done-icon";

  const statusTextClassName = statusInterrupted
    ? "status-interrupted-text"
    : "status-done-text";

  const statusText = statusInterrupted ? "Interrupted" : "Done";

  return (
    <FillingStatusContainer
      isFilled={statusDone}
      isInterrupted={statusInterrupted}
    >
      {fillingStatusInfo.map((data) => {
        return (
          <FillingStatusAccordion
            key={data.id}
            displayName={data.assigned.displayName}
            avatar={data.assigned.avatarSmall}
            role={data.title}
            formFillingSteps={data.formFillingSteps}
            locale={locale}
            getStatusIcon={getStatusIcon}
          />
        );
      })}

      {showIcon && (
        <Box displayProp="flex" alignItems="center" marginProp="15px 0 0">
          <ReactSVG src={statusIcon} className={statusIconClassName} />
          <Text className={statusTextClassName}>{statusText}</Text>
        </Box>
      )}
    </FillingStatusContainer>
  );
};

export default inject(({ auth, filesStore }) => {
  const { getRolesUsersForFillingForm } = filesStore;
  const { culture } = auth.settingsStore;
  const { user } = auth.userStore;
  const locale = (user && user.cultureName) || culture || "en";
  const statusDone = false;
  const statusInterrupted = false;

  return {
    statusDone,
    statusInterrupted,
    locale,
    getStatusFillingForm: getRolesUsersForFillingForm,
  };
})(observer(FillingStatusLine));
