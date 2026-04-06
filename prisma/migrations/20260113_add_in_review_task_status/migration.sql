-- Add IN_REVIEW status to TaskStatus enum
ALTER TYPE "TaskStatus" ADD VALUE 'IN_REVIEW' AFTER 'IN_PROGRESS';
