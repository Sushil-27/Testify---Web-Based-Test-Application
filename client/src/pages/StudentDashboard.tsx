import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const sidebarSteps = [
  { label: "Available Tests", key: "tests" },
  { label: "My Analytics", key: "analytics" },
];

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState("tests");
  const [analytics, setAnalytics] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    // Fetch available tests
    fetch("/api/tests")
      .then(res => res.json())
      .then(data => setTests(data));
    // Fetch analytics
    if (userData) {
      const u = JSON.parse(userData);
      fetch(`/api/results/analytics/${u._id || u.id}` , {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
        .then(res => res.json())
        .then(data => setAnalytics(data));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0A0A0A] border-r border-blue-700/30 flex flex-col py-8 px-6">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-2xl text-white font-bold mb-2">
            {user?.name?.[0] || "U"}
          </div>
          <div className="text-white font-semibold text-lg">{user?.name}</div>
          <div className="text-blue-400 text-xs">{user?.email}</div>
        </div>
        <nav className="flex-1">
          {sidebarSteps.map(step => (
            <button
              key={step.key}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-medium transition-colors ${activeSection === step.key ? "bg-blue-700 text-white" : "text-blue-200 hover:bg-blue-800/40"}`}
              onClick={() => setActiveSection(step.key)}
            >
              {step.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <Button className="w-full bg-blue-700 hover:bg-blue-800" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10 bg-black text-white">
        {activeSection === "tests" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Available Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.length === 0 && <div>No tests available.</div>}
              {tests.map(test => (
                <div key={test._id} className="bg-[#1B1B1B] rounded-xl p-6 shadow border border-blue-700/20">
                  <div className="font-semibold text-lg mb-2">{test.title}</div>
                  <div className="text-blue-300 text-sm mb-1">Subject: {test.subject}</div>
                  <div className="text-blue-300 text-sm mb-1">Duration: {test.duration} min</div>
                  <Button className="mt-4 bg-blue-700 hover:bg-blue-800 w-full" onClick={() => navigate(`/test/${test._id}`)}>Start Test</Button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeSection === "analytics" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-blue-400">My Analytics</h2>
            {analytics ? (
              <div className="bg-[#1B1B1B] rounded-xl p-8 shadow border border-blue-700/20 max-w-md">
                <div className="mb-2">Total Tests Taken: <span className="font-bold text-blue-300">{analytics.totalTests}</span></div>
                <div className="mb-2">Average Score: <span className="font-bold text-blue-300">{analytics.averageScore?.toFixed(2)}</span></div>
                <div className="mb-2">Highest Score: <span className="font-bold text-blue-300">{analytics.highestScore}</span></div>
                <div className="mb-2">Lowest Score: <span className="font-bold text-blue-300">{analytics.lowestScore}</span></div>
              </div>
            ) : (
              <div>Loading analytics...</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard; 