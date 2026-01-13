import { useState, useEffect } from 'react';
import {
  Bell,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Calendar,
  Plus,
  Trash2,
} from 'lucide-react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface NotificationSchedule {
  perDay: number;
  days: string[];
  times: string[];
}

const DAYS_OF_WEEK = [
  { key: 'Mon', label: 'Monday' },
  { key: 'Tue', label: 'Tuesday' },
  { key: 'Wed', label: 'Wednesday' },
  { key: 'Thu', label: 'Thursday' },
  { key: 'Fri', label: 'Friday' },
  { key: 'Sat', label: 'Saturday' },
  { key: 'Sun', label: 'Sunday' },
];

const DEFAULT_SCHEDULE: NotificationSchedule = {
  perDay: 1,
  days: ['Mon', 'Wed', 'Fri'],
  times: ['09:00'],
};

export default function NotificationSettings() {
  const [schedule, setSchedule] = useState<NotificationSchedule>(DEFAULT_SCHEDULE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load schedule from Firebase
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const docRef = doc(db, 'adminSettings', 'notificationSchedule');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSchedule({
            perDay: data.perDay || 1,
            days: data.days || DEFAULT_SCHEDULE.days,
            times: data.times || DEFAULT_SCHEDULE.times,
          });
        }
      } catch (error) {
        console.error('Error loading schedule:', error);
        setStatus({ type: 'error', message: 'Failed to load notification settings' });
      } finally {
        setIsLoading(false);
      }
    };
    loadSchedule();
  }, []);

  // Save schedule to Firebase
  const handleSave = async () => {
    // Validate
    if (schedule.days.length === 0) {
      setStatus({ type: 'error', message: 'Please select at least one day' });
      return;
    }
    if (schedule.times.length === 0) {
      setStatus({ type: 'error', message: 'Please add at least one notification time' });
      return;
    }
    if (schedule.times.length !== schedule.perDay) {
      setStatus({ type: 'error', message: `Please set exactly ${schedule.perDay} notification time(s)` });
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      const docRef = doc(db, 'adminSettings', 'notificationSchedule');
      await setDoc(docRef, {
        ...schedule,
        updatedAt: Timestamp.now(),
      });
      setStatus({ type: 'success', message: 'Notification schedule saved!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to save schedule' });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle day selection
  const toggleDay = (day: string) => {
    if (schedule.days.includes(day)) {
      setSchedule({ ...schedule, days: schedule.days.filter((d) => d !== day) });
    } else {
      setSchedule({ ...schedule, days: [...schedule.days, day] });
    }
  };

  // Update perDay and adjust times array
  const updatePerDay = (value: number) => {
    const newTimes = [...schedule.times];
    while (newTimes.length < value) {
      // Add default times
      const lastTime = newTimes[newTimes.length - 1] || '09:00';
      const [hours] = lastTime.split(':').map(Number);
      const newHour = Math.min(hours + 4, 21); // Add 4 hours, max 9pm
      newTimes.push(`${String(newHour).padStart(2, '0')}:00`);
    }
    while (newTimes.length > value) {
      newTimes.pop();
    }
    setSchedule({ ...schedule, perDay: value, times: newTimes });
  };

  // Update a time
  const updateTime = (index: number, value: string) => {
    const newTimes = [...schedule.times];
    newTimes[index] = value;
    setSchedule({ ...schedule, times: newTimes });
  };

  // Calculate total notifications
  const totalPerWeek = schedule.days.length * schedule.perDay;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          Notification Schedule
        </h1>
        <p className="text-gray-600 mt-1">
          Configure when users receive notifications
        </p>
      </div>

      {/* Status Message */}
      {status && (
        <div
          className={`px-4 py-3 rounded-lg flex items-center gap-2 ${
            status.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          {status.message}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p>
              These settings control when notifications are sent to all users who have
              notifications enabled. The mobile app reads this schedule to deliver
              snippets at the configured times.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Notifications Per Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Notifications Per Day
          </label>
          <select
            value={schedule.perDay}
            onChange={(e) => updatePerDay(Number(e.target.value))}
            className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value={1}>1 notification</option>
            <option value={2}>2 notifications</option>
            <option value={3}>3 notifications</option>
          </select>
        </div>

        {/* Days of Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Active Days
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleDay(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  schedule.days.includes(key)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {schedule.days.length} day{schedule.days.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Notification Times */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Times
          </label>
          <div className="space-y-2">
            {schedule.times.map((time, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-24">
                  {index === 0 ? 'Morning' : index === 1 ? 'Afternoon' : 'Evening'}:
                </span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(index, e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="text-xs text-gray-400">
                  {formatTime12(time)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Schedule Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">{totalPerWeek}</span> notifications per week
            </p>
            <p>
              <span className="font-medium">{schedule.perDay}</span> notification{schedule.perDay !== 1 ? 's' : ''} per day on{' '}
              <span className="font-medium">
                {schedule.days.length > 0 ? schedule.days.join(', ') : 'no days selected'}
              </span>
            </p>
            <p>
              Times:{' '}
              <span className="font-medium">
                {schedule.times.map(formatTime12).join(', ') || 'none set'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Schedule
          </>
        )}
      </button>
    </div>
  );
}

// Helper to format 24h to 12h time
function formatTime12(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const h = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${h}:${String(minutes).padStart(2, '0')} ${ampm}`;
}
