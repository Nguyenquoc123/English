import "./page.css";

function Page({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const currentPage = page; // page tính từ 0 theo Spring Boot

  const goToPage = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    if (newPage === currentPage) return;

    onPageChange(newPage);
  };

  const getPageNumbers = () => {
    const pages = [];

    for (let i = 0; i < totalPages; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={currentPage === 0}
        onClick={() => goToPage(currentPage - 1)}
      >
        Trước
      </button>

      {getPageNumbers().map((pageNumber) => (
        <button
          key={pageNumber}
          className={
            pageNumber === currentPage
              ? "pagination-btn active"
              : "pagination-btn"
          }
          onClick={() => goToPage(pageNumber)}
        >
          {pageNumber + 1}
        </button>
      ))}

      <button
        className="pagination-btn"
        disabled={currentPage === totalPages - 1}
        onClick={() => goToPage(currentPage + 1)}
      >
        Sau
      </button>
    </div>
  );
}

export default Page;