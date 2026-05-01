import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

/**
 * useAntiCheat
 *
 * Enforces exam integrity rules and logs all violations to the backend.
 *
 * @param {object}   options
 * @param {string}   options.submissionId  – active submission ID (null while loading)
 * @param {string}   options.examId        – exam ID for socket events
 * @param {boolean}  options.enabled       – activate only when exam is actually running
 * @param {function} options.onWarning     – cb(message) shown to student
 * @param {object}   options.socket        – socket.io client instance
 */
export default function useAntiCheat({
  submissionId,
  examId,
  enabled = false,
  onWarning,
  socket,
}) {
  const tabSwitchCount = useRef(0);
  const inactivityTimer = useRef(null);
  const INACTIVITY_LIMIT_MS = 120_000; // 2 minutes of no mouse/keyboard

  // ── Core log helper ──────────────────────────────────────────────────────────
  const logEvent = useCallback(
    async (eventType, details = {}) => {
      if (!submissionId) return;
      try {
        await api.post(`/submissions/${submissionId}/proctor-log`, {
          eventType,
          details,
        });
      } catch {
        // Never block the student — proctoring is background work
      }

      // Also forward over socket for real-time teacher view
      if (socket) {
        socket.emit('proctor_event', { examId, eventType, details });
      }
    },
    [submissionId, examId, socket]
  );

  const warn = useCallback(
    (msg) => {
      if (onWarning) onWarning(msg);
    },
    [onWarning]
  );

  // ── 1. Fullscreen enforcement ────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const requestFS = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        toast.warn('Please enable fullscreen for the exam.', { toastId: 'fs-warn' });
      }
    };
    requestFS();

    const onFSChange = () => {
      if (!document.fullscreenElement) {
        logEvent('fullscreen_exit');
        warn('⚠️ You exited fullscreen. Please return to fullscreen immediately.');
        // Try to re-enter fullscreen automatically
        setTimeout(requestFS, 800);
      }
    };

    document.addEventListener('fullscreenchange', onFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFSChange);
      // Exit fullscreen on unmount (exam ended)
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [enabled, logEvent, warn]);

  // ── 2. Tab-switch / visibility detection ────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;
        logEvent('tab_switch', { count: tabSwitchCount.current });

        const count = tabSwitchCount.current;
        if (count >= 5) {
          warn(`🚨 Critical: ${count} tab switches detected. Your exam may be invalidated.`);
        } else if (count >= 3) {
          warn(`⚠️ Warning: ${count} tab switches logged. Further violations may disqualify you.`);
        } else {
          warn('Tab switch detected! Stay on the exam page.');
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [enabled, logEvent, warn]);

  // ── 3. Copy / Paste / Cut prevention ────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const block = (eventType) => (e) => {
      e.preventDefault();
      logEvent(eventType);
      toast.warn(
        eventType === 'copy_attempt'  ? 'Copying is not allowed during the exam.' :
        eventType === 'paste_attempt' ? 'Pasting is not allowed during the exam.' :
        'Cutting is not allowed during the exam.',
        { toastId: eventType }
      );
    };

    const onCopy  = block('copy_attempt');
    const onPaste = block('paste_attempt');
    const onCut   = block('copy_attempt'); // treat cut same as copy

    document.addEventListener('copy',  onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('cut',   onCut);
    return () => {
      document.removeEventListener('copy',  onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('cut',   onCut);
    };
  }, [enabled, logEvent]);

  // ── 4. Right-click disable ───────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const onContextMenu = (e) => {
      e.preventDefault();
      logEvent('right_click');
    };

    document.addEventListener('contextmenu', onContextMenu);
    return () => document.removeEventListener('contextmenu', onContextMenu);
  }, [enabled, logEvent]);

  // ── 5. Keyboard shortcut blocks (PrintScreen, F12, Ctrl+Shift+I/J/C/U) ──────
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e) => {
      const blocked =
        e.key === 'PrintScreen' ||
        (e.key === 'F12') ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === 'U');

      if (blocked) {
        e.preventDefault();
        logEvent('devtools_open', { key: e.key });
        toast.warn('Developer tools are not allowed during the exam.', { toastId: 'devtools' });
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled, logEvent]);

  // ── 6. Window / browser-resize detection ────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const initialW = window.outerWidth;
    const initialH = window.outerHeight;

    const onResize = () => {
      const dw = Math.abs(window.outerWidth  - initialW);
      const dh = Math.abs(window.outerHeight - initialH);
      if (dw > 150 || dh > 150) {
        logEvent('browser_resize', {
          from: { w: initialW, h: initialH },
          to:   { w: window.outerWidth, h: window.outerHeight },
        });
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [enabled, logEvent]);

  // ── 7. Inactivity detection ──────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const resetTimer = () => {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        logEvent('inactivity');
        warn('⚠️ Inactivity detected. Please continue your exam.');
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((ev) => document.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer(); // start the first timer

    return () => {
      clearTimeout(inactivityTimer.current);
      events.forEach((ev) => document.removeEventListener(ev, resetTimer));
    };
  }, [enabled, logEvent, warn]); // eslint-disable-line

  // ── 8. Text selection disable (CSS) ─────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const style = document.createElement('style');
    style.id = 'anticheat-style';
    style.textContent = `
      body { -webkit-user-select: none !important; user-select: none !important; }
      textarea, input { -webkit-user-select: text !important; user-select: text !important; }
    `;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById('anticheat-style');
      if (el) el.remove();
    };
  }, [enabled]);

  return { tabSwitchCount: tabSwitchCount.current };
}
