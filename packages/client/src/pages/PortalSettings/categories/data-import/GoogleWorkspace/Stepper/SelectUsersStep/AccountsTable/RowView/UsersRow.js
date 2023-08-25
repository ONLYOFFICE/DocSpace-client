import Row from "@docspace/components/row";
import UsersRowContent from "./UsersRowContent";

const UsersRow = (props) => {
  const { data, sectionWidth, isChecked, toggleAccount } = props;

  return (
    <>
      <Row
        sectionWidth={sectionWidth}
        data={data}
        checkbox
        checked={isChecked}
        onClick={toggleAccount}
        onSelect={toggleAccount}
        contextButtonSpacerWidth="0"
      >
        <UsersRowContent
          sectionWidth={sectionWidth}
          displayName={data.displayName}
          email={data.email}
          dublicate={data.dublicate}
        />
      </Row>
    </>
  );
};

export default UsersRow;
