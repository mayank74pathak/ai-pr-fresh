import { useState } from "react";
import Navbar from "../components/Navbar";
import CodeInput from "../components/CodeInput";
import ReviewOutput from "../components/ReviewOutput";
import type { ReviewResponse } from "../types";

const Home = () => {
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Navbar />
      <CodeInput
        setReview={setReview}
        setCode={setCode}
        setLoading={setLoading}
        setError={setError}
      />
      <ReviewOutput
        review={review}
        code={code}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default Home;
