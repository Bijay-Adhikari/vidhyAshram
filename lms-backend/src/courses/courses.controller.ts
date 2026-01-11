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
  create(@Body() createCourseDto: { title: string; description: string; price: number }, @Request() req) {
    return this.coursesService.create(createCourseDto, req.user.userId);
  }

  // 2. View All Courses (Public)
  @Get()
  findAll() {
    return this.coursesService.findAll();
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

 // 3. View One Course (Public)
  @Get(':id')
  findOne(@Param('id') id: string) {
    // We switched to the new service function here!
    return this.coursesService.getCourseWithLessons(id);
  }

  // 4. Enroll in a Course (Students Only) -> NEW FUNCTION
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STUDENT')
  @Post(':id/enroll')
  enroll(@Param('id') courseId: string, @Request() req) {
    return this.coursesService.enroll(courseId, req.user.userId);
  }

  // 7. Add a Lesson (Tutors Only)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TUTOR')
  @Post(':id/lessons')
  addLesson(
    @Param('id') courseId: string, 
    @Body() body: { title: string; content: string }
  ) {
    return this.coursesService.addLesson(courseId, body.title, body.content);
  }
}