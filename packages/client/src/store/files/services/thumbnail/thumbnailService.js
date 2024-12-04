import api from "@docspace/shared/api";
import { thumbnailStatuses } from "SRC_DIR/helpers/filesConstants";

const THUMBNAILS_CACHE = 500;

class ThumbnailService {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.thumbnails = new Set();
  }

  async createThumbnails(files = null) {
    if ((this.rootStore.viewAs !== "tile" || !this.rootStore.files) && !files)
      return;

    const currentFiles = files || this.rootStore.files;

    const newFiles = currentFiles.filter((f) => {
      return (
        typeof f.id !== "string" &&
        f?.thumbnailStatus === thumbnailStatuses.WAITING &&
        !this.thumbnails.has(`${f.id}|${f.versionGroup}`)
      );
    });

    if (!newFiles.length) return;

    if (this.thumbnails.size > THUMBNAILS_CACHE) this.thumbnails.clear();

    newFiles.forEach((f) => this.thumbnails.add(`${f.id}|${f.versionGroup}`));

    console.log("thumbnails", this.thumbnails);

    const fileIds = newFiles.map((f) => f.id);

    const res = await api.files.createThumbnails(fileIds);

    return res;
  }

  async createThumbnail(file) {
    if (
      this.rootStore.viewAs !== "tile" ||
      !file ||
      !file.id ||
      typeof file.id === "string" ||
      file.thumbnailStatus !== thumbnailStatuses.WAITING ||
      this.thumbnails.has(`${file.id}|${file.versionGroup}`)
    ) {
      return;
    }

    if (this.thumbnails.size > THUMBNAILS_CACHE) this.thumbnails.clear();

    this.thumbnails.add(`${file.id}|${file.versionGroup}`);

    console.log("thumbnails", this.thumbnails);

    const res = await api.files.createThumbnails([file.id]);

    return res;
  }
}

export default ThumbnailService;
