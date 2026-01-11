import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // We accept the data AND the ID of the Tutor creating it
  create(createCourseDto: any, tutorId: string) {
    return this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        description: createCourseDto.description,
        price: createCourseDto.price,
        tutorId: tutorId, // <--- Link the course to the logged-in Tutor
      },
    });
  }

  findAll() {
    return this.prisma.course.findMany();
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({ where: { id } });
  }

  async enroll(courseId: string, userId: string) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new Error('Course not found');
    }

    // Create the enrollment
    return this.prisma.enrollment.create({
      data: {
        courseId: courseId,
        studentId: userId,
      },
    });
  }

  async findStudentCourses(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        studentId: studentId, // Filter by THIS student
      },
      include: {
        course: true, // Join the 'Course' table to get the title/description
      },
    });
  }

  async findTutorCourses(tutorId: string) {
    return this.prisma.course.findMany({
      where: {
        tutorId: tutorId, // Only courses owned by this tutor
      },
      include: {
        enrollments: {
          include: {
            student: {
              // SECURITY: Only select safe fields!
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async addLesson(courseId: string, title: string, content: string) {
    return this.prisma.lesson.create({
      data: {
        title: title,
        content: content,
        courseId: courseId,
      },
    });
  }
  
  // Use this INSTEAD of findOne if you want to see lessons
  async getCourseWithLessons(courseId: string) {
    return this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: true, // <--- VS Code should recognize this now!
      },
    });
  }
}