import Card from "../Card";
import Loaders from "../Loaders";

import type { ColumnBodyContentProps } from "./Column.props";

function ColumnBodyContent({
  isLoading,
  filesByRole,
  onSelected,
}: ColumnBodyContentProps) {
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
        return <Card key={file.id} file={file} onSelected={onSelected} />;
      })}
    </>
  );
}

export default ColumnBodyContent;
