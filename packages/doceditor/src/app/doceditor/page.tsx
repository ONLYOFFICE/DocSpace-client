"use client";

import { DocumentEditor } from "@onlyoffice/document-editor-react";

const config = {
  document: {
    fileType: "docx",
    info: {
      favorite: false,
      folder: "My documents",
      owner: "Me",
      sharingSettings: [
        {
          user: "Me",
          permissions: "Full Access",
        },
      ],
      type: 0,
      uploaded: "12/19/2023 09:21",
    },
    isLinkedForMe: false,
    key: "3Qs7f_MQw6HAEVMqehSBQfDeEKQqGs1C1_M33kzGs6k_",
    permissions: {
      changeHistory: false,
      comment: true,
      download: true,
      edit: true,
      fillForms: false,
      modifyFilter: true,
      print: true,
      rename: true,
      review: true,
      copy: true,
    },
    referenceData: {
      fileKey: 653796,
      instanceId: "184",
    },
    title: "Новый документ.docx",
    url: "https://uzbekistan.onlyoffice.io/filehandler.ashx?action=stream&fileid=653796&stream_auth=442188823390.YQYQKUZDSU44WDVLAKKFPWPJGV0NW4HOSGDN7ZN2U",
  },
  documentType: "word",
  editorConfig: {
    callbackUrl:
      "https://uzbekistan.onlyoffice.io/filehandler.ashx?action=track&fileid=653796&stream_auth=442188823446.GJEL2CARK4MK5M5XOYBEPV33AJXRIF7GRT7PYY3LKW",
    createUrl:
      "https://uzbekistan.onlyoffice.io/filehandler.ashx?action=create&doctype=word&title=New+Document",
    customization: {
      about: true,
      feedback: {
        url: "https://helpdesk.onlyoffice.com",
        visible: true,
      },
      forcesave: true,
      goback: {
        url: "https://uzbekistan.onlyoffice.io/#11240",
      },
      logo: {
        image:
          "https://uzbekistan.onlyoffice.io/static/images/logo/docseditor.svg",
        imageDark:
          "https://uzbekistan.onlyoffice.io/static/images/logo/docseditor.svg",
        url: "https://uzbekistan.onlyoffice.io/",
      },
      mentionShare: true,
      submitForm: false,
    },
    lang: "en-GB",
    mode: "edit",
    modeWrite: true,
    plugins: {
      pluginsData: [],
    },
    recent: [
      {
        folder: "Public room",
        title: "sample.pdf",
        url: "https://uzbekistan.onlyoffice.io/doceditor?fileid=649535",
      },
      {
        folder: "Tashkent",
        title: "DWSample1-DOC.docx",
        url: "https://uzbekistan.onlyoffice.io/doceditor?fileid=645728",
      },
      {
        folder: "Tashkent",
        title: "Новый документ.docx",
        url: "https://uzbekistan.onlyoffice.io/doceditor?fileid=646369",
      },
      {
        folder: "My documents",
        title: "New document.docx",
        url: "https://uzbekistan.onlyoffice.io/doceditor?fileid=648031",
      },
      {
        folder: "New folder",
        title: "Новый документ.docx",
        url: "https://uzbekistan.onlyoffice.io/doceditor?fileid=653629",
      },
      {
        folder: "My documents",
        title: "DocSpace - users.pdf",
        url: "https://uzbekistan.onlyoffice.io/doceditor?fileid=646795",
      },
      {
        folder: "My documents",
        title: "200MB-TESTFILE.ORG.pdf",
        url: "https://uzbekistan.onlyoffice.io/doceditor?fileid=653358",
      },
      {
        folder: "My documents",
        title: "مستند جديد.docx",
        url: "https://uzbekistan.onlyoffice.io/doceditor?fileid=647760",
      },
      {
        folder: "My documents",
        title: "DWSample1.DOC.docx",
        url: "https://uzbekistan.onlyoffice.io/doceditor?fileid=646801",
      },
    ],
    templates: [],
    user: {
      id: "7ea27dbc-e760-4832-bd23-960c46cae082",
      name: "Alexey Safronov",
    },
  },
  editorType: 0,
  editorUrl: "https://asc.docs.teamlab.info/web-apps/apps/api/documents/api.js",
  token:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkb2N1bWVudCI6eyJmaWxlVHlwZSI6ImRvY3giLCJpbmZvIjp7ImZhdm9yaXRlIjpmYWxzZSwiZm9sZGVyIjoiTXkgZG9jdW1lbnRzIiwib3duZXIiOiJNZSIsInNoYXJpbmdTZXR0aW5ncyI6W3sidXNlciI6Ik1lIiwicGVybWlzc2lvbnMiOiJGdWxsIEFjY2VzcyJ9XSwidHlwZSI6MCwidXBsb2FkZWQiOiIxMi8xOS8yMDIzIDA5OjIxIn0sImlzTGlua2VkRm9yTWUiOmZhbHNlLCJrZXkiOiIzUXM3Zl9NUXc2SEFFVk1xZWhTQlFmRGVFS1FxR3MxQzFfTTMza3pHczZrXyIsInBlcm1pc3Npb25zIjp7ImNoYW5nZUhpc3RvcnkiOmZhbHNlLCJjb21tZW50Ijp0cnVlLCJkb3dubG9hZCI6dHJ1ZSwiZWRpdCI6dHJ1ZSwiZmlsbEZvcm1zIjpmYWxzZSwibW9kaWZ5RmlsdGVyIjp0cnVlLCJwcmludCI6dHJ1ZSwicmVuYW1lIjp0cnVlLCJyZXZpZXciOnRydWUsImNvcHkiOnRydWV9LCJyZWZlcmVuY2VEYXRhIjp7ImZpbGVLZXkiOjY1Mzc5NiwiaW5zdGFuY2VJZCI6IjE4NCJ9LCJ0aXRsZSI6Ilx1MDQxRFx1MDQzRVx1MDQzMlx1MDQ0Qlx1MDQzOSBcdTA0MzRcdTA0M0VcdTA0M0FcdTA0NDNcdTA0M0NcdTA0MzVcdTA0M0RcdTA0NDIuZG9jeCIsInVybCI6Imh0dHBzOi8vdXpiZWtpc3Rhbi5vbmx5b2ZmaWNlLmlvL2ZpbGVoYW5kbGVyLmFzaHg_YWN0aW9uPXN0cmVhbVx1MDAyNmZpbGVpZD02NTM3OTZcdTAwMjZzdHJlYW1fYXV0aD00NDIxODg4MjMzOTAuWVFZUUtVWkRTVTQ0V0RWTEFLS0ZQV1BKR1YwTlc0SE9TR0RON1pOMlUifSwiZG9jdW1lbnRUeXBlIjoid29yZCIsImVkaXRvckNvbmZpZyI6eyJjYWxsYmFja1VybCI6Imh0dHBzOi8vdXpiZWtpc3Rhbi5vbmx5b2ZmaWNlLmlvL2ZpbGVoYW5kbGVyLmFzaHg_YWN0aW9uPXRyYWNrXHUwMDI2ZmlsZWlkPTY1Mzc5Nlx1MDAyNnN0cmVhbV9hdXRoPTQ0MjE4ODgyMzM5My5MMDZWUlA5U1ZXQkxZNlVMUUZLVFZMRUtWMFM2OEpQTTM0RzhQSFhFTUUiLCJjcmVhdGVVcmwiOiJodHRwczovL3V6YmVraXN0YW4ub25seW9mZmljZS5pby9maWxlaGFuZGxlci5hc2h4P2FjdGlvbj1jcmVhdGVcdTAwMjZkb2N0eXBlPXdvcmRcdTAwMjZ0aXRsZT1OZXdcdTAwMkJEb2N1bWVudCIsImN1c3RvbWl6YXRpb24iOnsiYWJvdXQiOnRydWUsImZlZWRiYWNrIjp7InVybCI6Imh0dHBzOi8vaGVscGRlc2sub25seW9mZmljZS5jb20iLCJ2aXNpYmxlIjp0cnVlfSwiZm9yY2VzYXZlIjp0cnVlLCJnb2JhY2siOnsidXJsIjoiaHR0cHM6Ly91emJla2lzdGFuLm9ubHlvZmZpY2UuaW8vIzExMjQwIn0sImxvZ28iOnsiaW1hZ2UiOiJodHRwczovL3V6YmVraXN0YW4ub25seW9mZmljZS5pby9zdGF0aWMvaW1hZ2VzL2xvZ28vZG9jc2VkaXRvci5zdmciLCJpbWFnZURhcmsiOiJodHRwczovL3V6YmVraXN0YW4ub25seW9mZmljZS5pby9zdGF0aWMvaW1hZ2VzL2xvZ28vZG9jc2VkaXRvci5zdmciLCJ1cmwiOiJodHRwczovL3V6YmVraXN0YW4ub25seW9mZmljZS5pby8ifSwibWVudGlvblNoYXJlIjp0cnVlLCJzdWJtaXRGb3JtIjpmYWxzZX0sImxhbmciOiJlbi1HQiIsIm1vZGUiOiJlZGl0IiwibW9kZVdyaXRlIjp0cnVlLCJwbHVnaW5zIjp7InBsdWdpbnNEYXRhIjpbXX0sInJlY2VudCI6W3siZm9sZGVyIjoiUHVibGljIHJvb20iLCJ0aXRsZSI6InNhbXBsZS5wZGYiLCJ1cmwiOiJodHRwczovL3V6YmVraXN0YW4ub25seW9mZmljZS5pby9kb2NlZGl0b3I_ZmlsZWlkPTY0OTUzNSJ9LHsiZm9sZGVyIjoiVGFzaGtlbnQiLCJ0aXRsZSI6IkRXU2FtcGxlMS1ET0MuZG9jeCIsInVybCI6Imh0dHBzOi8vdXpiZWtpc3Rhbi5vbmx5b2ZmaWNlLmlvL2RvY2VkaXRvcj9maWxlaWQ9NjQ1NzI4In0seyJmb2xkZXIiOiJUYXNoa2VudCIsInRpdGxlIjoiXHUwNDFEXHUwNDNFXHUwNDMyXHUwNDRCXHUwNDM5IFx1MDQzNFx1MDQzRVx1MDQzQVx1MDQ0M1x1MDQzQ1x1MDQzNVx1MDQzRFx1MDQ0Mi5kb2N4IiwidXJsIjoiaHR0cHM6Ly91emJla2lzdGFuLm9ubHlvZmZpY2UuaW8vZG9jZWRpdG9yP2ZpbGVpZD02NDYzNjkifSx7ImZvbGRlciI6Ik15IGRvY3VtZW50cyIsInRpdGxlIjoiTmV3IGRvY3VtZW50LmRvY3giLCJ1cmwiOiJodHRwczovL3V6YmVraXN0YW4ub25seW9mZmljZS5pby9kb2NlZGl0b3I_ZmlsZWlkPTY0ODAzMSJ9LHsiZm9sZGVyIjoiTmV3IGZvbGRlciIsInRpdGxlIjoiXHUwNDFEXHUwNDNFXHUwNDMyXHUwNDRCXHUwNDM5IFx1MDQzNFx1MDQzRVx1MDQzQVx1MDQ0M1x1MDQzQ1x1MDQzNVx1MDQzRFx1MDQ0Mi5kb2N4IiwidXJsIjoiaHR0cHM6Ly91emJla2lzdGFuLm9ubHlvZmZpY2UuaW8vZG9jZWRpdG9yP2ZpbGVpZD02NTM2MjkifSx7ImZvbGRlciI6Ik15IGRvY3VtZW50cyIsInRpdGxlIjoiRG9jU3BhY2UgLSB1c2Vycy5wZGYiLCJ1cmwiOiJodHRwczovL3V6YmVraXN0YW4ub25seW9mZmljZS5pby9kb2NlZGl0b3I_ZmlsZWlkPTY0Njc5NSJ9LHsiZm9sZGVyIjoiTXkgZG9jdW1lbnRzIiwidGl0bGUiOiIyMDBNQi1URVNURklMRS5PUkcucGRmIiwidXJsIjoiaHR0cHM6Ly91emJla2lzdGFuLm9ubHlvZmZpY2UuaW8vZG9jZWRpdG9yP2ZpbGVpZD02NTMzNTgifSx7ImZvbGRlciI6Ik15IGRvY3VtZW50cyIsInRpdGxlIjoiXHUwNjQ1XHUwNjMzXHUwNjJBXHUwNjQ2XHUwNjJGIFx1MDYyQ1x1MDYyRlx1MDY0QVx1MDYyRi5kb2N4IiwidXJsIjoiaHR0cHM6Ly91emJla2lzdGFuLm9ubHlvZmZpY2UuaW8vZG9jZWRpdG9yP2ZpbGVpZD02NDc3NjAifSx7ImZvbGRlciI6Ik15IGRvY3VtZW50cyIsInRpdGxlIjoiRFdTYW1wbGUxLkRPQy5kb2N4IiwidXJsIjoiaHR0cHM6Ly91emJla2lzdGFuLm9ubHlvZmZpY2UuaW8vZG9jZWRpdG9yP2ZpbGVpZD02NDY4MDEifV0sInRlbXBsYXRlcyI6W10sInVzZXIiOnsiaWQiOiI3ZWEyN2RiYy1lNzYwLTQ4MzItYmQyMy05NjBjNDZjYWUwODIiLCJuYW1lIjoiQWxleGV5IFNhZnJvbm92In19LCJlZGl0b3JUeXBlIjowLCJ0eXBlIjoiZGVza3RvcCJ9.UYNppb17PyrszOMqgQbOq_BpF93EHcYgWxvNX2HGySQ",
  type: "desktop",
  file: {
    folderId: 11240,
    version: 2,
    versionGroup: 2,
    contentLength: "24.35 KB",
    pureContentLength: 24932,
    fileStatus: 1,
    mute: false,
    viewUrl:
      "https://uzbekistan.onlyoffice.io/filehandler.ashx?action=download&fileid=653796",
    webUrl:
      "https://uzbekistan.onlyoffice.io/doceditor?fileid=653796&version=2",
    fileType: 7,
    fileExst: ".docx",
    comment: "Edited",
    thumbnailStatus: 2,
    denyDownload: false,
    denySharing: false,
    viewAccessibility: {
      ImageView: false,
      MediaView: false,
      WebView: true,
      WebEdit: true,
      WebReview: true,
      WebCustomFilterEditing: false,
      WebRestrictedEditing: false,
      WebComment: true,
      CoAuhtoring: true,
      CanConvert: true,
      MustConvert: false,
    },
    id: 653796,
    rootFolderId: 11240,
    canShare: true,
    security: {
      Read: true,
      Comment: true,
      FillForms: true,
      Review: true,
      Edit: true,
      Delete: true,
      CustomFilter: true,
      Rename: true,
      ReadHistory: true,
      Lock: false,
      EditHistory: true,
      Copy: true,
      Move: true,
      Duplicate: true,
      SubmitToFormGallery: false,
      Download: true,
      Convert: true,
    },
    title: "Новый документ.docx",
    access: 0,
    shared: false,
    created: "2023-12-19T09:21:40.0000000+04:00",
    createdBy: {
      id: "7ea27dbc-e760-4832-bd23-960c46cae082",
      displayName: "Alexey Safronov",
      avatarSmall:
        "/storage/userPhotos/root/7ea27dbc-e760-4832-bd23-960c46cae082_size_32-32.png?hash=1212195127",
      profileUrl:
        "https://uzbekistan.onlyoffice.io/accounts/view/alexey.safronov",
      hasAvatar: true,
    },
    updated: "2023-12-21T12:34:38.0000000+04:00",
    rootFolderType: 5,
    updatedBy: {
      id: "7ea27dbc-e760-4832-bd23-960c46cae082",
      displayName: "Alexey Safronov",
      avatarSmall:
        "/storage/userPhotos/root/7ea27dbc-e760-4832-bd23-960c46cae082_size_32-32.png?hash=1212195127",
      profileUrl:
        "https://uzbekistan.onlyoffice.io/accounts/view/alexey.safronov",
      hasAvatar: true,
    },
  },
};

export default function Home() {
  function onDocumentReady(event: object): void {
    throw new Error("Function not implemented.");
  }

  return (
    <DocumentEditor
      id={"docspace_editor"}
      documentServerUrl={"https://asc.docs.teamlab.info"}
      config={config}
      height="700px"
      width="100%"
      events_onDocumentReady={onDocumentReady}
    ></DocumentEditor>
  );
}
