import { Injectable, NotFoundException } from '@nestjs/common'; // <--- We added NotFoundException here
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // 1. Create Course
  async create(data: { title: string; description: string; price: number }, tutorId: string) {
    return this.prisma.course.create({
      data: {
        ...data,
        tutorId, 
      },
    });
  }

  // 2. Find All Courses
  async findAll() {
    return this.prisma.course.findMany({
      include: { tutor: { select: { fullName: true } } } 
    });
  }

  // 3. Find One Course (With Security Check)
  async findOne(id: string, user: any) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { 
        lessons: true, 
        tutor: true 
      }, 
    });

    // If course doesn't exist, throw the error
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // --- SECURITY CHECKS ---

    // 1. If Teacher (Owner) -> Allow Full Access
    // We use 'userId' because that is what your Strategy uses
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

    // 3. Otherwise -> Lock content (Hide lessons)
    return {
      ...course,
      lessons: [], // Empty array = "Locked"
    };
  }

  // 4. Enroll Student
  async enroll(courseId: string, studentId: string) {
    return this.prisma.enrollment.create({
      data: {
        courseId,
        studentId,
      },
    });
  }

  // 5. Find Student's Courses
  async findStudentCourses(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: { course: true }
    });
  }

  // 6. Find Tutor's Courses
  async findTutorCourses(tutorId: string) {
    return this.prisma.course.findMany({
      where: { tutorId },
      include: { 
        _count: { select: { enrollments: true } } 
      }
    });
  }

  // 7. Add Lesson
  async addLesson(courseId: string, title: string, content: string) {
    return this.prisma.lesson.create({
      data: {
        title,
        content,
        courseId
      }
    });
  }
}