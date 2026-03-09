/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  TrendingUp, 
  StickyNote, 
  Video,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Upload,
  Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isPast, isToday, parseISO, startOfWeek, endOfWeek, isSameDay, eachDayOfInterval } from 'date-fns';

import { Course, ScheduleItem, Note, AttendanceRecord, ProgressRecord } from './types';
import { COURSES, SCHEDULE, IMPORTANT_DATES } from './constants';
import { generateVideoFromImage } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'overview' | 'courses' | 'schedule' | 'attendance' | 'progress' | 'notes' | 'veo';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [attendance, setAttendance] = useState<AttendanceRecord>(() => {
    const saved = localStorage.getItem('ipm_attendance');
    return saved ? JSON.parse(saved) : {};
  });
  const [progress, setProgress] = useState<ProgressRecord>(() => {
    const saved = localStorage.getItem('ipm_progress');
    return saved ? JSON.parse(saved) : {};
  });
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('ipm_notes');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('ipm_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('ipm_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('ipm_notes', JSON.stringify(notes));
  }, [notes]);

  const switchTab = (tab: Tab, element: HTMLButtonElement | null) => {
    setActiveTab(tab);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:top-0 lg:bottom-0 lg:w-64 bg-white border-t lg:border-t-0 lg:border-r border-slate-200 z-50 flex lg:flex-col">
        <div className="hidden lg:flex items-center p-6 border-bottom border-slate-100">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mr-3">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">IPM Term 3</h1>
            <p className="text-xs text-slate-500">Batch 2025-30 • Sec A</p>
          </div>
        </div>

        <div className="flex lg:flex-col flex-1 overflow-x-auto lg:overflow-y-auto p-2 lg:p-4 gap-1 no-scrollbar">
          <NavButton 
            active={activeTab === 'overview'} 
            onClick={(e) => switchTab('overview', e.currentTarget)} 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
          />
          <NavButton 
            active={activeTab === 'courses'} 
            onClick={(e) => switchTab('courses', e.currentTarget)} 
            icon={<BookOpen size={20} />} 
            label="Courses" 
          />
          <NavButton 
            active={activeTab === 'schedule'} 
            onClick={(e) => switchTab('schedule', e.currentTarget)} 
            icon={<Calendar size={20} />} 
            label="Schedule" 
          />
          <NavButton 
            active={activeTab === 'attendance'} 
            onClick={(e) => switchTab('attendance', e.currentTarget)} 
            icon={<CheckSquare size={20} />} 
            label="Attendance" 
          />
          <NavButton 
            active={activeTab === 'progress'} 
            onClick={(e) => switchTab('progress', e.currentTarget)} 
            icon={<TrendingUp size={20} />} 
            label="Progress" 
          />
          <NavButton 
            active={activeTab === 'notes'} 
            onClick={(e) => switchTab('notes', e.currentTarget)} 
            icon={<StickyNote size={20} />} 
            label="Notes" 
          />
          <NavButton 
            active={activeTab === 'veo'} 
            onClick={(e) => switchTab('veo', e.currentTarget)} 
            icon={<Video size={20} />} 
            label="Veo" 
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 pb-24 lg:pb-12 p-4 lg:p-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab attendance={attendance} />
            )}
            {activeTab === 'courses' && (
              <CoursesTab />
            )}
            {activeTab === 'schedule' && (
              <ScheduleTab attendance={attendance} setAttendance={setAttendance} />
            )}
            {activeTab === 'attendance' && (
              <AttendanceTab attendance={attendance} />
            )}
            {activeTab === 'progress' && (
              <ProgressTab progress={progress} setProgress={setProgress} />
            )}
            {activeTab === 'notes' && (
              <NotesTab notes={notes} setNotes={setNotes} />
            )}
            {activeTab === 'veo' && (
              <VeoTab />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col lg:flex-row items-center lg:w-full p-3 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 group whitespace-nowrap",
        active 
          ? "bg-indigo-50 text-indigo-600 lg:shadow-sm" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <span className={cn("mb-1 lg:mb-0 lg:mr-3 transition-transform group-active:scale-95", active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")}>
        {icon}
      </span>
      <span className="text-[10px] lg:text-sm font-medium">{label}</span>
    </button>
  );
}

// --- TAB COMPONENTS ---

function OverviewTab({ attendance }: { attendance: AttendanceRecord }) {
  const stats = useMemo(() => {
    const totalClasses = 155;
    const attended = Object.values(attendance).filter(v => v === 'present').length;
    const absent = Object.values(attendance).filter(v => v === 'absent').length;
    
    return {
      totalCourses: 10,
      core: 8,
      electives: 2,
      credits: 27,
      totalClasses,
      maxMissed: 31,
      attended,
      absent,
      remaining: totalClasses - attended
    };
  }, [attendance]);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Term 3 Dashboard</h2>
        <p className="text-slate-500 mt-1">Welcome back, Section A. Here's your term at a glance.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Courses" value={stats.totalCourses} sub={`${stats.core} Core, ${stats.electives} Elective`} icon={<BookOpen className="text-blue-500" />} />
        <StatCard label="Credits" value={stats.credits} sub="Total Term Credits" icon={<TrendingUp className="text-emerald-500" />} />
        <StatCard label="Total Classes" value={stats.totalClasses} sub={`Max Missed: ${stats.maxMissed}`} icon={<Calendar className="text-orange-500" />} />
        <StatCard label="Attendance" value={`${stats.attended}P / ${stats.absent}A`} sub={`${stats.remaining} Classes Left`} icon={<CheckSquare className="text-indigo-500" />} />
      </div>

      {/* Evaluation Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg">Evaluation Components</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Components & Weightages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COURSES.map(course => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{course.name}</div>
                    <div className="text-xs text-slate-500">{course.professor}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {course.evaluation.map((comp, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {comp.component}: {comp.weightage}%
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Important Dates */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-lg mb-4">Important Dates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {IMPORTANT_DATES.map((item, idx) => (
            <div key={idx} className="flex items-start p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mr-3 shrink-0",
                item.type === 'start' ? "bg-emerald-100 text-emerald-600" :
                item.type === 'mid' ? "bg-orange-100 text-orange-600" :
                "bg-rose-100 text-rose-600"
              )}>
                <Calendar size={20} />
              </div>
              <div>
                <div className="font-bold text-slate-900">{item.label}</div>
                <div className="text-sm text-slate-500">{format(parseISO(item.date), 'MMMM do, yyyy')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string, value: string | number, sub: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-500 mt-1">{label}</div>
      <div className="text-xs text-slate-400 mt-2">{sub}</div>
    </div>
  );
}

function CoursesTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
        <p className="text-slate-500 mt-1">Detailed overview of your curriculum for Term 3.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {COURSES.map(course => (
          <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setExpandedId(expandedId === course.id ? null : course.id)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mr-4",
                  course.type === 'Core' ? "bg-indigo-100 text-indigo-600" : "bg-amber-100 text-amber-600"
                )}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{course.name}</h3>
                  <p className="text-sm text-slate-500">{course.professor} • {course.credits} Credits</p>
                </div>
              </div>
              {expandedId === course.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </button>
            <AnimatePresence>
              {expandedId === course.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-2 border-t border-slate-50">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Topics Covered</h4>
                        <ul className="space-y-2">
                          {course.topics.map((topic, idx) => (
                            <li key={idx} className="flex items-center text-sm text-slate-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 shrink-0" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Evaluation Breakdown</h4>
                        <div className="space-y-3">
                          {course.evaluation.map((comp, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-700">{comp.component}</span>
                                <span className="font-bold text-slate-900">{comp.weightage}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${comp.weightage}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleTab({ attendance, setAttendance }: { attendance: AttendanceRecord, setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord>> }) {
  const termInterval = {
    start: parseISO('2026-03-09'),
    end: parseISO('2026-06-06')
  };

  const days = useMemo(() => eachDayOfInterval(termInterval), []);

  const groupedSchedule = useMemo(() => {
    const weeks: Record<string, Record<string, ScheduleItem[]>> = {};
    
    days.forEach(day => {
      const weekStart = format(startOfWeek(day, { weekStartsOn: 1 }), 'MMM d');
      const weekEnd = format(endOfWeek(day, { weekStartsOn: 1 }), 'MMM d');
      const weekLabel = `Week: ${weekStart} - ${weekEnd}`;
      const dayLabel = format(day, 'yyyy-MM-dd');
      
      if (!weeks[weekLabel]) weeks[weekLabel] = {};
      if (!weeks[weekLabel][dayLabel]) weeks[weekLabel][dayLabel] = [];
      
      const classes = SCHEDULE.filter(item => isSameDay(parseISO(item.date), day));
      weeks[weekLabel][dayLabel] = classes;
    });
    
    return weeks;
  }, [days]);

  const markAttendance = (id: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === status ? null : status
    }));
  };

  const isMidTerm = (date: Date) => {
    const d = format(date, 'yyyy-MM-dd');
    return d >= '2026-04-17' && d <= '2026-04-22';
  };

  const isEndTerm = (date: Date) => {
    const d = format(date, 'yyyy-MM-dd');
    return d >= '2026-05-23' && d <= '2026-06-06';
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
          <p className="text-slate-500 mt-1">Section A / D-301 Timetable</p>
        </div>
        <div className="flex gap-2 text-xs font-medium">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded" /> Today</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded" /> Quiz</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded" /> Mid</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-100 border border-rose-200 rounded" /> End</div>
        </div>
      </header>

      <div className="space-y-16">
        {Object.entries(groupedSchedule).map(([weekLabel, daysMap]) => (
          <section key={weekLabel}>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
              <span className="mr-4">{weekLabel}</span>
              <div className="flex-1 h-px bg-slate-200" />
            </h3>
            
            <div className="space-y-8">
              {Object.entries(daysMap).map(([dayISO, items]) => {
                const dayDate = parseISO(dayISO);
                const isSun = dayDate.getDay() === 0;
                const today = isToday(dayDate);
                const past = isPast(dayDate) && !today;
                const mid = isMidTerm(dayDate);
                const end = isEndTerm(dayDate);

                return (
                  <div key={dayISO} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-2">
                      <div className={cn(
                        "sticky top-8 p-3 rounded-xl border transition-colors",
                        today ? "bg-green-600 text-white border-green-600" : 
                        past ? "bg-slate-100 text-slate-400 border-slate-200" :
                        "bg-white text-slate-900 border-slate-200"
                      )}>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{format(dayDate, 'EEEE')}</div>
                        <div className="text-xl font-black">{format(dayDate, 'MMM d')}</div>
                      </div>
                    </div>

                    <div className="lg:col-span-10">
                      {isSun ? (
                        <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center text-slate-400 font-medium italic">
                          Sunday - No Classes
                        </div>
                      ) : items.length === 0 ? (
                        <div className={cn(
                          "p-6 rounded-2xl border border-dashed flex flex-col items-center justify-center font-medium italic",
                          mid ? "bg-orange-50 border-orange-200 text-orange-600" :
                          end ? "bg-rose-50 border-rose-200 text-rose-600" :
                          "bg-slate-50/50 border-slate-200 text-slate-400"
                        )}>
                          {mid ? "Mid-Term Examination Period" : end ? "End-Term Examination Period" : "No classes scheduled"}
                          {(mid || end) && <span className="text-xs mt-1 not-italic opacity-70">Check official exam schedule for details</span>}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map(item => {
                            const course = COURSES.find(c => c.id === item.courseId);
                            const status = attendance[item.id];
                            return (
                              <div 
                                key={item.id} 
                                className={cn(
                                  "group relative bg-white p-4 rounded-2xl shadow-sm border transition-all duration-200",
                                  past ? "opacity-60 grayscale-[0.5]" : "hover:shadow-md hover:border-indigo-200",
                                  item.type === 'Quiz' && "bg-yellow-50/50 border-yellow-200",
                                  item.type === 'MidTerm' && "bg-orange-50/50 border-orange-200",
                                  item.type === 'EndTerm' && "bg-rose-50/50 border-rose-200"
                                )}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="text-sm font-bold text-slate-900">{item.time}</div>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => markAttendance(item.id, 'present')}
                                      title="Mark Present"
                                      className={cn(
                                        "w-8 h-8 rounded-lg border flex items-center justify-center transition-all",
                                        status === 'present' 
                                          ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" 
                                          : "bg-white border-slate-200 text-slate-300 hover:border-emerald-400 hover:text-emerald-500"
                                      )}
                                    >
                                      <CheckSquare size={16} />
                                    </button>
                                    <button 
                                      onClick={() => markAttendance(item.id, 'absent')}
                                      title="Mark Absent"
                                      className={cn(
                                        "w-8 h-8 rounded-lg border flex items-center justify-center transition-all",
                                        status === 'absent' 
                                          ? "bg-rose-600 border-rose-600 text-white shadow-sm" 
                                          : "bg-white border-slate-200 text-slate-300 hover:border-rose-400 hover:text-rose-500"
                                      )}
                                    >
                                      <Plus size={16} className="rotate-45" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="font-bold text-slate-900 leading-tight">
                                  {course?.name || item.courseId}
                                </div>
                                <div className="flex items-center mt-2 text-xs text-slate-500">
                                  <Clock size={12} className="mr-1" />
                                  Session {item.sessionNumber}
                                  {item.type !== 'Class' && (
                                    <span className={cn(
                                      "ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                      item.type === 'Quiz' ? "bg-yellow-100 text-yellow-700" :
                                      item.type === 'MidTerm' ? "bg-orange-100 text-orange-700" :
                                      "bg-rose-100 text-rose-700"
                                    )}>
                                      {item.type}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function AttendanceTab({ attendance }: { attendance: AttendanceRecord }) {
  const stats = useMemo(() => {
    const totalClasses = 155;
    const attended = Object.values(attendance).filter(v => v === 'present').length;
    const absent = Object.values(attendance).filter(v => v === 'absent').length;
    const totalMarked = attended + absent;
    const remaining = totalClasses - attended;
    const maxMissed = 31;
    
    // Subject wise
    const subjectStats = COURSES.map(course => {
      const courseClasses = SCHEDULE.filter(s => s.courseId === course.id);
      const courseAttended = courseClasses.filter(s => attendance[s.id] === 'present').length;
      const courseAbsent = courseClasses.filter(s => attendance[s.id] === 'absent').length;
      const courseMarked = courseAttended + courseAbsent;
      
      // Calculate total classes for this course based on credits
      const totalCourseClasses = course.credits * 5; 
      const percentage = courseMarked > 0 ? (courseAttended / courseMarked) * 100 : 0;
      const missed = courseAbsent;
      const maxMissable = Math.floor(totalCourseClasses * 0.2); // 20% limit
      
      return {
        ...course,
        attended: courseAttended,
        absent: courseAbsent,
        total: totalCourseClasses,
        percentage,
        missed,
        maxMissable,
        warning: missed > maxMissable
      };
    });

    const overallPercentage = totalMarked > 0 ? (attended / totalMarked) * 100 : 0;

    return {
      attended,
      absent,
      totalMarked,
      total: totalClasses,
      remaining,
      maxMissed,
      subjectStats,
      overallPercentage
    };
  }, [attendance]);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <p className="text-slate-500 mt-1">Target: 80% attendance. Warning if missed &gt; 20%.</p>
      </header>

      {/* Summary */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="88" fill="none" stroke="#F1F5F9" strokeWidth="12" />
            <circle 
              cx="96" cy="96" r="88" fill="none" stroke="#6366F1" strokeWidth="12" 
              strokeDasharray={552.9} 
              strokeDashoffset={552.9 * (1 - stats.overallPercentage / 100)} 
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-black text-slate-900">{Math.round(stats.overallPercentage)}%</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall</div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-6 w-full">
          <div>
            <div className="text-sm font-medium text-slate-500">Attended</div>
            <div className="text-2xl font-bold text-slate-900">{stats.attended} <span className="text-sm font-normal text-slate-400">/ {stats.totalMarked} marked</span></div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Absent</div>
            <div className="text-2xl font-bold text-rose-600">{stats.absent}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Max Missable</div>
            <div className="text-2xl font-bold text-slate-900">{stats.maxMissed}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Status</div>
            <div className={cn(
              "text-lg font-bold flex items-center gap-1.5",
              stats.overallPercentage >= 80 ? "text-emerald-600" : "text-rose-600"
            )}>
              {stats.overallPercentage >= 80 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {stats.overallPercentage >= 80 ? "Safe" : "Warning"}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Wise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.subjectStats.map(course => (
          <div key={course.id} className={cn(
            "bg-white p-6 rounded-2xl shadow-sm border transition-colors",
            course.warning ? "border-rose-200 bg-rose-50/10" : "border-slate-200"
          )}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-900">{course.name}</h4>
                <p className="text-xs text-slate-500">{course.professor}</p>
              </div>
              <div className={cn(
                "text-lg font-black",
                course.percentage >= 85 ? "text-emerald-500" :
                course.percentage >= 80 ? "text-amber-500" : "text-rose-500"
              )}>
                {Math.round(course.percentage)}%
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  course.percentage >= 85 ? "bg-emerald-500" :
                  course.percentage >= 80 ? "bg-amber-500" : "bg-rose-500"
                )} 
                style={{ width: `${Math.min(100, course.percentage)}%` }} 
              />
            </div>
            <div className="text-xs text-slate-500 flex justify-between">
              <span>{course.attended} P / {course.absent} A</span>
              <span className={cn(course.warning ? "text-rose-600 font-bold" : "")}>
                Missed: {course.missed} (Max: {course.maxMissable})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressTab({ progress, setProgress }: { progress: ProgressRecord, setProgress: React.Dispatch<React.SetStateAction<ProgressRecord>> }) {
  const updateScore = (courseId: string, component: string, score: string) => {
    const val = parseFloat(score) || 0;
    setProgress(prev => ({
      ...prev,
      [courseId]: {
        ...(prev[courseId] || {}),
        [component]: val
      }
    }));
  };

  const calculateTotal = (course: Course) => {
    const scores = progress[course.id] || {};
    return course.evaluation.reduce((acc, comp) => {
      const score = scores[comp.component] || 0;
      return acc + (score * comp.weightage / 100);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Academic Progress</h2>
        <p className="text-slate-500 mt-1">Input your scores to calculate weighted totals.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COURSES.map(course => (
          <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{course.name}</h3>
              <div className="text-xl font-black text-indigo-600">{calculateTotal(course).toFixed(1)}</div>
            </div>
            <div className="p-6 space-y-4">
              {course.evaluation.map((comp, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {comp.component} ({comp.weightage}%)
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={progress[course.id]?.[comp.component] || ''}
                      onChange={(e) => updateScore(course.id, comp.component, e.target.value)}
                      placeholder="Score (0-100)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesTab({ notes, setNotes }: { notes: Note[], setNotes: React.Dispatch<React.SetStateAction<Note[]>> }) {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      courseId,
      content,
      priority,
      createdAt: Date.now()
    };

    setNotes([newNote, ...notes]);
    setTitle('');
    setCourseId('');
    setContent('');
    setPriority('normal');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Study Notes</h2>
        <p className="text-slate-500 mt-1">Keep track of important concepts and reminders.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <form onSubmit={addNote} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 sticky top-8">
            <h3 className="font-bold text-lg mb-2">New Note</h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Title</label>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Note title..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Course</label>
              <select 
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">General</option>
                {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
              <div className="flex gap-2">
                {(['normal', 'important', 'urgent'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                      priority === p 
                        ? p === 'urgent' ? "bg-rose-500 border-rose-500 text-white" :
                          p === 'important' ? "bg-amber-500 border-amber-500 text-white" :
                          "bg-indigo-500 border-indigo-500 text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Content</label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Write your note here..."
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Note
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {notes.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center text-center">
              <StickyNote size={48} className="text-slate-200 mb-4" />
              <h3 className="font-bold text-slate-400">No notes yet</h3>
              <p className="text-sm text-slate-400 max-w-xs mt-1">Start adding notes for your courses to keep track of important information.</p>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        note.priority === 'urgent' ? "bg-rose-500" :
                        note.priority === 'important' ? "bg-amber-500" : "bg-indigo-400"
                      )} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {COURSES.find(c => c.id === note.courseId)?.name || 'General'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg">{note.title}</h4>
                  </div>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{note.content}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-slate-400 font-medium">
                  Added on {format(note.createdAt, 'MMM do, yyyy • h:mm a')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function VeoTab() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setGenerating(true);
    setVideoUrl(null);
    try {
      const url = await generateVideoFromImage(image, prompt, aspectRatio);
      setVideoUrl(url);
    } catch (error) {
      alert("Failed to generate video. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Veo Video Generation</h2>
        <p className="text-slate-500 mt-1">Animate your study materials or campus photos using AI.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4">1. Upload Image</h3>
            <div 
              className={cn(
                "relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all",
                image ? "border-indigo-500 bg-indigo-50/30" : "border-slate-300 hover:border-indigo-400"
              )}
            >
              {image ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                  <img src={image} alt="Upload" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={48} className="text-slate-300 mb-4" />
                  <p className="text-sm text-slate-500 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg">2. Configuration</h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Animation Prompt</label>
              <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Describe how you want the image to move..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Aspect Ratio</label>
              <div className="flex gap-2">
                {(["16:9", "9:16"] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-bold border transition-all",
                      aspectRatio === ratio ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-500"
                    )}
                  >
                    {ratio === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={!image || generating}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {generating ? <Loader2 className="animate-spin" size={20} /> : <Film size={20} />}
              {generating ? 'Generating Video...' : 'Generate Video'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
          <h3 className="font-bold text-lg mb-4">Result</h3>
          <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full rounded-xl shadow-lg"
                autoPlay
                loop
              />
            ) : generating ? (
              <div className="text-center space-y-4">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Creating your masterpiece</p>
                  <p className="text-sm text-slate-500 mt-1">This usually takes about 1-2 minutes...</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <Film size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">Your generated video will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

