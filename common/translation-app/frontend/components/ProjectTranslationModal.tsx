"use client";

import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { getSocket } from "@/lib/socket";
import { getOllamaModels, getLanguages, translateProject, stopProjectTranslation } from "@/lib/api";

interface ProjectTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  sourceLanguage: string;
}

type Phase = "setup" | "running" | "done";

interface Progress {
  completedKeys: number;
  totalKeys: number;
  currentKey?: string;
  namespace?: string;
  currentLanguage?: string;
  stopped?: boolean;
  error?: string;
}

const ProjectTranslationModal: React.FC<ProjectTranslationModalProps> = ({
  isOpen,
  onClose,
  projectName,
  sourceLanguage,
}) => {
  const [phase, setPhase] = useState<Phase>("setup");
  const [models, setModels] = useState<{ name: string; displayName?: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [jobId, setJobId] = useState<string>("");
  const [progress, setProgress] = useState<Progress>({ completedKeys: 0, totalKeys: 0 });

  // Load models and languages when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setPhase("setup");
    setProgress({ completedKeys: 0, totalKeys: 0 });

    async function load() {
      setLoadingSetup(true);
      try {
        const [modelsRes, langsRes] = await Promise.all([
          getOllamaModels(),
          getLanguages(projectName),
        ]);

        const modelList = (modelsRes.data?.data || []).map(
          (m: any) => ({ name: m.name, displayName: m.displayName || m.name })
        );
        setModels(modelList);

        const modelNames = modelList.map((m: { name: string }) => m.name);
        const savedModel = typeof window !== "undefined"
          ? localStorage.getItem("translation-app-selected-model")
          : null;
        setSelectedModel(savedModel && modelNames.includes(savedModel) ? savedModel : modelNames[0] || "");

        const allLangs: string[] = langsRes.data?.data?.languages || [];
        const targets = allLangs.filter((l) => l !== sourceLanguage);
        setLanguages(targets);
        setTargetLanguage("all");
      } catch {
        // ignore — user will see empty dropdowns
      } finally {
        setLoadingSetup(false);
      }
    }

    load();
  }, [isOpen, projectName, sourceLanguage]);

  // Socket event listeners
  useEffect(() => {
    if (!isOpen) return;
    const socket = getSocket();

    const onStarted = (data: any) => {
      if (data.jobId !== jobId) return;
      setProgress({ completedKeys: 0, totalKeys: data.totalKeys });
    };

    const onProgress = (data: any) => {
      if (data.jobId !== jobId) return;
      setProgress({
        completedKeys: data.completedKeys,
        totalKeys: data.totalKeys,
        currentKey: data.currentKey,
        namespace: data.namespace,
        currentLanguage: data.currentLanguage,
      });
    };

    const onCompleted = (data: any) => {
      if (data.jobId !== jobId) return;
      setProgress((p) => ({ ...p, completedKeys: data.completedKeys, totalKeys: data.totalKeys }));
      setPhase("done");
    };

    const onStopped = (data: any) => {
      if (data.jobId !== jobId) return;
      setProgress((p) => ({ ...p, completedKeys: data.completedKeys, totalKeys: data.totalKeys, stopped: true }));
      setPhase("done");
    };

    const onError = (data: any) => {
      if (data.jobId !== jobId) return;
      setProgress((p) => ({ ...p, error: data.error }));
      setPhase("done");
    };

    socket.on("project-translation:started", onStarted);
    socket.on("project-translation:progress", onProgress);
    socket.on("project-translation:completed", onCompleted);
    socket.on("project-translation:stopped", onStopped);
    socket.on("project-translation:error", onError);

    return () => {
      socket.off("project-translation:started", onStarted);
      socket.off("project-translation:progress", onProgress);
      socket.off("project-translation:completed", onCompleted);
      socket.off("project-translation:stopped", onStopped);
      socket.off("project-translation:error", onError);
    };
  }, [isOpen, jobId]);

  const handleStart = async () => {
    if (!selectedModel || !targetLanguage) return;

    const newJobId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setJobId(newJobId);
    setProgress({ completedKeys: 0, totalKeys: 0 });
    setPhase("running");

    if (typeof window !== "undefined") {
      localStorage.setItem("translation-app-selected-model", selectedModel);
    }

    try {
      await translateProject(projectName, sourceLanguage, targetLanguage, selectedModel, newJobId);
    } catch {
      setProgress((p) => ({ ...p, error: "Failed to start translation" }));
      setPhase("done");
    }
  };

  const handleStop = async () => {
    try {
      await stopProjectTranslation(jobId);
    } catch {
      // job may have already finished
    }
  };

  const handleClose = () => {
    if (phase === "running") return; // block accidental close while running
    onClose();
    setTimeout(() => setPhase("setup"), 300);
  };

  const percentage =
    progress.totalKeys > 0
      ? Math.round((progress.completedKeys / progress.totalKeys) * 100)
      : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Translate Project: ${projectName}`}
    >
      {/* SETUP */}
      {phase === "setup" && (
        <div className="space-y-4 mt-2">
          {loadingSetup ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">Loading…</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  {models.map((m) => (
                    <option key={m.name} value={m.name}>{m.displayName || m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All languages ({languages.length})</option>
                  <option disabled value="">──────────────</option>
                  {languages.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Only missing keys across all namespaces will be translated.
              </p>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStart}
                  disabled={!selectedModel || !targetLanguage}
                  className="px-4 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium"
                >
                  Start Translation
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* RUNNING */}
      {phase === "running" && (
        <div className="mt-2 space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              <span className="font-medium text-primary-600 dark:text-primary-400">{sourceLanguage}</span>
              <span className="mx-2">→</span>
              <span className="font-medium text-primary-600 dark:text-primary-400">
                {targetLanguage === "all"
                  ? (progress.currentLanguage ?? "all languages")
                  : targetLanguage}
              </span>
            </span>
            <span>{percentage}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
            <span>{progress.completedKeys} of {progress.totalKeys} keys</span>
            <span>{progress.totalKeys - progress.completedKeys} remaining</span>
          </div>

          {progress.namespace && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="mr-1">Namespace:</span>
              <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{progress.namespace}</span>
            </div>
          )}

          {progress.currentKey && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p className="mb-1">Current key:</p>
              <div className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 font-mono truncate">
                {progress.currentKey}
              </div>
            </div>
          )}

          {progress.totalKeys === 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
              Counting keys…
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleStop}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* DONE */}
      {phase === "done" && (
        <div className="mt-2 space-y-4">
          {progress.error ? (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded text-red-800 dark:text-red-200 text-sm">
              <p className="font-medium mb-1">Translation failed</p>
              <p className="text-xs">{progress.error}</p>
            </div>
          ) : progress.stopped ? (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded text-yellow-800 dark:text-yellow-200 text-sm">
              <p className="font-medium mb-1">Translation stopped</p>
              <p className="text-xs">
                {progress.completedKeys} of {progress.totalKeys} keys translated and saved.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded text-green-800 dark:text-green-200 text-sm">
              <p className="font-medium mb-1">Translation complete</p>
              <p className="text-xs">
                {progress.completedKeys} keys translated into{" "}
                <span className="font-medium">
                  {targetLanguage === "all" ? "all languages" : targetLanguage}
                </span>.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            {!progress.error && !progress.stopped && (
              <button
                onClick={() => {
                  setPhase("setup");
                  setProgress({ completedKeys: 0, totalKeys: 0 });
                }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Translate another language
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                setTimeout(() => setPhase("setup"), 300);
              }}
              className="px-4 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProjectTranslationModal;
