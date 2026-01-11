/*
  Warnings:

  - You are about to drop the column `classId` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `joinedAt` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `term` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseMaterial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GradeLevel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ParentChild` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,courseId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_gradeLevelId_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "ClassSession" DROP CONSTRAINT "ClassSession_classId_fkey";

-- DropForeignKey
ALTER TABLE "CourseMaterial" DROP CONSTRAINT "CourseMaterial_classId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_classId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_classId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSubmission" DROP CONSTRAINT "QuizSubmission_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSubmission" DROP CONSTRAINT "QuizSubmission_studentId_fkey";

-- DropForeignKey
ALTER TABLE "_ParentChild" DROP CONSTRAINT "_ParentChild_A_fkey";

-- DropForeignKey
ALTER TABLE "_ParentChild" DROP CONSTRAINT "_ParentChild_B_fkey";

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "classId",
DROP COLUMN "expiresAt",
DROP COLUMN "joinedAt",
DROP COLUMN "status",
DROP COLUMN "term",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Attendance";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Class";

-- DropTable
DROP TABLE "ClassSession";

-- DropTable
DROP TABLE "CourseMaterial";

-- DropTable
DROP TABLE "GradeLevel";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Quiz";

-- DropTable
DROP TABLE "QuizSubmission";

-- DropTable
DROP TABLE "_ParentChild";

-- DropEnum
DROP TYPE "AttendanceStatus";

-- DropEnum
DROP TYPE "EnrollmentStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_courseId_key" ON "Enrollment"("studentId", "courseId");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
