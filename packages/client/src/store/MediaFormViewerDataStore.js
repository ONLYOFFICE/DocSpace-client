import { makeAutoObservable, runInAction } from "mobx";
import {
  isNullOrUndefined,
  findNearestIndex,
  isVideo,
} from "@docspace/common/components/MediaViewer/helpers";
import { thumbnailStatuses } from "SRC_DIR/helpers/filesConstants";

const FirstUrlKey = "isFirstUrl";

class MediaFormViewerDataStore {
  oformsStore;
  settingsStore;

  id = null;
  visible = false;
  currentItem = null;
  prevPostionIndex = 0;

  constructor(oformsStore, settingsStore) {
    makeAutoObservable(this);
    this.oformsStore = oformsStore;
    this.settingsStore = settingsStore;
  }

  setCurrentId = (id) => (this.id = id);

  setCurrentItem = (item) => (this.currentItem = item);

  setMediaViewerData = (mediaData) => {
    this.id = mediaData.id;
    this.visible = mediaData.visible;

    if (!mediaData.visible) this.setCurrentItem(null);
  };

  saveFirstUrl = (url) => localStorage.setItem(FirstUrlKey, url);

  getFirstUrl = () => localStorage.getItem(FirstUrlKey);

  removeFirstUrl = () => localStorage.removeItem(FirstUrlKey);

  changeUrl = (id) => {
    const url = `/form-gallery/${this.oformsStore.oformFromFolderId}/#preview/${id}`;
    window.DocSpace.navigate(url);
  };

  nextMedia = () => {
    const { oformFiles, setGallerySelected } = this.oformsStore;

    const postionIndex = (this.currentPostionIndex + 1) % this.playlist.length;
    if (postionIndex === 0) return;

    const currentFileId = this.playlist[postionIndex].fileId;
    const targetFile = oformFiles.find((item) => item.id === currentFileId);

    if (!isNullOrUndefined(targetFile)) setGallerySelected(targetFile);

    const fileId = this.playlist[postionIndex].fileId;
    this.setCurrentId(fileId);
    this.changeUrl(fileId);
  };

  prevMedia = () => {
    const { oformFiles, setGallerySelected } = this.oformsStore;

    const currentPlaylistPos = this.currentPostionIndex - 1;
    if (currentPlaylistPos === -1) return;

    const currentFileId = this.playlist[currentPlaylistPos].fileId;
    const targetFile = oformFiles.find((item) => item.id === currentFileId);
    if (!isNullOrUndefined(targetFile)) setGallerySelected(targetFile);

    const fileId = this.playlist[currentPlaylistPos].fileId;
    this.setCurrentId(fileId);
    this.changeUrl(fileId);
  };

  get currentPostionIndex() {
    if (this.playlist.length === 0) return 0;

    let index = this.playlist.find((file) => file.fileId === this.id)?.id;

    if (isNullOrUndefined(index))
      index = findNearestIndex(this.playlist, this.prevPostionIndex);

    runInAction(() => {
      this.prevPostionIndex = index;
    });

    return index;
  }

  get playlist() {
    const { oformFiles } = this.oformsStore;

    if (!oformFiles) return [];

    const playlist = oformFiles.map((oform, index) => ({
      id: index,
      fileId: oform.id,
      src: oform.attributes.template_image.data.attributes.formats.large?.url,
      title: oform.attributes.name_form,
      fileExst:
        oform.attributes.template_image.data.attributes.formats.large?.ext,
      fileStatus: 0,
      canShare: false,
      version: 1,
      thumbnailUrl:
        oform.attributes.template_image.data.attributes.formats.large?.url,
    }));

    console.log(playlist);
    return playlist;
  }
}

export default MediaFormViewerDataStore;
