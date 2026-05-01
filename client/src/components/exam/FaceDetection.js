import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import api from '../../utils/api';

const DETECT_INTERVAL_MS = 3000;
const NO_FACE_THRESHOLD = 2;   // consecutive misses before logging

export default function FaceDetection({ submissionId, enabled, socket, examId }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef  = useRef(null);
  const timerRef  = useRef(null);
  const streamRef = useRef(null);
  const missesRef = useRef(0);

  const [status, setStatus] = useState('loading'); // loading | active | denied | error

  // ── Log event to backend (silent) ─────────────────────
  const logEvent = useCallback(async (eventType, details = {}) => {
    try {
      await api.post(`/submissions/${submissionId}/proctor-log`, { eventType, details });
      if (socket) {
        socket.emit('proctor_event', { examId, submissionId, eventType, details, timestamp: new Date() });
      }
    } catch {
      // never block student
    }
  }, [submissionId, socket, examId]);

  // ── Load model & start webcam ─────────────────────────
  useEffect(() => {
    if (!enabled || !submissionId) return;
    let cancelled = false;

    async function init() {
      try {
        await tf.ready();
        modelRef.current = await blazeface.load();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });

        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus('active');
      } catch (err) {
        if (cancelled) return;
        if (err.name === 'NotAllowedError') {
          setStatus('denied');
          logEvent('face_not_detected', { reason: 'camera_denied' });
        } else {
          setStatus('error');
          console.warn('[FaceDetection] Init error:', err.message);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearInterval(timerRef.current);
    };
  }, [enabled, submissionId, logEvent]);

  // ── Detection loop ────────────────────────────────────
  useEffect(() => {
    if (status !== 'active') return;

    timerRef.current = setInterval(async () => {
      if (!modelRef.current || !videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const predictions = await modelRef.current.estimateFaces(videoRef.current, false);
        const count = predictions.length;

        if (count === 0) {
          missesRef.current++;
          if (missesRef.current >= NO_FACE_THRESHOLD) {
            logEvent('face_not_detected', { consecutiveMisses: missesRef.current });
          }
        } else {
          missesRef.current = 0;
          if (count > 1) {
            logEvent('multiple_faces', { count });
          }
        }

        // Draw bounding boxes on canvas
        drawBoxes(predictions);
      } catch {
        // TF errors are transient — ignore
      }
    }, DETECT_INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, [status, logEvent]);

  function drawBoxes(predictions) {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach((p) => {
      const [x, y] = p.topLeft;
      const [x2, y2] = p.bottomRight;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, x2 - x, y2 - y);
    });
  }

  if (!enabled) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      width: '160px',
      zIndex: 1000,
      borderRadius: '10px',
      overflow: 'hidden',
      border: '2px solid #334155',
      background: '#0f172a',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      {/* Status bar */}
      <div style={{
        padding: '4px 8px',
        fontSize: '11px',
        background: status === 'active' ? '#166534' : status === 'denied' ? '#7f1d1d' : '#1e293b',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: status === 'active' ? '#22c55e' : '#ef4444',
          display: 'inline-block',
        }} />
        {status === 'active'  ? 'Camera Active' :
         status === 'denied'  ? 'Camera Denied' :
         status === 'loading' ? 'Loading…'      : 'Camera Error'}
      </div>

      {/* Video feed */}
      <div style={{ position: 'relative', height: '120px', background: '#000' }}>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            transform: 'scaleX(-1)',
          }}
        />
        {status === 'denied' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', color: '#fca5a5', textAlign: 'center', padding: '8px',
          }}>
            Camera access denied. This will be flagged.
          </div>
        )}
      </div>
    </div>
  );
}
