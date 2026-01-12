import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // 1. Create a Course (Tutors Only)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TUTOR')
  @Post()
  create(@Body() createCourseDto: { title: string; description: string; price: number; zoomLink?: string }, @Request() req) {
    return this.coursesService.create(createCourseDto, req.user.userId);
  }

  // 2. View All Courses (Public)
  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  // 3. View ONE Course (Protected - Checks Enrollment)
  @UseGuards(AuthGuard('jwt')) 
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.coursesService.findOne(id, req.user);
  }

  // 4. Enroll in a Course (Students Only)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STUDENT')
  @Post(':id/enroll')
  enroll(@Param('id') courseId: string, @Request() req) {
    return this.coursesService.enroll(courseId, req.user.userId);
  }

  // 5. View My Enrolled Courses (Student Dashboard)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STUDENT')
  @Get('my-courses') 
  findMyCourses(@Request() req) {
    return this.coursesService.findStudentCourses(req.user.userId);
  }

  // 6. View My Courses & Students (Tutor Dashboard)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TUTOR')
  @Get('teacher-dashboard')
  findTutorDashboard(@Request() req) {
    return this.coursesService.findTutorCourses(req.user.userId);
  }

  // 7. Add a Lesson (Tutors Only)
  // UPDATED: Now accepts optional 'attachments'
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TUTOR')
  @Post(':id/lessons')
  addLesson(
    @Param('id') courseId: string, 
    @Body() body: { title: string; content: string; attachments?: { name: string; url: string; type: string }[] }
  ) {
    // If no attachments sent, pass empty array []
    return this.coursesService.addLesson(courseId, body.title, body.content, body.attachments || []);
  }

  // --- NEW ASSIGNMENT ROUTES ---

  // 8. Create Assignment (Tutors Only)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TUTOR')
  @Post(':id/assignments')
  createAssignment(
      @Param('id') courseId: string,
      @Body() body: { title: string; instructions: string; dueDate: string }
  ) {
      return this.coursesService.createAssignment(courseId, body.title, body.instructions, new Date(body.dueDate));
  }

  // 9. Submit Assignment (Students Only)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STUDENT')
  @Post('assignments/:id/submit')
  submitAssignment(
      @Param('id') assignmentId: string,
      @Request() req,
      @Body() body: { fileUrl: string; content?: string }
  ) {
      return this.coursesService.submitAssignment(assignmentId, req.user.userId, body.fileUrl, body.content);
  }

  // 10. Grade Submission (Tutors Only)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TUTOR')
  @Post('submissions/:id/grade')
  gradeSubmission(
      @Param('id') submissionId: string,
      @Body() body: { grade: number; feedback: string }
  ) {
      return this.coursesService.gradeSubmission(submissionId, body.grade, body.feedback);
  }
}