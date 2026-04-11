export const reviewCode = async (code: string): Promise<any> => {
  const res = await fetch("http://localhost:5000/review", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  return res.json();
};
