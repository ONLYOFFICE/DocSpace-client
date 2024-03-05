import React from "react";
import { Consumer } from "@docspace/shared/utils";

import { SectionBodyContent } from "../Section";

const FilesView = () => {
  return (
    <Consumer>
      {(context) => (
        <>
          {context.sectionWidth && (
            <SectionBodyContent sectionWidth={context.sectionWidth} />
          )}
        </>
      )}
    </Consumer>
  );
};

export default FilesView;
