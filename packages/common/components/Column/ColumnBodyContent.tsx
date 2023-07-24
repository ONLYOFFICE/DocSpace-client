import Card from "../Card";
import Loaders from "../Loaders";

import type { ColumnBodyContentProps } from "./Column.props";

function ColumnBodyContent({ isLoading, filesByRole }: ColumnBodyContentProps) {
  if (isLoading) {
    return (
      <>
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
      </>
    );
  }

  return (
    <>
      {filesByRole?.map((file) => {
        return (
          <Card key={file.id} filename={file.title} username={file.title} />
        );
      })}
    </>
  );
}

export default ColumnBodyContent;
