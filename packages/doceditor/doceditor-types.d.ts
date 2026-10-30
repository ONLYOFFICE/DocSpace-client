// Augments the editor configuration types of @onlyoffice/doceditor-types.
// This file is a module on purpose: an ambient `declare module` in a script
// file would shadow the package instead of extending it.

export {};

declare module "@onlyoffice/doceditor-types" {
  interface EditorConfigBase {
    // Spec: editor-integration, "DEK handed to the editor configuration".
    encryptionKeys?: {
      dek: string;
      cryptoEngineId?: string;
      contractVersion: number;
    };
  }
}
