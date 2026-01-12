import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { jwtDecode } from "jwt-decode"; 

const API_URL = import.meta.env.VITE_API_URL || 'https://vidhyashram-api.onrender.com';

interface Lesson { id: string; title: string; content: string; }
interface Course { id: string; title: string; description: string; price: number; zoomLink?: string; lessons?: Lesson[]; }

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Auth State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [userRole, setUserRole] = useState(""); 
  const [isRegistering, setIsRegistering] = useState(false);
  
  // NEW: Checkbox state for Tutor Registration
  const [isRegisteringAsTutor, setIsRegisteringAsTutor] = useState(false); 
  
  // App State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Forms State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newZoomLink, setNewZoomLink] = useState("");
  
  // Lesson Form State
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");

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
    
    // DECIDE ROLE: If checkbox is checked, send 'TUTOR', else 'STUDENT'
    const roleToSend = isRegisteringAsTutor ? 'TUTOR' : 'STUDENT';

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                password, 
                fullName,
                role: roleToSend // <--- SENDING ROLE HERE
            })
        });

        if (response.ok) {
            toast.success("Account Created! Please Login.", { id: loadingToast });
            setIsRegistering(false);
            // Reset fields
            setFullName(""); setEmail(""); setPassword(""); setIsRegisteringAsTutor(false);
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
                price: Number(newPrice),
                zoomLink: newZoomLink 
            })
        });

        if (response.ok) {
            toast.success("Course Created!", { id: loadingToast });
            setShowCreateForm(false); 
            refreshCourses(); 
            setNewTitle(""); setNewDesc(""); setNewPrice(0); setNewZoomLink("");
        } else {
            toast.error("Failed. Are you a Tutor?", { id: loadingToast });
        }
    } catch (error) {
        toast.error("Error Creating Course", { id: loadingToast });
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    const loadingToast = toast.loading("Uploading Lesson...");

    try {
        const response = await fetch(`${API_URL}/courses/${selectedCourse.id}/lessons`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ title: lessonTitle, content: lessonContent })
        });

        if (response.ok) {
            toast.success("Lesson Added!", { id: loadingToast });
            handleEnterClass(selectedCourse.id);
            setLessonTitle(""); setLessonContent("");
        } else {
            toast.error("Failed to add lesson.", { id: loadingToast });
        }
    } catch (error) {
        toast.error("Error Uploading", { id: loadingToast });
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!token) return toast("Please login first!", { icon: '🔒' });
    const response = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) toast.success("Enrolled Successfully! 🎉");
    else toast.error("Enrollment Failed (Are you a student?)");
  };

  const handleEnterClass = async (courseId: string) => {
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });

    if (response.ok) {
      const data = await response.json();
      setSelectedCourse(data);
    } else {
      toast.error("Could not load class. Please login.");
    }
  };

  // --- VIEWS ---

  if (!token) {
    return (
      <div style={{ padding: "50px", maxWidth: "400px", margin: "0 auto", textAlign: "center", fontFamily: "sans-serif" }}>
        <Toaster position="top-center" /> 
        <h1>{isRegistering ? "📝 Create Account" : "🔐 Please Login"}</h1>
        <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {isRegistering && (
              <>
                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ padding: "10px" }} />
                
                {/* NEW: TUTOR CHECKBOX */}
                <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "5px", background: "#f8f9fa", borderRadius: "5px"}}>
                    <input 
                        type="checkbox" 
                        id="tutorCheck"
                        checked={isRegisteringAsTutor} 
                        onChange={(e) => setIsRegisteringAsTutor(e.target.checked)} 
                        style={{width: "20px", height: "20px"}}
                    />
                    <label htmlFor="tutorCheck" style={{cursor: "pointer", fontWeight: "bold"}}>I am a Teacher 👨‍🏫</label>
                </div>
              </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: "10px" }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: "10px" }} />
          <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
            {isRegistering ? "Sign Up" : "Login"}
          </button>
        </form>
        <p style={{ marginTop: "20px" }}>
            <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: "none", border: "none", color: "#007bff", textDecoration: "underline", cursor: "pointer" }}>
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
        
        <div style={{background: "white", padding: "20px", borderRadius: "10px", border: "1px solid #2880d8"}}>
            <h1>{selectedCourse.title}</h1>
            <p style={{color: "#555"}}>{selectedCourse.description}</p>
            
            {selectedCourse.zoomLink && (
              <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#74b3df", borderRadius: "8px", border: "1px solid #90caf9" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#0d47a1" }}>🎥 Live Class Available</h3>
                <a 
                  href={selectedCourse.zoomLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: "inline-block", 
                    padding: "10px 20px", 
                    backgroundColor: "#2196f3", 
                    color: "white", 
                    textDecoration: "none", 
                    borderRadius: "5px", 
                    fontWeight: "bold" 
                  }}
                >
                  Join Zoom Meeting
                </a>
              </div>
            )}
        </div>

        {userRole === 'TUTOR' && (
            <div style={{ marginTop: "30px", background: "#2880d8", padding: "20px", borderRadius: "8px" }}>
                <h3>➕ Add New Lesson</h3>
                <form onSubmit={handleAddLesson} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input type="text" placeholder="Lesson Title" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} required style={{ padding: "8px" }} />
                    <textarea placeholder="Lesson Content" value={lessonContent} onChange={e => setLessonContent(e.target.value)} required style={{ padding: "8px", minHeight: "80px" }} />
                    <button type="submit" style={{ alignSelf: "flex-start", backgroundColor: "#28a745", color: "white", border: "none", padding: "8px 20px", cursor: "pointer", borderRadius: "4px" }}>Upload Lesson</button>
                </form>
            </div>
        )}

        <hr style={{margin: "40px 0"}}/>

        <h3>📚 Course Content</h3>
        {selectedCourse.lessons?.length ? (
          selectedCourse.lessons.map(lesson => (
            <div key={lesson.id} style={{ background: "#75f7f9", padding: "15px", marginBottom: "15px", borderRadius: "8px", borderLeft: "5px solid #007bff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              <h4 style={{marginTop: 0}}>{lesson.title}</h4>
              <p style={{lineHeight: "1.6"}}>{lesson.content}</p>
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
        <div>
            {userRole === 'TUTOR' && (
                <button 
                    onClick={() => setShowCreateForm(!showCreateForm)} 
                    style={{ padding: "8px 16px", backgroundColor: "#6f42c1", color: "white", border: "none", cursor: "pointer", marginRight: "10px", borderRadius: "4px" }}
                >
                    {showCreateForm ? "Cancel" : "+ Create Course"}
                </button>
            )}
            <button onClick={() => setToken("")} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}>Logout</button>
        </div>
      </div>

      {showCreateForm && userRole === 'TUTOR' && (
        <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "10px", marginBottom: "30px", border: "1px solid #ddd" }}>
            <h3>👨‍🏫 Teacher Dashboard: Create New Course</h3>
            <form onSubmit={handleCreateCourse} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input type="text" placeholder="Course Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required style={{ flex: "1 1 200px", padding: "8px" }} />
                <input type="text" placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} required style={{ flex: "2 1 300px", padding: "8px" }} />
                <input type="number" placeholder="Price $" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} required style={{ width: "80px", padding: "8px" }} />
                <input type="text" placeholder="Zoom Link (Optional)" value={newZoomLink} onChange={e => setNewZoomLink(e.target.value)} style={{ flex: "1 1 200px", padding: "8px" }} />
                <button type="submit" style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "8px 20px", cursor: "pointer", borderRadius: "4px" }}>Create</button>
            </form>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
        {courses.map(course => (
          <div key={course.id} style={{ border: "1px solid #eee", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <h2 style={{marginTop: 0}}>{course.title}</h2>
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