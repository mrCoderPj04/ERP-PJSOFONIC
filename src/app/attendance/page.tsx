'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Square,
  Coffee,
  CalendarDays,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

export default function AttendancePage() {
  const [isWorking, setIsWorking] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  useEffect(() => {
    let timer: any = null;
    if (isWorking && !onBreak) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isWorking, onBreak]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleWork = () => {
    if (!isWorking) {
      setIsWorking(true);
      setOnBreak(false);
    } else {
      // Clock Out
      const newLog = {
        id: `att-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        clockIn: new Date(Date.now() - seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clockOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        totalHours: `${(seconds / 3600).toFixed(2)} hrs`,
        status: 'PRESENT',
      };
      setAttendanceLogs([newLog, ...attendanceLogs]);
      setIsWorking(false);
      setOnBreak(false);
      setSeconds(0);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase">
              Time & Attendance Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-400" /> Attendance & Working Hours Timer
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track live working hours, breaks, task execution time, overtime and daily timesheet submissions.
          </p>
        </div>
      </div>

      {/* Live Timer Control Card */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 border border-gray-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Clock className={`w-10 h-10 ${isWorking && !onBreak ? 'animate-pulse text-indigo-400' : 'text-gray-500'}`} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Active Timer</span>
            <h2 className="text-4xl font-black text-white font-mono tracking-wider mt-1">{formatTimer(seconds)}</h2>
            <p className="text-xs text-gray-400 mt-1">
              Status:{' '}
              {onBreak ? (
                <strong className="text-amber-400">ON BREAK</strong>
              ) : isWorking ? (
                <strong className="text-emerald-400">WORKING (ACTIVE)</strong>
              ) : (
                <strong className="text-gray-500">CLOCKED OUT</strong>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isWorking && (
            <button
              onClick={() => setOnBreak(!onBreak)}
              className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                onBreak
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:text-white'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>{onBreak ? 'Resume Work' : 'Take Break'}</span>
            </button>
          )}

          <button
            onClick={handleToggleWork}
            className={`px-6 py-3.5 rounded-xl text-white font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 w-full md:w-auto ${
              isWorking
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {isWorking ? (
              <>
                <Square className="w-4 h-4" />
                <span>Clock Out & Log Timesheet</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Clock In Start Work</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Attendance Logs List or Empty State */}
      {attendanceLogs.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No Attendance Logs Created Today"
          description="Clock in to start your work timer. Once you clock out, your working hours, break durations, and timesheets will be automatically generated."
          actionLabel="Clock In Work Timer"
          onAction={handleToggleWork}
        />
      ) : (
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Logged Attendance History</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Clock In Time</th>
                <th className="py-3 px-6">Clock Out Time</th>
                <th className="py-3 px-6">Total Working Hours</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {attendanceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-900/40">
                  <td className="py-3.5 px-6 font-bold text-white">{log.date}</td>
                  <td className="py-3.5 px-6 text-gray-300">{log.clockIn}</td>
                  <td className="py-3.5 px-6 text-gray-300">{log.clockOut}</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-indigo-400">{log.totalHours}</td>
                  <td className="py-3.5 px-6">
                    <Badge variant="success">{log.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
