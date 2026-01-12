-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "zoomLink" TEXT;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'WEBSITE';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "fullName" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'STUDENT';
