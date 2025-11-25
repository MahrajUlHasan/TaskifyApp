export interface PomodoroSession {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  totalSessions: number;
}

export interface PomodoroSchedule {
  sessions: {
    sessionNumber: number;
    type: 'work' | 'break' | 'longBreak';
    duration: number; // in minutes
  }[];
  totalDuration: number; // in minutes
  estimatedCompletionTime: Date;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentSessionIndex: number;
  remainingSeconds: number;
  currentType: 'work' | 'break' | 'longBreak';
}

/**
 * Calculate Pomodoro schedule based on estimated completion time
 * Standard Pomodoro: 25 min work, 5 min break, 15 min long break after 4 sessions
 */
export function calculatePomodoroSchedule(
  estimatedMinutes: number,
  workDuration: number = 25,
  breakDuration: number = 5,
  longBreakDuration: number = 15,
  sessionsBeforeLongBreak: number = 4
): PomodoroSchedule {
  const sessions: PomodoroSchedule['sessions'] = [];
  
  // Calculate number of work sessions needed
  const numberOfWorkSessions = Math.ceil(estimatedMinutes / workDuration);
  
  let totalDuration = 0;
  
  for (let i = 0; i < numberOfWorkSessions; i++) {
    const sessionNumber = i + 1;
    
    // Add work session
    sessions.push({
      sessionNumber,
      type: 'work',
      duration: workDuration,
    });
    totalDuration += workDuration;
    
    // Add break after work session (except for the last session)
    if (i < numberOfWorkSessions - 1) {
      const isLongBreak = sessionNumber % sessionsBeforeLongBreak === 0;
      const breakTime = isLongBreak ? longBreakDuration : breakDuration;
      
      sessions.push({
        sessionNumber,
        type: isLongBreak ? 'longBreak' : 'break',
        duration: breakTime,
      });
      totalDuration += breakTime;
    }
  }
  
  const estimatedCompletionTime = new Date();
  estimatedCompletionTime.setMinutes(estimatedCompletionTime.getMinutes() + totalDuration);
  
  return {
    sessions,
    totalDuration,
    estimatedCompletionTime,
  };
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get session type display name
 */
export function getSessionTypeName(type: 'work' | 'break' | 'longBreak'): string {
  switch (type) {
    case 'work':
      return 'Focus Time';
    case 'break':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
  }
}

/**
 * Get session type color
 */
export function getSessionTypeColor(type: 'work' | 'break' | 'longBreak'): string {
  switch (type) {
    case 'work':
      return '#FF6B6B'; // Red for focus
    case 'break':
      return '#4ECDC4'; // Teal for short break
    case 'longBreak':
      return '#95E1D3'; // Light teal for long break
  }
}

/**
 * Get motivational message based on session type
 */
export function getMotivationalMessage(type: 'work' | 'break' | 'longBreak'): string {
  switch (type) {
    case 'work':
      return 'Stay focused! You can do this! 💪';
    case 'break':
      return 'Take a short break. Stretch and relax! ☕';
    case 'longBreak':
      return 'Great work! Take a longer break. You earned it! 🎉';
  }
}

