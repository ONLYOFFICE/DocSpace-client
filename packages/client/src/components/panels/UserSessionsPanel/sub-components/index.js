import { Consumer } from "@docspace/shared/utils";
import RowView from "./RowView";

const RowWrapper = ({ t, sessionsData }) => {
  return (
    <Consumer>
      {(context) => (
        <RowView
          t={t}
          sectionWidth={context.sectionWidth}
          sessionsData={sessionsData}
        />
      )}
    </Consumer>
  );
};

export default RowWrapper;
