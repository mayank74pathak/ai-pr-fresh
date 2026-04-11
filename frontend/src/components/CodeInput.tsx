import { useState } from "react";
import type { ReviewResponse } from "../types/index";

type Props = {
  setReview: (data: ReviewResponse) => void;
  setCode: (code: string) => void;
  setLoading: (val: boolean) => void;
  setError: (msg: string | null) => void;
};

const CodeInput = ({ setReview, setCode, setLoading, setError }: Props) => {
  const [code, setLocalCode] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalCode(e.target.value);
    setCode(e.target.value);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please paste some code before reviewing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5001/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data: ReviewResponse = await res.json();
      setReview(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <textarea
        rows={10}
        cols={80}
        placeholder="Paste your code here..."
        value={code}
        onChange={handleChange}
      />
      <br />
      <button onClick={handleSubmit}>Review Code</button>
    </div>
  );
};

export default CodeInput;
