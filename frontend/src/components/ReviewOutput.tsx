import type { ReviewResponse } from "../types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

type Props = {
  review: ReviewResponse | null;
  code: string;
  loading: boolean;
  error: string | null;
};

const spinnerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  padding: "40px 20px",
  color: "#555",
};

const errorStyle: React.CSSProperties = {
  margin: "20px",
  padding: "14px 18px",
  background: "#fff0f0",
  border: "1px solid #f5c2c2",
  borderRadius: "6px",
  color: "#c0392b",
};

const ReviewOutput = ({ review, code, loading, error }: Props) => {
  if (loading) {
    return (
      <div style={spinnerStyle}>
        {/* Simple CSS spinner — no extra library needed */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .spinner {
            width: 36px;
            height: 36px;
            border: 4px solid #ddd;
            border-top-color: #555;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
        `}</style>
        <div className="spinner" />
        <p>Reviewing your code…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorStyle}>
        <strong>⚠️ Error:</strong> {error}
      </div>
    );
  }

  if (!review) {
    return <p style={{ padding: "20px" }}>Results will appear here...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h3>Your Code</h3>
      <SyntaxHighlighter language="javascript">{code}</SyntaxHighlighter>

      <h3>AI Review Output</h3>

      <h4>🐞 Bugs</h4>
      <ul>
        {review.bugs.length === 0 ? (
          <li>No bugs detected</li>
        ) : (
          review.bugs.map((b, i) => <li key={i}>{b}</li>)
        )}
      </ul>

      <h4>⚡ Suggestions</h4>
      <ul>
        {review.suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      <h4>📘 Explanation</h4>
      <p>{review.explanation}</p>
    </div>
  );
};

export default ReviewOutput;
