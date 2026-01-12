import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // 1. Create Course
  async create(data: { title: string; description: string; price: number; zoomLink?: string }, tutorId: string) {
    return this.prisma.course.create({
      data: {
        ...data,
        tutorId, 
      },
    });
  }

  // 2. Find All Courses (Public)
  async findAll() {
    return this.prisma.course.findMany({
      include: { tutor: { select: { fullName: true } } } 
    });
  }

  // 3. Find One Course (With Security & Enterprise Features)
  async findOne(id: string, user: any) {
    // We first fetch the course with ALL possible data
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { 
        tutor: { select: { id: true, fullName: true, email: true } },
        
        // Load Lessons AND their Attachments (Videos/PDFs)
        lessons: {
          include: { attachments: true },
          orderBy: { createdAt: 'asc' }
        },
        
        // Load Assignments AND Submissions
        assignments: {
          include: {
            // Logic: If Student, only show MY submission. If Tutor, show EVERYONE'S.
            submissions: user.role === 'STUDENT' 
              ? { where: { studentId: user.userId } } 
              : { include: { student: { select: { fullName: true, email: true } } } }
          }
        }
      }, 
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // --- SECURITY CHECKS ---

    // 1. If Teacher (Owner) -> Allow Full Access
    if (user.role === 'TUTOR' && course.tutorId === user.userId) {
      return course;
    }

    // 2. If Enrolled Student -> Allow Full Access
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.userId, 
          courseId: id,
        },
      },
    });

    if (enrollment) {
      return course;
    }

    // 3. Otherwise -> Lock content (Hide lessons and assignments)
    return {
      ...course,
      lessons: [],     // Empty array = "Locked"
      assignments: []  // Empty array = "Locked"
    };
  }

  // 4. Enroll Student
  async enroll(courseId: string, studentId: string) {
    // Prevent double enrollment
    const existing = await this.prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } }
    });
    if (existing) return { message: 'Already enrolled' };

    return this.prisma.enrollment.create({
      data: { courseId, studentId },
    });
  }

  // 5. Find Student's Courses
  async findStudentCourses(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: { 
        course: { include: { tutor: { select: { fullName: true } } } } 
      }
    });
  }

  // 6. Find Tutor's Courses
  async findTutorCourses(tutorId: string) {
    return this.prisma.course.findMany({
      where: { tutorId },
      include: { 
        // specific count syntax for Prisma
        _count: { select: { enrollments: true } } 
      }
    });
  }

  // --- NEW ENTERPRISE FEATURES ---

  // 7. Add Lesson (Now handles Attachments!)
  async addLesson(courseId: string, title: string, content: string, attachments: { name: string, url: string, type: string }[]) {
    return this.prisma.lesson.create({
      data: {
        title,
        content,
        courseId,
        // Automatically create the attachments in the Attachment table
        attachments: {
            create: attachments
        }
      },
      include: { attachments: true }
    });
  }

  // 8. Create Assignment (Tutor)
  async createAssignment(courseId: string, title: string, instructions: string, dueDate: Date) {
    return this.prisma.assignment.create({
        data: { title, instructions, dueDate, courseId }
    });
  }

  // 9. Submit Assignment (Student)
  async submitAssignment(assignmentId: string, studentId: string, fileUrl: string, content?: string) {
    return this.prisma.submission.create({
        data: { assignmentId, studentId, fileUrl, content }
    });
  }

  // 10. Grade Submission (Tutor)
  async gradeSubmission(submissionId: string, grade: number, feedback: string) {
    return this.prisma.submission.update({
        where: { id: submissionId },
        data: { 
            grade, 
            feedback, 
            gradedAt: new Date() 
        }
    });
  }
}