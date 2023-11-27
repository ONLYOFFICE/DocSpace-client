import React from "react";
import AvatarEditorComponent from "./";
import Avatar from "../avatar";

export default {
  title: "Components/AvatarEditor",
  component: AvatarEditorComponent,
  argTypes: {
    openEditor: { action: "onOpen", table: { disable: true } },
    closeEditor: { action: "onClose", table: { disable: true } },
    onSave: { action: "onSave", table: { disable: true } },
    onLoadFile: { action: "onLoadFile", table: { disable: true } },
    onImageChange: { action: "onImageChange", table: { disable: true } },
    onDeleteImage: { action: "onDeleteImage", table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component: "Used to display user avatar editor on page.",
      },
    },
  },
};

class AvatarEditor extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {
      isOpen: false,
      userImage: null,
    };

    this.openEditor = this.openEditor.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onLoadFile = this.onLoadFile.bind(this);
    this.onImageChange = this.onImageChange.bind(this);
    this.onDeleteImage = this.onDeleteImage.bind(this);
  }

  onDeleteImage() {
    // @ts-expect-error TS(2339): Property 'onDeleteImage' does not exist on type 'R... Remove this comment to see the full error message
    this.props.onDeleteImage();
  }
  onImageChange(img: any) {
    // @ts-expect-error TS(2339): Property 'onImageChange' does not exist on type 'R... Remove this comment to see the full error message
    this.props.onImageChange(img);
    this.setState({
      userImage: img,
    });
  }
  onLoadFile(file: any) {
    // @ts-expect-error TS(2339): Property 'onLoadFile' does not exist on type 'Read... Remove this comment to see the full error message
    this.props.onLoadFile(file);
  }
  onSave(isUpdate: any, data: any) {
    // @ts-expect-error TS(2339): Property 'onSave' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.props.onSave(isUpdate, data);
    this.setState({
      isOpen: false,
    });
  }
  openEditor(e: any) {
    // @ts-expect-error TS(2339): Property 'openEditor' does not exist on type 'Read... Remove this comment to see the full error message
    this.props.openEditor(e);
    this.setState({
      isOpen: true,
    });
  }
  onClose() {
    // @ts-expect-error TS(2339): Property 'closeEditor' does not exist on type 'Rea... Remove this comment to see the full error message
    this.props.closeEditor();
    this.setState({
      isOpen: false,
    });
  }
  render() {
    const {
      // @ts-expect-error TS(2339): Property 'unknownError' does not exist on type 'Re... Remove this comment to see the full error message
      unknownError,
      // @ts-expect-error TS(2339): Property 'unknownTypeError' does not exist on type... Remove this comment to see the full error message
      unknownTypeError,
      // @ts-expect-error TS(2339): Property 'saveButtonLoading' does not exist on typ... Remove this comment to see the full error message
      saveButtonLoading,
      // @ts-expect-error TS(2339): Property 'maxSizeFileError' does not exist on type... Remove this comment to see the full error message
      maxSizeFileError,
    } = this.props;
    return (
      <>
        <Avatar
          size="max"
          role="user"
          // @ts-expect-error TS(2339): Property 'userImage' does not exist on type 'Reado... Remove this comment to see the full error message
          source={this.state.userImage}
          editing={true}
          editAction={this.openEditor}
        />
        // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
        {this.props.children}
        <AvatarEditorComponent
          {...this.props}
          // @ts-expect-error TS(2322): Type '{ visible: any; onClose: () => void; onSave:... Remove this comment to see the full error message
          visible={this.state.isOpen || this.props.visible}
          onClose={this.onClose}
          onSave={this.onSave}
          onCancel={this.onClose}
          onDeleteImage={this.onDeleteImage}
          onImageChange={this.onImageChange}
          onLoadFile={this.onLoadFile}
          chooseFileLabel={"Drop files here, or click to select files"}
          chooseMobileFileLabel={"Click to select files"}
          saveButtonLoading={saveButtonLoading}
          maxSizeFileError={maxSizeFileError || "Maximum file size exceeded"}
          unknownTypeError={unknownTypeError || "Unknown image file type"}
          unknownError={unknownError || "Error"}
        />
      </>
    );
  }
}
const Template = (args: any) => {
  return <AvatarEditor {...args} />;
};
export const Default = Template.bind({});
