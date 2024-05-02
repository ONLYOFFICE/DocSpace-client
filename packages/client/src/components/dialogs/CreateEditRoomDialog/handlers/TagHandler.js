// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

class TagHandler {
  constructor(tags, setTags, fetchedTags) {
    this.tags = tags;
    this.setTags = setTags;
    this.fetchedTags = fetchedTags;
  }

  createRandomTagId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }

  refreshDefaultTag(name) {
    let newTags = [...this.tags].filter((tag) => !tag.isDefault);
    newTags.unshift({
      id: this.createRandomTagId(),
      name,
      isDefault: true,
    });

    this.setTags(newTags);
  }

  addTag(name) {
    let newTags = [...this.tags];

    if (this.isAlreadyAdded(name)) {
      return; //already added
    }

    newTags.push({
      id: this.createRandomTagId(),
      name,
    });
    this.setTags(newTags);
  }

  isAlreadyAdded(name) {
    return !!this.tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
  }

  isNew(name) {
    return !this.fetchedTags.find(
      (t) => t.toLowerCase() === name.toLowerCase(),
    );
  }

  addNewTag(name) {
    let newTags = [...this.tags];

    if (this.isAlreadyAdded(name)) {
      return; //already added
    }

    newTags.push({
      id: this.createRandomTagId(),
      isNew: this.isNew(name),
      name,
    });
    this.setTags(newTags);
  }

  deleteTag(id) {
    let newTags = [...this.tags];
    newTags = newTags.filter((tag) => tag.id !== id);
    this.setTags(newTags);
  }
}

export default TagHandler;
