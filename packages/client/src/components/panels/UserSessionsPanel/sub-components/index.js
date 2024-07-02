import { Consumer } from "@docspace/shared/utils";
import RowView from "./RowView";

const RowWrapper = ({ t, sessions }) => {
  return (
    <Consumer>
      {(context) => (
        <RowView
          t={t}
          sectionWidth={context.sectionWidth}
          sessions={sessions}
        />
      )}
    </Consumer>
  );
};

export default RowWrapper;
