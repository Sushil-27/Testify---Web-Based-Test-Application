import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const paletteColors = {
  current: "border-blue-500 bg-blue-100 text-blue-900",
  answered: "border-green-500 bg-green-100 text-green-900",
  notAnswered: "border-gray-400 bg-gray-100 text-gray-700",
  review: "border-yellow-500 bg-yellow-100 text-yellow-900",
};

const TestTakingPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [marked, setMarked] = useState<boolean[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/tests/${testId}`)
      .then(res => res.json())
      .then(data => {
        setTest(data);
        setAnswers(Array(data.questions.length).fill(null));
        setMarked(Array(data.questions.length).fill(false));
        setTimeLeft((data.duration || 30) * 60); // duration in minutes
      });
  }, [testId]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!test) return <div className="flex justify-center items-center min-h-screen text-white">Loading test...</div>;

  const handleOption = (idx: number) => {
    setAnswers(ans => ans.map((a, i) => (i === current ? idx : a)));
  };

  const handleMark = () => {
    setMarked(m => m.map((v, i) => (i === current ? !v : v)));
  };

  const handleClear = () => {
    setAnswers(ans => ans.map((a, i) => (i === current ? null : a)));
  };

  const handlePrev = () => setCurrent(c => Math.max(0, c - 1));
  const handleNext = () => setCurrent(c => Math.min(test.questions.length - 1, c + 1));

  const handleSubmit = async () => {
    setShowConfirm(false);
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/results/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          testId,
          answers: answers.map(a => (a === null ? -1 : a)),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ score: data.score, total: test.questions.length });
        setSubmitted(true);
      } else {
        alert(data.error || "Failed to submit test");
      }
    } catch (err) {
      alert("Failed to submit test");
    }
  };

  // Palette status
  const getStatus = (i: number) => {
    if (i === current) return "current";
    if (marked[i]) return "review";
    if (answers[i] !== null) return "answered";
    return "notAnswered";
  };

  // Timer display
  const min = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const sec = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="min-h-screen flex bg-black">
      {/* Main Test Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-[#1B1B1B] rounded-xl shadow p-8">
          {submitted && result ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-4">Test Submitted!</div>
              <div className="text-xl text-white mb-2">Score: <span className="text-green-400 font-bold">{result.score}</span> / {result.total}</div>
              <div className="text-lg text-blue-300 mb-6">You answered {result.score} out of {result.total} questions correctly.</div>
              <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-lg text-blue-400 font-semibold">
                {test.title} - Question {current + 1} of {test.questions.length}
              </div>
              <div className="mb-4 text-white font-medium">
                {test.questions[current].question}
              </div>
              <div className="mb-6">
                {test.questions[current].options.map((opt: string, idx: number) => (
                  <label key={idx} className={`block px-4 py-2 rounded-lg mb-2 cursor-pointer border transition-all ${answers[current] === idx ? "border-blue-500 bg-blue-100 text-blue-900" : "border-gray-700 bg-[#222] text-white hover:border-blue-400"}`}>
                    <input
                      type="radio"
                      name={`q${current}`}
                      checked={answers[current] === idx}
                      onChange={() => !submitted && handleOption(idx)}
                      className="mr-3 accent-blue-600"
                      disabled={submitted}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <Button variant="outline" onClick={handlePrev} disabled={current === 0 || submitted}>Previous</Button>
                <Button variant="outline" onClick={handleNext} disabled={current === test.questions.length - 1 || submitted}>Next</Button>
                <Button variant="outline" onClick={handleMark} disabled={submitted}>{marked[current] ? "Unmark" : "Mark for Review"}</Button>
                <Button variant="outline" onClick={handleClear} disabled={submitted}>Clear</Button>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={() => setShowConfirm(true)} disabled={submitted}>End Test</Button>
            </>
          )}
        </div>
      </main>
      {/* Sidebar */}
      <aside className="w-80 bg-[#0A0A0A] border-l border-blue-700/30 flex flex-col p-8">
        <div className="mb-8">
          <div className="text-white text-lg font-semibold mb-2">Time Left</div>
          <div className="text-3xl font-bold text-blue-400">{min}:{sec}</div>
        </div>
        <div className="mb-6">
          <div className="text-blue-400 font-semibold mb-2">Questions</div>
          <div className="grid grid-cols-5 gap-2">
            {test.questions.map((_: any, i: number) => (
              <button
                key={i}
                className={`w-10 h-10 rounded-lg border-2 font-bold text-sm transition-all ${paletteColors[getStatus(i) as keyof typeof paletteColors]}`}
                onClick={() => setCurrent(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500 inline-block"></span> Current
            <span className="w-4 h-4 rounded bg-green-100 border-2 border-green-500 inline-block ml-4"></span> Answered
          </div>
          <div className="flex items-center gap-2 text-xs mt-1">
            <span className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-500 inline-block"></span> Marked
            <span className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-400 inline-block ml-4"></span> Not Answered
          </div>
        </div>
      </aside>
      {/* Confirmation Modal */}
      {showConfirm && !submitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl max-w-sm w-full text-center">
            <div className="text-xl font-bold mb-4 text-blue-700">End Test?</div>
            <div className="mb-6 text-gray-700">Are you sure you want to end this test? You won't be able to change your answers after submitting.</div>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>End Test</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTakingPage; 