// src/App.tsx
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { jwtDecode } from "jwt-decode"; 
import CourseDetail from './components/CourseDetail'; // <--- Import the new component

const API_URL = import.meta.env.VITE_API_URL || 'https://vidhyashram-api.onrender.com';

function App() {
  const [courses, setCourses] = useState<any[]>([]);
  
  // Auth State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [userRole, setUserRole] = useState(""); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegisteringAsTutor, setIsRegisteringAsTutor] = useState(false); 
  
  // App State
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [fullCourseData, setFullCourseData] = useState<any | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create Course Form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newZoomLink, setNewZoomLink] = useState("");

  useEffect(() => {
    if (token) {
        refreshCourses();
        try {
            const decoded: any = jwtDecode(token);
            setUserRole(decoded.role); 
        } catch (e) { console.log("Token decode failed"); }
    }
  }, [token]);

  const refreshCourses = () => {
    fetch(`${API_URL}/courses`)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(() => toast.error("Could not load courses."));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging in...");
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.access_token) {
        setToken(data.access_token);
        toast.success("Login Successful!", { id: loadingToast });
      } else {
        toast.error("Login Failed!", { id: loadingToast });
      }
    } catch { toast.error("Connection Error", { id: loadingToast }); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Creating Account...");
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName, role: isRegisteringAsTutor ? 'TUTOR' : 'STUDENT' })
        });
        if (response.ok) {
            toast.success("Account Created! Please Login.", { id: loadingToast });
            setIsRegistering(false);
        } else {
            toast.error("Registration Failed", { id: loadingToast });
        }
    } catch { toast.error("Connection Error", { id: loadingToast }); }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Creating Course...");
    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title: newTitle, description: newDesc, price: Number(newPrice), zoomLink: newZoomLink })
        });
        if (response.ok) {
            toast.success("Course Created!", { id: loadingToast });
            setShowCreateForm(false); refreshCourses();
        } else { toast.error("Failed.", { id: loadingToast }); }
    } catch { toast.error("Error", { id: loadingToast }); }
  };

  const handleEnroll = async (courseId: string) => {
    if (!token) return toast("Please login first!", { icon: '🔒' });
    const response = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) toast.success("Enrolled Successfully! 🎉");
    else toast.error("Enrollment Failed");
  };

  const handleEnterClass = async (courseId: string) => {
    const loading = toast.loading("Entering Class...");
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
      method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      setFullCourseData(data); // Store the full data (lessons, assignments)
      setSelectedCourseId(courseId);
      toast.dismiss(loading);
    } else {
      toast.error("Access Denied (Enroll first!)", { id: loading });
    }
  };

  // --- VIEW ROUTING ---

  if (!token) return (
      <div style={{ padding: "50px", maxWidth: "400px", margin: "0 auto", textAlign: "center", fontFamily: "sans-serif" }}>
        <Toaster position="top-center" /> 
        <h1>{isRegistering ? "📝 Create Account" : "🔐 Please Login"}</h1>
        <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {isRegistering && <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ padding: "10px" }} />}
            {isRegistering && (
                <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "5px", background: "#f8f9fa"}}>
                    <input type="checkbox" checked={isRegisteringAsTutor} onChange={(e) => setIsRegisteringAsTutor(e.target.checked)} />
                    <label>I am a Teacher 👨‍🏫</label>
                </div>
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: "10px" }} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: "10px" }} />
            <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none" }}>{isRegistering ? "Sign Up" : "Login"}</button>
        </form>
        <button onClick={() => setIsRegistering(!isRegistering)} style={{ marginTop: "20px", background: "none", border: "none", color: "#007bff" }}>{isRegistering ? "Login here" : "Register here"}</button>
      </div>
  );

  // IF A COURSE IS SELECTED, SHOW THE NEW DETAIL COMPONENT
  if (selectedCourseId && fullCourseData) {
      return (
        <>
            <Toaster position="top-center" />
            <CourseDetail 
                course={fullCourseData} 
                token={token} 
                userRole={userRole} 
                onBack={() => { setSelectedCourseId(null); setFullCourseData(null); }}
                onRefresh={() => handleEnterClass(selectedCourseId)}
            />
        </>
      );
  }

  // OTHERWISE, SHOW THE DASHBOARD
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <Toaster position="top-center" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <h1>🎓 My LMS School</h1>
        <div>
            {userRole === 'TUTOR' && <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ padding: "8px 16px", backgroundColor: "#6f42c1", color: "white", border: "none", marginRight: "10px", borderRadius: "4px" }}>+ Create Course</button>}
            <button onClick={() => setToken("")} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px" }}>Logout</button>
        </div>
      </div>

      {showCreateForm && userRole === 'TUTOR' && (
        <div style={{ background: "#e2e6ea", padding: "20px", borderRadius: "10px", marginBottom: "30px" }}>
            <h3>Create New Course</h3>
            <form onSubmit={handleCreateCourse} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input type="text" placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required style={{ padding: "8px" }} />
                <input type="text" placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} required style={{ padding: "8px", flex: 2 }} />
                <input type="number" placeholder="Price" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} required style={{ padding: "8px", width: "80px" }} />
                <input type="text" placeholder="Zoom Link" value={newZoomLink} onChange={e => setNewZoomLink(e.target.value)} style={{ padding: "8px" }} />
                <button type="submit" style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "8px" }}>Create</button>
            </form>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
        {courses.map(course => (
          <div key={course.id} style={{ border: "1px solid #eee", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <h2 style={{marginTop: 0}}>{course.title}</h2>
            <p style={{ color: "#666" }}>{course.description}</p>
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button onClick={() => handleEnroll(course.id)} style={{ flex: 1, backgroundColor: "#28a745", color: "white", border: "none", padding: "10px", borderRadius: "6px" }}>Enroll (${course.price})</button>
              <button onClick={() => handleEnterClass(course.id)} style={{ flex: 1, backgroundColor: "#007bff", color: "white", border: "none", padding: "10px", borderRadius: "6px" }}>View Class</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;