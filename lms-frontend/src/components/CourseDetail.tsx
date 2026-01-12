// src/components/CourseDetail.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import FileUpload from './FileUpload';

const API_URL = import.meta.env.VITE_API_URL || 'https://vidhyashram-api.onrender.com';

interface Props {
  course: any;
  token: string;
  userRole: string;
  onBack: () => void;
  onRefresh: () => void; // Reload data to see new uploads
}

export default function CourseDetail({ course, token, userRole, onBack, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<'LESSONS' | 'ASSIGNMENTS'>('LESSONS');
  
  // Lesson Form State
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);

  // Assignment Form State
  const [assignTitle, setAssignTitle] = useState("");
  const [assignInstr, setAssignInstr] = useState("");
  const [assignDue, setAssignDue] = useState("");

  // --- ACTIONS ---

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const loading = toast.loading("Publishing Lesson...");
    try {
      await fetch(`${API_URL}/courses/${course.id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: lessonTitle, content: lessonContent, attachments })
      });
      toast.success("Lesson Published!", { id: loading });
      setLessonTitle(""); setLessonContent(""); setAttachments([]);
      onRefresh();
    } catch { toast.error("Failed", { id: loading }); }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const loading = toast.loading("Creating Assignment...");
    try {
      await fetch(`${API_URL}/courses/${course.id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: assignTitle, instructions: assignInstr, dueDate: assignDue })
      });
      toast.success("Assignment Created!", { id: loading });
      setAssignTitle(""); setAssignInstr(""); setAssignDue("");
      onRefresh();
    } catch { toast.error("Failed", { id: loading }); }
  };

  const handleSubmitWork = async (assignmentId: string, fileUrl: string) => {
    const loading = toast.loading("Submitting Homework...");
    try {
      await fetch(`${API_URL}/courses/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fileUrl })
      });
      toast.success("Homework Submitted!", { id: loading });
      onRefresh();
    } catch { toast.error("Failed", { id: loading }); }
  };

  const handleGrade = async (submissionId: string, grade: number, feedback: string) => {
    try {
        await fetch(`${API_URL}/courses/submissions/${submissionId}/grade`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ grade, feedback })
        });
        toast.success("Graded!");
        onRefresh();
    } catch { toast.error("Grading Failed"); }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">← Back to Dashboard</button>
      
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600 mb-6">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600">{course.description}</p>
        {course.zoomLink && (
            <a href={course.zoomLink} target="_blank" className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded font-bold hover:bg-blue-600">🎥 Join Live Class</a>
        )}
      </div>

      {/* TABS */}
      <div className="flex border-b mb-6">
        <button onClick={() => setActiveTab('LESSONS')} className={`px-6 py-3 font-bold ${activeTab === 'LESSONS' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}>📚 Lessons</button>
        <button onClick={() => setActiveTab('ASSIGNMENTS')} className={`px-6 py-3 font-bold ${activeTab === 'ASSIGNMENTS' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}>📝 Assignments</button>
      </div>

      {/* --- LESSONS TAB --- */}
      {activeTab === 'LESSONS' && (
        <div>
          {/* TEACHER ADD LESSON FORM */}
          {userRole === 'TUTOR' && (
            <div className="bg-blue-50 p-4 rounded mb-8 border border-blue-100">
              <h3 className="font-bold mb-2">➕ Add New Lesson</h3>
              <input className="w-full p-2 border mb-2 rounded" placeholder="Lesson Title" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} />
              <textarea className="w-full p-2 border mb-2 rounded h-24" placeholder="Description/Content" value={lessonContent} onChange={e => setLessonContent(e.target.value)} />
              
              {/* FILE UPLOAD & LIST */}
              <FileUpload label="Attach Video/PDF (Optional)" onUploadComplete={(file) => setAttachments([...attachments, file])} />
              <div className="mb-2">
                {attachments.map((f, i) => <div key={i} className="text-xs bg-gray-200 p-1 inline-block mr-2 rounded">📎 {f.name}</div>)}
              </div>
              
              <button onClick={handleAddLesson} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Publish Lesson</button>
            </div>
          )}

          {/* LESSON LIST */}
          <div className="space-y-4">
            {course.lessons?.map((lesson: any) => (
              <div key={lesson.id} className="bg-white p-5 rounded shadow border-l-4 border-blue-400">
                <h3 className="text-xl font-bold">{lesson.title}</h3>
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{lesson.content}</p>
                {/* ATTACHMENTS DISPLAY */}
                <div className="flex flex-wrap gap-2">
                    {lesson.attachments?.map((att: any) => (
                        <a key={att.id} href={att.url} target="_blank" className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 text-blue-600 text-sm font-semibold">
                            {att.type === 'VIDEO' ? '🎥' : '📄'} {att.name}
                        </a>
                    ))}
                </div>
              </div>
            ))}
            {course.lessons?.length === 0 && <p className="text-gray-500 italic">No lessons yet.</p>}
          </div>
        </div>
      )}

      {/* --- ASSIGNMENTS TAB --- */}
      {activeTab === 'ASSIGNMENTS' && (
        <div>
           {/* TEACHER CREATE ASSIGNMENT */}
           {userRole === 'TUTOR' && (
            <div className="bg-purple-50 p-4 rounded mb-8 border border-purple-100">
              <h3 className="font-bold mb-2">➕ Create Assignment</h3>
              <input className="w-full p-2 border mb-2 rounded" placeholder="Title" value={assignTitle} onChange={e => setAssignTitle(e.target.value)} />
              <textarea className="w-full p-2 border mb-2 rounded h-20" placeholder="Instructions" value={assignInstr} onChange={e => setAssignInstr(e.target.value)} />
              <label className="text-xs font-bold block mb-1">Due Date</label>
              <input type="datetime-local" className="w-full p-2 border mb-2 rounded" value={assignDue} onChange={e => setAssignDue(e.target.value)} />
              <button onClick={handleCreateAssignment} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Create Assignment</button>
            </div>
          )}

          {/* ASSIGNMENT LIST */}
          <div className="space-y-6">
            {course.assignments?.map((assign: any) => (
                <div key={assign.id} className="bg-white p-5 rounded shadow border-l-4 border-purple-400">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold">{assign.title}</h3>
                            <p className="text-gray-600 mb-2">{assign.instructions}</p>
                            <p className="text-xs text-red-500 font-bold">Due: {new Date(assign.dueDate).toLocaleString()}</p>
                        </div>
                        
                        {/* STUDENT SUBMISSION AREA */}
                        {userRole === 'STUDENT' && (
                            <div className="bg-gray-50 p-3 rounded w-64">
                                {assign.submissions?.length > 0 ? (
                                    <div className="text-center">
                                        <p className="text-green-600 font-bold mb-1">✅ Submitted</p>
                                        <p className="text-xs text-gray-500">Grade: {assign.submissions[0].grade ?? 'Pending'} / 100</p>
                                        {assign.submissions[0].feedback && <p className="text-xs bg-yellow-100 p-1 mt-1 rounded">"{assign.submissions[0].feedback}"</p>}
                                    </div>
                                ) : (
                                    <FileUpload label="Upload Homework" onUploadComplete={(f) => handleSubmitWork(assign.id, f.url)} />
                                )}
                            </div>
                        )}
                    </div>

                    {/* TEACHER GRADING AREA */}
                    {userRole === 'TUTOR' && assign.submissions?.length > 0 && (
                        <div className="mt-4 border-t pt-2">
                            <h4 className="font-bold text-sm mb-2">Student Submissions ({assign.submissions.length})</h4>
                            {assign.submissions.map((sub: any) => (
                                <div key={sub.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 mb-1 rounded">
                                    <div>
                                        <span className="font-bold">{sub.student.fullName}</span>
                                        <a href={sub.fileUrl} target="_blank" className="text-blue-600 ml-2 hover:underline">View File</a>
                                        <div className="text-xs text-gray-500">
                                            Submitted: {new Date(sub.submittedAt).toLocaleString()}
                                            {new Date(sub.submittedAt) > new Date(assign.dueDate) && <span className="text-red-500 font-bold ml-1">(LATE)</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="0-100" className="w-16 border p-1 rounded" defaultValue={sub.grade} onBlur={(e) => handleGrade(sub.id, Number(e.target.value), sub.feedback || '')} />
                                        <input type="text" placeholder="Feedback" className="w-32 border p-1 rounded" defaultValue={sub.feedback} onBlur={(e) => handleGrade(sub.id, sub.grade || 0, e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            {course.assignments?.length === 0 && <p className="text-gray-500 italic">No assignments yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}