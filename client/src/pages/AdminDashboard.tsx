import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Fragment } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const sidebarSections = [
  { label: "Create Test", key: "create" },
  { label: "All Tests", key: "all" },
  { label: "Analytics", key: "analytics" },
  { label: "Users", key: "users" },
];

const emptyQuestion = () => ({ question: "", options: ["", "", "", ""], correctAnswer: 0 });

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("create");
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  const navigate = useNavigate();

  // Create Test form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");
  const [bulkMsg, setBulkMsg] = useState("");

  // All Tests state
  const [tests, setTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [viewTest, setViewTest] = useState<any>(null);
  const [editTest, setEditTest] = useState<any>(null);
  const [editMsg, setEditMsg] = useState("");
  const [editing, setEditing] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userMsg, setUserMsg] = useState("");

  const [bulkPreview, setBulkPreview] = useState<any[] | null>(null);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Fetch all tests when All Tests section is active
  useEffect(() => {
    if (activeSection === "all") {
      setLoadingTests(true);
      fetch("/api/tests")
        .then(res => res.json())
        .then(data => {
          setTests(data);
          setLoadingTests(false);
        });
    }
  }, [activeSection]);

  // Fetch analytics when Analytics section is active
  useEffect(() => {
    if (activeSection === "analytics") {
      setLoadingAnalytics(true);
      Promise.all([
        fetch("/api/tests").then(res => res.json()),
        fetch("/api/results", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(res => res.json())
      ]).then(([tests, results]) => {
        // Calculate stats
        const totalTests = tests.length;
        const totalQuestions = tests.reduce((sum: number, t: any) => sum + t.questions.length, 0);
        const testAttempts: Record<string, number> = {};
        const testScores: Record<string, number[]> = {};
        results.forEach((r: any) => {
          testAttempts[r.testId] = (testAttempts[r.testId] || 0) + 1;
          if (!testScores[r.testId]) testScores[r.testId] = [];
          testScores[r.testId].push(r.score);
        });
        const mostAttemptedTestId = Object.entries(testAttempts).sort((a, b) => b[1] - a[1])[0]?.[0];
        const mostAttemptedTest = tests.find((t: any) => t._id === mostAttemptedTestId);
        const avgScorePerTest = tests.map((t: any) => {
          const scores = testScores[t._id] || [];
          return { title: t.title, avg: scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0 };
        });
        setAnalytics({
          totalTests,
          totalQuestions,
          mostAttemptedTest: mostAttemptedTest ? mostAttemptedTest.title : "N/A",
          avgScorePerTest,
        });
        setLoadingAnalytics(false);
      });
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "users") {
      setLoadingUsers(true);
      fetch("/api/auth/users", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
        .then(res => res.json())
        .then(data => {
          setUsers(data);
          setLoadingUsers(false);
        });
    }
  }, [activeSection]);

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === idx ? { ...q, [field]: value } : q
      )
    );
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, oi) => (oi === optIdx ? value : o)) }
          : q
      )
    );
  };

  const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion()]);
  const removeQuestion = (idx: number) => setQuestions(qs => qs.length > 1 ? qs.filter((_, i) => i !== idx) : qs);

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkMsg("");
    setBulkPreview(null);
    setBulkErrors([]);
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    const parseQuestions = (rows: any[]) => {
      const newQuestions: any[] = [];
      const errors: string[] = [];
      rows.forEach((row, idx) => {
        let correctIdx = -1;
        if (typeof row.correctAnswer === 'number') {
          correctIdx = row.correctAnswer;
        } else if (typeof row.correctAnswer === 'string') {
          correctIdx = [row.option1, row.option2, row.option3, row.option4].findIndex(opt => opt?.trim() === row.correctAnswer?.trim());
          if (correctIdx === -1 && !isNaN(Number(row.correctAnswer))) correctIdx = Number(row.correctAnswer);
        }
        if (!row.question || !row.option1 || !row.option2 || !row.option3 || !row.option4) {
          errors.push(`Row ${idx + 2}: Missing required fields.`);
          return;
        }
        if (correctIdx < 0 || correctIdx > 3) {
          errors.push(`Row ${idx + 2}: Invalid correctAnswer (must match one of the options or be 0-3).`);
          return;
        }
        newQuestions.push({
          question: row.question,
          options: [row.option1, row.option2, row.option3, row.option4],
          correctAnswer: correctIdx,
        });
      });
      if (newQuestions.length === 0) {
        setBulkMsg("No valid questions found in file.");
        setBulkPreview(null);
        setBulkErrors(errors);
        return;
      }
      setBulkPreview(newQuestions);
      setBulkErrors(errors);
      setBulkMsg(`${newQuestions.length} valid questions found. Review below before adding.`);
    };
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          parseQuestions(results.data as any[]);
        },
        error: () => setBulkMsg("Failed to parse CSV file."),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        parseQuestions(rows as any[]);
      };
      reader.onerror = () => setBulkMsg("Failed to read Excel file.");
      reader.readAsArrayBuffer(file);
    } else {
      setBulkMsg("Unsupported file type. Please upload a CSV or Excel file.");
    }
    e.target.value = ""; // reset input
  };

  const confirmBulkAdd = () => {
    if (bulkPreview) {
      setQuestions(qs => [...qs, ...bulkPreview]);
      setBulkMsg(`${bulkPreview.length} questions added!`);
    }
    setBulkPreview(null);
    setBulkErrors([]);
  };
  const cancelBulkAdd = () => {
    setBulkPreview(null);
    setBulkErrors([]);
    setBulkMsg("");
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/tests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          subject,
          duration,
          questions,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateMsg("Test created successfully!");
        setTitle("");
        setSubject("");
        setDuration(30);
        setQuestions([emptyQuestion()]);
      } else {
        setCreateMsg(data.msg || "Failed to create test");
      }
    } catch (err) {
      setCreateMsg("Failed to create test");
    }
    setCreating(false);
  };

  const handleDelete = async (testId: string) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    const token = localStorage.getItem("token");
    setDeleteMsg("");
    try {
      const res = await fetch(`/api/tests/${testId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteMsg("Test deleted successfully!");
        setTests(tests => tests.filter(t => t._id !== testId));
      } else {
        setDeleteMsg("Failed to delete test");
      }
    } catch {
      setDeleteMsg("Failed to delete test");
    }
  };

  const openView = (test: any) => setViewTest(test);
  const closeView = () => setViewTest(null);

  const openEdit = (test: any) => setEditTest({ ...test, questions: test.questions.map((q: any) => ({ ...q })) });
  const closeEdit = () => { setEditTest(null); setEditMsg(""); };

  const handleEditChange = (field: string, value: any) => {
    setEditTest((t: any) => ({ ...t, [field]: value }));
  };
  const handleEditQuestionChange = (idx: number, field: string, value: any) => {
    setEditTest((t: any) => ({
      ...t,
      questions: t.questions.map((q: any, i: number) => i === idx ? { ...q, [field]: value } : q)
    }));
  };
  const handleEditOptionChange = (qIdx: number, optIdx: number, value: string) => {
    setEditTest((t: any) => ({
      ...t,
      questions: t.questions.map((q: any, i: number) =>
        i === qIdx ? { ...q, options: q.options.map((o: string, oi: number) => oi === optIdx ? value : o) } : q
      )
    }));
  };
  const addEditQuestion = () => setEditTest((t: any) => ({ ...t, questions: [...t.questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }] }));
  const removeEditQuestion = (idx: number) => setEditTest((t: any) => ({ ...t, questions: t.questions.length > 1 ? t.questions.filter((_: any, i: number) => i !== idx) : t.questions }));

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(true);
    setEditMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/tests/${editTest._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTest.title,
          subject: editTest.subject,
          duration: editTest.duration,
          questions: editTest.questions,
        }),
      });
      if (res.ok) {
        setEditMsg("Test updated successfully!");
        setTimeout(() => {
          closeEdit();
          // Refresh tests list
          setActiveSection("all");
        }, 1000);
      } else {
        setEditMsg("Failed to update test");
      }
    } catch {
      setEditMsg("Failed to update test");
    }
    setEditing(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUserMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/auth/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users => users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        setUserMsg("Role updated successfully!");
      } else {
        setUserMsg(data.msg || "Failed to update role");
      }
    } catch {
      setUserMsg("Failed to update role");
    }
  };
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete/block this user?")) return;
    setUserMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(users => users.filter(u => u._id !== userId));
        setUserMsg("User deleted/blocked successfully!");
      } else {
        setUserMsg("Failed to delete/block user");
      }
    } catch {
      setUserMsg("Failed to delete/block user");
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-black">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0A0A0A] border-r border-blue-700/30 flex flex-col py-8 px-6">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-2xl text-white font-bold mb-2">
            {user?.name?.[0] || "A"}
          </div>
          <div className="text-white font-semibold text-lg">{user?.name}</div>
          <div className="text-blue-400 text-xs">{user?.email}</div>
          <div className="text-blue-400 text-xs mt-1">Admin</div>
        </div>
        <nav className="flex-1">
          {sidebarSections.map(section => (
            <button
              key={section.key}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-medium transition-colors ${activeSection === section.key ? "bg-blue-700 text-white" : "text-blue-200 hover:bg-blue-800/40"}`}
              onClick={() => setActiveSection(section.key)}
            >
              {section.label}
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
        {activeSection === "create" && (
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-6">Create Test</div>
            <form className="space-y-6" onSubmit={handleCreateTest}>
              <div className="flex gap-4">
                <input type="text" className="flex-1 rounded-lg px-4 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" placeholder="Test Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <input type="text" className="flex-1 rounded-lg px-4 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
                <input type="number" min={1} className="w-32 rounded-lg px-4 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" placeholder="Duration (min)" value={duration} onChange={e => setDuration(Number(e.target.value))} required />
              </div>
              <div>
                <div className="font-semibold text-blue-300 mb-2">Questions</div>
                <div className="mb-4 flex items-center gap-4">
                  <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleBulkUpload} className="text-white" />
                  <span className="text-blue-400 text-sm">Upload CSV or Excel to add questions in bulk</span>
                </div>
                {bulkMsg && <div className="mb-2 text-green-400 font-semibold">{bulkMsg}</div>}
                {bulkErrors.length > 0 && (
                  <div className="mb-2 text-red-400 text-sm">
                    <div className="font-semibold mb-1">Errors:</div>
                    <ul className="list-disc ml-6">
                      {bulkErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
                {bulkPreview && (
                  <div className="mb-4 bg-[#222] p-4 rounded-xl border border-blue-700/20">
                    <div className="font-semibold text-blue-300 mb-2">Preview Questions</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-white text-sm">
                        <thead>
                          <tr>
                            <th className="px-2 py-1">#</th>
                            <th className="px-2 py-1">Question</th>
                            <th className="px-2 py-1">Option 1</th>
                            <th className="px-2 py-1">Option 2</th>
                            <th className="px-2 py-1">Option 3</th>
                            <th className="px-2 py-1">Option 4</th>
                            <th className="px-2 py-1">Correct</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkPreview.map((q, i) => (
                            <tr key={i}>
                              <td className="px-2 py-1">{i + 1}</td>
                              <td className="px-2 py-1">{q.question}</td>
                              <td className="px-2 py-1">{q.options[0]}</td>
                              <td className="px-2 py-1">{q.options[1]}</td>
                              <td className="px-2 py-1">{q.options[2]}</td>
                              <td className="px-2 py-1">{q.options[3]}</td>
                              <td className="px-2 py-1 font-bold text-green-400">Option {q.correctAnswer + 1}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <Button className="bg-blue-700 hover:bg-blue-800" onClick={confirmBulkAdd}>Add to Test</Button>
                      <Button variant="outline" onClick={cancelBulkAdd}>Cancel</Button>
                    </div>
                  </div>
                )}
                {questions.map((q, i) => (
                  <div key={i} className="mb-6 p-4 rounded-xl bg-[#181F2A] border border-blue-700/20">
                    <div className="flex items-center mb-2">
                      <span className="text-blue-400 font-bold mr-2">Q{i + 1}.</span>
                      <input type="text" className="flex-1 rounded-lg px-3 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" placeholder="Question" value={q.question} onChange={e => handleQuestionChange(i, "question", e.target.value)} required />
                      <Button type="button" className="ml-4 bg-red-600 hover:bg-red-700" onClick={() => removeQuestion(i)} disabled={questions.length === 1}>Remove</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      {q.options.map((opt, oi) => (
                        <input key={oi} type="text" className="rounded-lg px-3 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" placeholder={`Option ${oi + 1}`} value={opt} onChange={e => handleOptionChange(i, oi, e.target.value)} required />
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-blue-300">Correct Answer:</label>
                      <select className="rounded-lg px-3 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" value={q.correctAnswer} onChange={e => handleQuestionChange(i, "correctAnswer", Number(e.target.value))}>
                        {q.options.map((_, oi) => (
                          <option key={oi} value={oi}>Option {oi + 1}</option>
                        ))}
                      </select>
                      <Button type="button" className="ml-auto bg-blue-700 hover:bg-blue-800" onClick={addQuestion}>Add Question</Button>
                    </div>
                  </div>
                ))}
              </div>
              {createMsg && <div className={`text-center font-semibold ${createMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>{createMsg}</div>}
              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={creating}>{creating ? "Creating..." : "Create Test"}</Button>
            </form>
          </div>
        )}
        {activeSection === "all" && (
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-6">All Tests</div>
            {deleteMsg && <div className={`mb-4 text-center font-semibold ${deleteMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>{deleteMsg}</div>}
            {loadingTests ? (
              <div>Loading tests...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-[#181F2A] rounded-xl">
                  <thead>
                    <tr className="text-blue-300 text-left">
                      <th className="py-2 px-4">Title</th>
                      <th className="py-2 px-4">Subject</th>
                      <th className="py-2 px-4">Duration</th>
                      <th className="py-2 px-4">Questions</th>
                      <th className="py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map(test => (
                      <tr key={test._id} className="border-b border-blue-700/10">
                        <td className="py-2 px-4">{test.title}</td>
                        <td className="py-2 px-4">{test.subject}</td>
                        <td className="py-2 px-4">{test.duration} min</td>
                        <td className="py-2 px-4">{test.questions.length}</td>
                        <td className="py-2 px-4 flex gap-2">
                          <Button size="sm" className="bg-blue-700 hover:bg-blue-800" onClick={() => openView(test)}>View</Button>
                          <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700" onClick={() => openEdit(test)}>Edit</Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDelete(test._id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tests.length === 0 && <div className="text-center text-blue-300 py-8">No tests found.</div>}
              </div>
            )}
            {/* View Modal */}
            {viewTest && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                <div className="bg-white rounded-xl p-8 shadow-xl max-w-2xl w-full text-black relative">
                  <button className="absolute top-2 right-4 text-2xl text-blue-700" onClick={closeView}>&times;</button>
                  <div className="text-2xl font-bold text-blue-700 mb-4">{viewTest.title}</div>
                  <div className="mb-2"><span className="font-semibold">Subject:</span> {viewTest.subject}</div>
                  <div className="mb-2"><span className="font-semibold">Duration:</span> {viewTest.duration} min</div>
                  <div className="mb-4"><span className="font-semibold">Questions:</span></div>
                  <ol className="list-decimal ml-6">
                    {viewTest.questions.map((q: any, i: number) => (
                      <li key={i} className="mb-2">
                        <div className="font-semibold">{q.question}</div>
                        <ul className="ml-4">
                          {q.options.map((opt: string, oi: number) => (
                            <li key={oi} className={oi === q.correctAnswer ? "text-green-700 font-bold" : ""}>{opt}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
            {/* Edit Modal */}
            {editTest && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 overflow-auto">
                <div className="bg-white rounded-xl p-8 shadow-xl max-w-2xl w-full text-black relative">
                  <button className="absolute top-2 right-4 text-2xl text-blue-700" onClick={closeEdit}>&times;</button>
                  <div className="text-2xl font-bold text-blue-700 mb-4">Edit Test</div>
                  <form className="space-y-6" onSubmit={handleEditSave}>
                    <div className="flex gap-4">
                      <input type="text" className="flex-1 rounded-lg px-4 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" placeholder="Test Title" value={editTest.title} onChange={e => handleEditChange("title", e.target.value)} required />
                      <input type="text" className="flex-1 rounded-lg px-4 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" placeholder="Subject" value={editTest.subject} onChange={e => handleEditChange("subject", e.target.value)} required />
                      <input type="number" min={1} className="w-32 rounded-lg px-4 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" placeholder="Duration (min)" value={editTest.duration} onChange={e => handleEditChange("duration", Number(e.target.value))} required />
                    </div>
                    <div>
                      <div className="font-semibold text-blue-300 mb-2">Questions</div>
                      {editTest.questions.map((q: any, i: number) => (
                        <div key={i} className="mb-6 p-4 rounded-xl bg-[#181F2A] border border-blue-700/20">
                          <div className="flex items-center mb-2">
                            <span className="text-blue-400 font-bold mr-2">Q{i + 1}.</span>
                            <input type="text" className="flex-1 rounded-lg px-3 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" placeholder="Question" value={q.question} onChange={e => handleEditQuestionChange(i, "question", e.target.value)} required />
                            <Button type="button" className="ml-4 bg-red-600 hover:bg-red-700" onClick={() => removeEditQuestion(i)} disabled={editTest.questions.length === 1}>Remove</Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            {q.options.map((opt: string, oi: number) => (
                              <input key={oi} type="text" className="rounded-lg px-3 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" placeholder={`Option ${oi + 1}`} value={opt} onChange={e => handleEditOptionChange(i, oi, e.target.value)} required />
                            ))}
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="text-blue-300">Correct Answer:</label>
                            <select className="rounded-lg px-3 py-2 bg-[#1B1B1B] text-white border border-blue-700/30" value={q.correctAnswer} onChange={e => handleEditQuestionChange(i, "correctAnswer", Number(e.target.value))}>
                              {q.options.map((_: string, oi: number) => (
                                <option key={oi} value={oi}>Option {oi + 1}</option>
                              ))}
                            </select>
                            <Button type="button" className="ml-auto bg-blue-700 hover:bg-blue-800" onClick={addEditQuestion}>Add Question</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {editMsg && <div className={`text-center font-semibold ${editMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>{editMsg}</div>}
                    <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={editing}>{editing ? "Saving..." : "Save Changes"}</Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
        {activeSection === "analytics" && (
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-6">Analytics</div>
            {loadingAnalytics ? (
              <div>Loading analytics...</div>
            ) : analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-[#181F2A] rounded-xl p-6 border border-blue-700/20">
                  <div className="text-blue-300 font-semibold mb-2">Total Tests</div>
                  <div className="text-3xl font-bold text-white">{analytics.totalTests}</div>
                </div>
                <div className="bg-[#181F2A] rounded-xl p-6 border border-blue-700/20">
                  <div className="text-blue-300 font-semibold mb-2">Total Questions</div>
                  <div className="text-3xl font-bold text-white">{analytics.totalQuestions}</div>
                </div>
                <div className="bg-[#181F2A] rounded-xl p-6 border border-blue-700/20">
                  <div className="text-blue-300 font-semibold mb-2">Most Attempted Test</div>
                  <div className="text-xl font-bold text-white">{analytics.mostAttemptedTest}</div>
                </div>
                <div className="bg-[#181F2A] rounded-xl p-6 border border-blue-700/20">
                  <div className="text-blue-300 font-semibold mb-2">Average Score Per Test</div>
                  <ul className="text-white">
                    {analytics.avgScorePerTest.map((t: any) => (
                      <li key={t.title} className="mb-1 flex justify-between"><span>{t.title}</span> <span className="font-bold text-blue-300">{t.avg.toFixed(2)}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}
        {activeSection === "users" && (
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-6">Users</div>
            {userMsg && <div className="mb-4 text-center font-semibold text-red-400">{userMsg}</div>}
            <input
              type="text"
              className="mb-4 w-full max-w-md rounded-lg px-4 py-2 bg-[#1B1B1B] text-white border border-blue-700/30"
              placeholder="Search by name or email"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
            {loadingUsers ? (
              <div>Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-[#181F2A] rounded-xl">
                  <thead>
                    <tr className="text-blue-300 text-left">
                      <th className="py-2 px-4">Name</th>
                      <th className="py-2 px-4">Email</th>
                      <th className="py-2 px-4">Role</th>
                      <th className="py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id} className="border-b border-blue-700/10">
                        <td className="py-2 px-4">{user.name}</td>
                        <td className="py-2 px-4">{user.email}</td>
                        <td className="py-2 px-4">{user.role}</td>
                        <td className="py-2 px-4 flex gap-2">
                          <Button size="sm" className="bg-blue-700 hover:bg-blue-800" onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'student' : 'admin')}>{user.role === 'admin' ? 'Demote' : 'Promote'}</Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteUser(user._id)}>Delete/Block</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <div className="text-center text-blue-300 py-8">No users found.</div>}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard; 