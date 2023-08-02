import Row from "@docspace/components/row";
import UsersTypeRowContent from "./UsersTypeRowContent";

const UsersTypeRow = (props) => {
  const { isChecked, onChangeCheckbox, checkbox, data, sectionWidth, id } =
    props;

  const onChange = (e) => {
    onChangeCheckbox(id, e.target.checked);
  };

  return (
    <>
      <Row
        sectionWidth={sectionWidth}
        key={data.id}
        data={data}
        checked={checkbox.includes(id)}
        checkbox={checkbox}
        onClick={onChange}
      >
        <UsersTypeRowContent
          sectionWidth={sectionWidth}
          displayName={data.displayName}
          email={data.email}
          type={data.type}
          isChecked={isChecked}
          onChangeCheckbox={onChangeCheckbox}
        />
      </Row>
    </>
  );
};

export default UsersTypeRow;
