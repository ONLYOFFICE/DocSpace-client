import React from "react";

interface TranslationTablePaginationProps {
  currentPage: number;
  totalPages: number;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}

const TranslationTablePagination: React.FC<TranslationTablePaginationProps> = ({
  currentPage,
  totalPages,
  goToPreviousPage,
  goToNextPage,
}) => (
  <div className="flex justify-between items-center mb-4">
    <button
      onClick={goToPreviousPage}
      disabled={currentPage === 0}
      className="btn btn-sm border border-primary-600 text-primary-600 hover:bg-primary-50 hover:text-primary-700 px-3 py-1 dark:text-primary-400 dark:hover:text-primary-300 dark:border-primary-700 dark:hover:bg-gray-800"
    >
      ← Previous
    </button>
    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
      Key {currentPage + 1} of {totalPages}
    </div>
    <button
      onClick={goToNextPage}
      disabled={currentPage >= totalPages - 1}
      className="btn btn-sm border border-primary-600 text-primary-600 hover:bg-primary-50 hover:text-primary-700 px-3 py-1 dark:text-primary-400 dark:hover:text-primary-300 dark:border-primary-700 dark:hover:bg-gray-800"
    >
      Next →
    </button>
  </div>
);

export default TranslationTablePagination;
