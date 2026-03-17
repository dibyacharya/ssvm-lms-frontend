import React, { useEffect, useState } from 'react';
import { getLockStatus } from '../../services/fee.service';
import FeeLockScreen from './FeeLockScreen';

const FeeGateWrapper = ({ children }) => {
  const [lockState, setLockState] = useState({
    checked: false,
    locked: false,
    lockedPeriods: [],
  });

  useEffect(() => {
    // Check session cache first
    const cached = sessionStorage.getItem('fee_lock_status');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Cache valid for 5 minutes
        if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          setLockState({
            checked: true,
            locked: parsed.locked,
            lockedPeriods: parsed.lockedPeriods || [],
          });
          return;
        }
      } catch {
        // ignore parse errors
      }
    }

    const checkLock = async () => {
      try {
        const data = await getLockStatus();
        const result = {
          locked: data.locked,
          lockedPeriods: data.lockedPeriods || [],
          timestamp: Date.now(),
        };
        sessionStorage.setItem('fee_lock_status', JSON.stringify(result));
        setLockState({
          checked: true,
          locked: data.locked,
          lockedPeriods: data.lockedPeriods || [],
        });
      } catch (err) {
        // If API fails, don't lock (fail open)
        console.error('Failed to check fee lock status:', err);
        setLockState({ checked: true, locked: false, lockedPeriods: [] });
      }
    };

    checkLock();
  }, []);

  if (!lockState.checked) {
    // Loading skeleton
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (lockState.locked) {
    return <FeeLockScreen lockedPeriods={lockState.lockedPeriods} />;
  }

  return children;
};

export default FeeGateWrapper;
