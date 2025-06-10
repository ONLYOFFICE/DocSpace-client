"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import TranslationStats from "@/components/TranslationStats";
import SearchInput from "@/components/SearchInput";
import ExportImportPanel from "@/components/ExportImportPanel";

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [testRunning, setTestRunning] = useState<boolean>(false);
  const [runningTest, setRunningTest] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

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

      {/* Search Section */}
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search Translations
        </h2>

        <div className="flex gap-2 mb-2">
          <SearchInput
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              if (!value.trim()) {
                setSearchResults(null);
              }
            }}
            placeholder="Search for projects, namespaces, keys or values..."
            className="flex-[4]"
            inputClassName="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={async () => {
              if (!searchQuery.trim()) return;

              try {
                setIsSearching(true);
                const response = await fetch(
                  `${process.env.API_URL}/search?query=${encodeURIComponent(searchQuery)}`
                );

                if (!response.ok) {
                  throw new Error("Failed to search translations");
                }

                const data = await response.json();
                setSearchResults(data.data);
              } catch (err: any) {
                console.error("Error searching translations:", err);
              } finally {
                setIsSearching(false);
              }
            }}
            disabled={isSearching || !searchQuery.trim()}
            className={`flex-[1] h-[42px] px-4 py-2 rounded-lg text-white font-medium ${isSearching || !searchQuery.trim() ? "bg-gray-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700"} transition-colors`}
          >
            {isSearching ? (
              <>
                <svg
                  className="animate-spin inline-block h-4 w-4 mr-2"
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
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>

        {searchResults && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
              Results for "{searchQuery}" ({searchResults.totalResults} matches)
            </h3>

            {searchResults.results.length === 0 ? (
              <div className="py-4 text-gray-500 dark:text-gray-400 text-center">
                No matches found. Try a different search term.
              </div>
            ) : (
              <div className="space-y-6">
                {searchResults.results.map((result: any, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        Project:{" "}
                        <span className="text-primary-600 dark:text-primary-400">
                          {result.projectName}
                        </span>
                      </h4>
                      <Link
                        href={`/projects/${result.projectName}`}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Go to project
                      </Link>
                    </div>

                    <div className="flex items-center mb-3">
                      <span className="text-gray-700 dark:text-gray-300">
                        Namespace:{" "}
                      </span>
                      <a
                        href={`/projects/${result.projectName}?namespace=${result.namespace}`}
                        className="ml-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        {result.namespace}
                        {result.namespaceMatch && (
                          <span className="ml-2 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                            Match
                          </span>
                        )}
                      </a>
                    </div>

                    {result.matches.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Matching Keys and Values:
                        </h5>
                        <div className="space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                          {result.matches.map(
                            (match: any, matchIndex: number) => (
                              <div key={matchIndex} className="text-sm">
                                <div className="flex flex-wrap gap-2 items-center">
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {match.key}
                                    {match.keyMatch && (
                                      <>
                                        <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                          Key Match
                                        </span>
                                        <a
                                          href={`/projects/${result.projectName}?namespace=${result.namespace}&key=${match.key}`}
                                          className="ml-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                          target="_blank"
                                        >
                                          Go to key
                                        </a>
                                      </>
                                    )}
                                  </span>
                                </div>
                                {match.valueMatch && (
                                  <div className="mt-1 pl-4">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      Value:{" "}
                                    </span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                      {typeof match.value === "string"
                                        ? match.value
                                        : JSON.stringify(match.value)}
                                      <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                        Value Match
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
                <div
                  className={`block p-6 border rounded-lg hover:shadow-md transition-all duration-200 ease-in-out group
                  ${
                    project.fullyTranslated
                      ? "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20"
                      : "border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-pink-900/10 hover:bg-pink-100 dark:hover:bg-pink-900/20"
                  }`}
                >
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
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {project.name}
                      </h3>
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                          project.fullyTranslated
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
                        }`}
                      >
                        {project.fullyTranslated
                          ? "Fully Translated"
                          : "Needs Translation"}
                      </span>
                    </div>
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

      {/* Export/Import Section */}
      <ExportImportPanel projects={projects} />

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
