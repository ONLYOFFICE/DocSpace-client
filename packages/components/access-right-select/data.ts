// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/actions.docu... Remove this comment to see the full error message
import ActionsDocumentReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/check.react.... Remove this comment to see the full error message
import CheckReactSvgUrl from "PUBLIC_DIR/images/check.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/access.edit.... Remove this comment to see the full error message
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/access.revie... Remove this comment to see the full error message
import AccessReviewReactSvgUrl from "PUBLIC_DIR/images/access.review.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/access.comme... Remove this comment to see the full error message
import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/eye.react.sv... Remove this comment to see the full error message
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/access.none.... Remove this comment to see the full error message
import AccessNoneReactSvgUrl from "PUBLIC_DIR/images/access.none.react.svg?url";

export const data = [
  {
    key: "key1",
    label: "Room administrator",
    description: `Administration of rooms, archiving of rooms, inviting and managing users in rooms.`,
    quota: "free",
    color: "#20D21F",
  },
  {
    key: "key2",
    label: "Full access",
    description: `Edit, upload, create, view, download, delete files and folders.`,
    quota: "paid",
    color: "#EDC409",
  },

  { key: "key3", isSeparator: true },
  {
    key: "key4",
    label: "Editing",
    description: `Editing, viewing, downloading files and folders, filling out forms.`,
  },
  {
    key: "key5",
    label: "Review",
    description: `Reviewing, viewing, downloading files and folders, filling out forms.`,
  },
  {
    key: "key6",
    label: "Comment",
    description: `Commenting on files, viewing, downloading files and folders, filling out forms.`,
  },
  {
    key: "key7",
    label: "Read only",
    description: `Viewing, downloading files and folders, filling out forms.`,
  },
  {
    key: "key8",
    label: "Deny access",
    description: "",
  },
];
