import { Consumer } from "@docspace/shared/utils";
import RowView from "./RowView";

const RowWrapper = ({ t, connections }) => {
  return (
    <Consumer>
      {(context) => (
        <RowView
          t={t}
          sectionWidth={context.sectionWidth}
          connections={connections}
        />
      )}
    </Consumer>
  );
};

export default RowWrapper;
