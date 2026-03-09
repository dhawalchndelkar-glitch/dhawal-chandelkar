/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Course {
  id: string;
  name: string;
  professor: string;
  credits: number;
  type: 'Core' | 'Elective';
  topics: string[];
  evaluation: {
    component: string;
    weightage: number;
  }[];
}

export interface ScheduleItem {
  id: string;
  courseId: string;
  date: string; // ISO string
  time: string;
  sessionNumber: string;
  type: 'Class' | 'Quiz' | 'MidTerm' | 'EndTerm';
}

export interface Note {
  id: string;
  title: string;
  courseId: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: number;
}

export type AttendanceStatus = 'present' | 'absent' | null;

export interface AttendanceRecord {
  [scheduleId: string]: AttendanceStatus;
}

export interface ProgressRecord {
  [courseId: string]: {
    [component: string]: number;
  };
}
