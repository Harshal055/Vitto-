import { useState, useEffect, useRef, useCallback } from 'react';
import { getDecision } from '../services/api';

/**
 * Custom hook to poll for decision status.
 * Polls every 2 seconds until status is COMPLETED or max attempts reached.
 */
export function useDecisionPolling(decisionId) {
  const [decision, setDecision] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const attemptsRef = useRef(0);

  const startPolling = useCallback(() => {
    if (!decisionId) return;

    setIsPolling(true);
    setError(null);
    attemptsRef.current = 0;

    intervalRef.current = setInterval(async () => {
      try {
        attemptsRef.current += 1;
        const result = await getDecision(decisionId);

        if (result.data.status === 'COMPLETED') {
          setDecision(result.data);
          setIsPolling(false);
          clearInterval(intervalRef.current);
        }

        // Safety: stop after 30 attempts (60 seconds)
        if (attemptsRef.current >= 30) {
          setError({
            code: 'TIMEOUT',
            message: 'Decision processing timed out. Please try again.',
          });
          setIsPolling(false);
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        setError(err);
        setIsPolling(false);
        clearInterval(intervalRef.current);
      }
    }, 2000);
  }, [decisionId]);

  // Start polling when decisionId is set
  useEffect(() => {
    if (decisionId) {
      startPolling();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [decisionId, startPolling]);

  return { decision, isPolling, error };
}
