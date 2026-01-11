import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://vidhyashram-api.onrender.com';

interface Lesson { id: string; title: string; content: string; }
interface Course { id: string; title: string; description: string; price: number; lessons?: Lesson[]; }

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  // Auth State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  // App State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false); // <--- NEW: Toggle for Create Form

  // Create Course Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState(0);

  useEffect(() => {
    if (token) refreshCourses();
  }, [token]);

  const refreshCourses = () => {
    fetch(`${API_URL}/courses`)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(() => toast.error("Could not load courses."));
  };

  // --- ACTIONS ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging in...");
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.access_token) {
        setToken(data.access_token);
        toast.success("Login Successful!", { id: loadingToast });
      } else {
        toast.error("Login Failed!", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Connection Error", { id: loadingToast });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Creating Account...");
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName })
        });

        if (response.ok) {
            toast.success("Account Created! Please Login.", { id: loadingToast });
            setIsRegistering(false);
        } else {
            const data = await response.json();
            toast.error(data.message || "Registration Failed", { id: loadingToast });
        }
    } catch (error) {
        toast.error("Connection Error", { id: loadingToast });
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Creating Course...");

    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                title: newTitle, 
                description: newDesc, 
                price: Number(newPrice) 
            })
        });

        if (response.ok) {
            toast.success("Course Created!", { id: loadingToast });
            setShowCreateForm(false); 
            refreshCourses(); 
            setNewTitle(""); setNewDesc(""); setNewPrice(0);
        } else {
            toast.error("Failed. Are you a Tutor?", { id: loadingToast });
        }
    } catch (error) {
        toast.error("Error Creating Course", { id: loadingToast });
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
        <Toaster position="top-center" /> 
        <h1>{isRegistering ? "📝 Create Account" : "🔐 Please Login"}</h1>
        <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {isRegistering && (
              <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ padding: "10px" }} />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: "10px" }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: "10px" }} />
          <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
            {isRegistering ? "Sign Up" : "Login"}
          </button>
        </form>
        <p style={{ marginTop: "20px" }}>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}
            <br />
            <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: "none", border: "none", color: "#007bff", textDecoration: "underline", cursor: "pointer", marginTop: "5px" }}>
                {isRegistering ? "Login here" : "Register here"}
            </button>
        </p>
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
      
      {/* HEADER SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <h1>🎓 My LMS School</h1>
        <div>
            {/* NEW: Teacher Button */}
            <button 
                onClick={() => setShowCreateForm(!showCreateForm)} 
                style={{ padding: "5px 15px", backgroundColor: "#6f42c1", color: "white", border: "none", cursor: "pointer", marginRight: "10px", borderRadius: "4px" }}
            >
                {showCreateForm ? "Cancel" : "+ Create Course"}
            </button>
            <button onClick={() => setToken("")} style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}>Logout</button>
        </div>
      </div>

      {/* NEW: CREATE COURSE FORM */}
      {showCreateForm && (
        <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "10px", marginBottom: "30px", border: "1px solid #ddd" }}>
            <h3>👨‍🏫 Teacher Dashboard: Create New Course</h3>
            <form onSubmit={handleCreateCourse} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input type="text" placeholder="Course Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required style={{ flex: 1, padding: "8px" }} />
                <input type="text" placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} required style={{ flex: 2, padding: "8px" }} />
                <input type="number" placeholder="Price $" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} required style={{ width: "80px", padding: "8px" }} />
                <button type="submit" style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "8px 20px", cursor: "pointer", borderRadius: "4px" }}>Create</button>
            </form>
        </div>
      )}

      {/* COURSE LIST */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
        {courses.length === 0 && <p>No courses available. Create one!</p>}
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