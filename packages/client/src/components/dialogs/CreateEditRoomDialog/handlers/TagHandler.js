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
      (t) => t.toLowerCase() === name.toLowerCase()
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
