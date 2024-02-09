export const mediaTypes = Object.freeze({
  audio: 1,
  video: 2,
  pdf: 3,
});

export const mapSupplied: Readonly<
  Record<string, { supply: string; type: number; convertable?: boolean }>
> = Object.freeze({
  ".aac": { supply: "m4a", type: mediaTypes.audio },
  ".flac": { supply: "mp3", type: mediaTypes.audio },
  ".m4a": { supply: "m4a", type: mediaTypes.audio },
  ".mp3": { supply: "mp3", type: mediaTypes.audio },
  ".oga": { supply: "oga", type: mediaTypes.audio },
  ".ogg": { supply: "oga", type: mediaTypes.audio },
  ".wav": { supply: "wav", type: mediaTypes.audio },

  ".f4v": { supply: "m4v", type: mediaTypes.video },
  ".m4v": { supply: "m4v", type: mediaTypes.video },
  ".mov": { supply: "m4v", type: mediaTypes.video },
  ".mp4": { supply: "m4v", type: mediaTypes.video },
  ".ogv": { supply: "ogv", type: mediaTypes.video },
  ".webm": { supply: "webmv", type: mediaTypes.video },
  ".wmv": { supply: "m4v", type: mediaTypes.video, convertable: true },
  ".avi": { supply: "m4v", type: mediaTypes.video, convertable: true },
  ".mpeg": { supply: "m4v", type: mediaTypes.video, convertable: true },
  ".mpg": { supply: "m4v", type: mediaTypes.video, convertable: true },
  ".pdf": { supply: "pdf", type: mediaTypes.pdf },
});
