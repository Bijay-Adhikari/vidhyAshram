import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // <--- The new Toast Library

// 1. Get the API URL from the environment (or default to localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Lesson { id: string; title: string; content: string; }
interface Course { id: string; title: string; description: string; price: number; lessons?: Lesson[]; }

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/courses`) // <--- Uses Variable!
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(() => toast.error("Could not load courses. Is the backend running?"));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging in..."); // <--- UX: Show loading
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.access_token) {
        setToken(data.access_token);
        toast.success("Login Successful!", { id: loadingToast }); // Update the loading toast
      } else {
        toast.error("Login Failed!", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Connection Error", { id: loadingToast });
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!token) return toast("Please login first!", { icon: '🔒' });
    
    const response = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) toast.success("Enrolled Successfully! 🎉");
    else toast.error("Enrollment Failed");
  };

  const handleEnterClass = async (courseId: string) => {
    const response = await fetch(`${API_URL}/courses/${courseId}`);
    const data = await response.json();
    setSelectedCourse(data);
  };

  // --- VIEWS ---

  if (!token) {
    return (
      <div style={{ padding: "50px", maxWidth: "400px", margin: "0 auto", textAlign: "center", fontFamily: "sans-serif" }}>
        {/* The Toast Container must be rendered once */}
        <Toaster position="top-center" /> 
        
        <h1>🔐 Please Login</h1>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "10px" }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "10px" }} />
          <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none" }}>Login</button>
        </form>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
        <Toaster position="top-center" />
        <button onClick={() => setSelectedCourse(null)} style={{ marginBottom: "20px", cursor: "pointer" }}>← Back to Dashboard</button>
        <h1>{selectedCourse.title}</h1>
        <p>{selectedCourse.description}</p>
        <hr />
        <h3>📚 Lessons</h3>
        {selectedCourse.lessons?.length ? (
          selectedCourse.lessons.map(lesson => (
            <div key={lesson.id} style={{ background: "#f8f9fa", padding: "15px", marginBottom: "10px", borderRadius: "8px", borderLeft: "4px solid #007bff" }}>
              <h4>{lesson.title}</h4>
              <p>{lesson.content}</p>
            </div>
          ))
        ) : <p>No lessons uploaded yet!</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <Toaster position="top-center" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <h1>🎓 My LMS School</h1>
        <button onClick={() => setToken("")} style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none" }}>Logout</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
        {courses.map(course => (
          <div key={course.id} style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
            <h2>{course.title}</h2>
            <p style={{ color: "#666" }}>{course.description}</p>
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button onClick={() => handleEnroll(course.id)} style={{ flex: 1, backgroundColor: "#28a745", color: "white", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer" }}>Enroll (${course.price})</button>
              <button onClick={() => handleEnterClass(course.id)} style={{ flex: 1, backgroundColor: "#007bff", color: "white", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer" }}>View Class</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;