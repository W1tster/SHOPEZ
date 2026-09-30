export default function StarRating({ rating = 0, numReviews, showScore = false }) {
  const roundedScore = Math.round(Number(rating) || 0);

  return (
    <div className="d-inline-flex align-items-center gap-1">
      <div className="d-inline-flex align-items-center gap-1">
        {[1, 2, 3, 4, 5].map((starIdx) => {
          const isFilled = starIdx <= roundedScore;
          return (
            <svg
              key={starIdx}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={isFilled ? '#f59e0b' : 'none'}
              stroke={isFilled ? '#f59e0b' : '#cbd5e1'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        })}
      </div>
      {showScore && Number(rating) > 0 && (
        <span className="fw-bold small ms-1 text-dark">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {numReviews !== undefined && (
        <span className="text-muted small ms-1">({numReviews} review{numReviews === 1 ? '' : 's'})</span>
      )}
    </div>
  );
}
