"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import TranslationStats from "@/components/TranslationStats";

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testRunning, setTestRunning] = useState<boolean>(false);
  const [runningTest, setRunningTest] = useState<string>("");

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.API_URL}/projects`);

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        setProjects(data.data || []);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="relative mb-8">
        {/* Theme toggle button */}
        <div className="absolute right-0 top-0">
          <ThemeToggle />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            DocSpace Translation Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage DocSpace i18n localization files
          </p>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          Projects
        </h2>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Loading projects...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No projects available. Server might not be running.
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.name}
                href={`/projects/${project.name}`}
                passHref
              >
                <div className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 ease-in-out group">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3 text-primary-600 dark:text-primary-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {project.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 ml-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {project.fileCount || "0"} files
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          />
                        </svg>
                        {project.languageCount || "0"} languages
                      </span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Test Runner Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Test Runner
        </h2>

        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Run translation tests directly from the UI:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={async () => {
                try {
                  setTestRunning(true);
                  setRunningTest("only-base-languages");

                  const response = await fetch(
                    `${process.env.API_URL}/tests/run`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        testType: "only-base-languages",
                      }),
                    }
                  );

                  const data = await response.json();

                  if (data.success) {
                    // Show test status
                    if (!data.testSuccess) {
                      console.warn("Tests completed with failures");
                      // Optional: Show error details
                      if (data.errorOutput) {
                        console.error("Test errors:", data.errorOutput);
                      }
                    }

                    // Use the report URL provided by the backend
                    if (data.reportExists) {
                      // Navigate to the test report page
                      window.open("/tests/report", "_blank");
                    } else {
                      alert(
                        "Tests completed but no report file was generated."
                      );
                    }
                  } else {
                    alert(`Test setup failed: ${data.error}`);
                  }
                } catch (error) {
                  console.error("Error running tests:", error);
                  alert("Failed to run tests. See console for details.");
                } finally {
                  setTestRunning(false);
                  setRunningTest("");
                }
              }}
              disabled={testRunning}
              className={`flex items-center justify-center px-6 py-3 ${testRunning && runningTest === "only-base-languages" ? "bg-primary-400" : "bg-primary-600 hover:bg-primary-700"} text-white font-medium rounded-lg transition-colors duration-200 ${testRunning ? "cursor-not-allowed opacity-80" : ""}`}
            >
              {testRunning && runningTest === "only-base-languages" ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Running test...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Run test:only-base-languages
                </>
              )}
            </button>

            <button
              onClick={async () => {
                try {
                  setTestRunning(true);
                  setRunningTest("skip-base-languages");

                  const response = await fetch(
                    `${process.env.API_URL}/tests/run`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        testType: "skip-base-languages",
                      }),
                    }
                  );

                  const data = await response.json();

                  if (data.success) {
                    // Show test status
                    if (!data.testSuccess) {
                      console.warn("Tests completed with failures");
                      // Optional: Show error details
                      if (data.errorOutput) {
                        console.error("Test errors:", data.errorOutput);
                      }
                    }

                    // Use the report URL provided by the backend
                    if (data.reportExists) {
                      // Navigate to the test report page
                      window.open("/tests/report", "_blank");
                    } else {
                      alert(
                        "Tests completed but no report file was generated."
                      );
                    }
                  } else {
                    alert(`Test setup failed: ${data.error}`);
                  }
                } catch (error) {
                  console.error("Error running tests:", error);
                  alert("Failed to run tests. See console for details.");
                } finally {
                  setTestRunning(false);
                  setRunningTest("");
                }
              }}
              disabled={testRunning}
              className={`flex items-center justify-center px-6 py-3 ${testRunning && runningTest === "skip-base-languages" ? "bg-green-400" : "bg-green-600 hover:bg-green-700"} text-white font-medium rounded-lg transition-colors duration-200 ${testRunning ? "cursor-not-allowed opacity-80" : ""}`}
            >
              {testRunning && runningTest === "skip-base-languages" ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Running test...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Run test:skip-base-languages
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Translation Statistics Component */}
      <TranslationStats />
    </main>
  );
}
