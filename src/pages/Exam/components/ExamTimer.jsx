import React, { useState, useEffect, useCallback } from 'react';
import { FaClock } from 'react-icons/fa';

const ExamTimer = ({ endsAt, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [warned5, setWarned5] = useState(false);
  const [warned1, setWarned1] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    const diff = Math.max(0, Math.floor((new Date(endsAt) - new Date()) / 1000));
    return diff;
  }, [endsAt]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, onTimeUp]);

  // Warnings
  useEffect(() => {
    if (timeLeft <= 300 && timeLeft > 0 && !warned5) {
      setWarned5(true);
    }
    if (timeLeft <= 60 && timeLeft > 0 && !warned1) {
      setWarned1(true);
    }
  }, [timeLeft, warned5, warned1]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formatNum = (n) => String(n).padStart(2, '0');

  const isUrgent = timeLeft <= 60;
  const isWarning = timeLeft <= 300 && !isUrgent;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold transition-all ${
        isUrgent
          ? 'bg-red-100 text-red-700 animate-pulse'
          : isWarning
          ? 'bg-amber-100 text-amber-700'
          : 'bg-gray-100 text-gray-700'
      }`}
    >
      <FaClock className="text-xs" />
      <span>
        {hours > 0 && `${formatNum(hours)}:`}
        {formatNum(minutes)}:{formatNum(seconds)}
      </span>
    </div>
  );
};

export default ExamTimer;
