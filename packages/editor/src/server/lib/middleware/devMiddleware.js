import winston from "../logger.js";
import { getAssets, initDocEditor } from "../helpers";

winston.stream = {
  write: (message) => winston.info(message),
};

export default async (req, res, next) => {
  try {
    const assets = await getAssets();
    req.initialEditorState = await initDocEditor(req);

    if (req.initialEditorState.isSettingsError) {
      res.redirect("/access-restricted");
    }

    req.assets = assets;
  } catch (e) {
    winston.error(e.message);
  }
  next();
};
