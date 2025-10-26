import React, { useEffect, useRef, useState } from 'react';
import './WhoAreYou.css';
import '../Base.css';
import { useNavigate } from 'react-router-dom';

const ELECTRICITY_DURATION = 2000; 

const WhoAreYou = () => {
  const topPathRef = useRef(null);
  const bottomPathRef = useRef(null);
  const [topSparkPos, setTopSparkPos] = useState({ x: 0, y: 0 });
  const [bottomSparkPos, setBottomSparkPos] = useState({ x: 0, y: 0 });

  // Mobile animation refs and state
  const mobileTopPathRef = useRef(null);
  const mobileBottomPathRef = useRef(null);
  const [mobileTopSparkPos, setMobileTopSparkPos] = useState({ x: 0, y: 0 });
  const [mobileBottomSparkPos, setMobileBottomSparkPos] = useState({ x: 0, y: 0 });

  const [borderAnim, setBorderAnim] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let frame;
    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) % ELECTRICITY_DURATION;
      const progress = elapsed / ELECTRICITY_DURATION;
      
      // Animate desktop paths
      if (topPathRef.current) {
        const path = topPathRef.current;
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(progress * len);
        setTopSparkPos({ x: pt.x, y: pt.y });
      }
      if (bottomPathRef.current) {
        const path = bottomPathRef.current;
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(progress * len);
        setBottomSparkPos({ x: pt.x, y: pt.y });
      }

      // Animate mobile paths
      if (mobileTopPathRef.current && mobileBottomPathRef.current) {
        const topPath = mobileTopPathRef.current;
        const bottomPath = mobileBottomPathRef.current;
        
        if (progress < 0.5) {
          // First half: both sparks travel from top to center
          const topLen = topPath.getTotalLength();
          const topProgress = progress * 2;
          const topPt = topPath.getPointAtLength(topProgress * topLen * 0.5);
          setMobileTopSparkPos({ x: topPt.x, y: topPt.y });
          setMobileBottomSparkPos({ x: topPt.x, y: topPt.y });
        } else {
          // Second half: sparks branch out from center
          const topLen = topPath.getTotalLength();
          const bottomLen = bottomPath.getTotalLength();
          const branchProgress = (progress - 0.5) * 2;
          
          const topPt = topPath.getPointAtLength(topLen * 0.5 + branchProgress * topLen * 0.5);
          const bottomPt = bottomPath.getPointAtLength(bottomLen * 0.5 + branchProgress * bottomLen * 0.5);
          
          setMobileTopSparkPos({ x: topPt.x, y: topPt.y });
          setMobileBottomSparkPos({ x: bottomPt.x, y: bottomPt.y });
        }
      }

      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBorderAnim(false);
      setTimeout(() => setBorderAnim(true), 10); // retrigger animation
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="whoareyou-container">
      <div className="diagram-wrapper">
        {/* Main question box with animated text */}
        <div className="main-question-box animated-text">
          Who Are You ?
        </div>
        {/* SVG for curved paths with animated lines using only base.css variables */}
        <svg className="connection-svg desktop-svg" viewBox="0 0 800 400">
          <defs>
            <linearGradient id="mainLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary-color)" />
              <stop offset="100%" stopColor="var(--accent-color)" />
            </linearGradient>
            <radialGradient id="sparkGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="1" />
              <stop offset="80%" stopColor="var(--primary-color)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Top curve */}
          <path 
            ref={topPathRef}
            className="animated-path top-path"
            d="M 260 200 Q 400 120 700 120" 
            stroke="url(#mainLineGradient)"
            strokeWidth="4"
            fill="none"
          />
          {/* Bottom curve */}
          <path 
            ref={bottomPathRef}
            className="animated-path bottom-path"
            d="M 260 200 Q 400 280 700 280" 
            stroke="url(#mainLineGradient)"
            strokeWidth="4"
            fill="none"
          />
          {/* Electricity sparks */}
          <circle
            className="electric-spark"
            cx={topSparkPos.x}
            cy={topSparkPos.y}
            r="12"
            fill="url(#sparkGradient)"
          />
          <circle
            className="electric-spark"
            cx={bottomSparkPos.x}
            cy={bottomSparkPos.y}
            r="12"
            fill="url(#sparkGradient)"
          />
        </svg>
        {/* Mobile-specific SVG for a clean, branching connector */}
        <svg className="connection-svg mobile-svg" viewBox="0 0 300 150" preserveAspectRatio="none">
           <defs>
            <linearGradient id="mobileLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary-color)" />
              <stop offset="100%" stopColor="var(--accent-color)" />
            </linearGradient>
            <radialGradient id="mobileSparkGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="1" />
              <stop offset="80%" stopColor="var(--primary-color)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            ref={mobileTopPathRef}
            d="M 150 0 V 75 L 75 150"
            stroke="url(#mobileLineGradient)"
            strokeWidth="4"
            fill="none"
          />
          <path
            ref={mobileBottomPathRef}
            d="M 150 0 V 75 L 225 150"
            stroke="url(#mobileLineGradient)"
            strokeWidth="4"
            fill="none"
          />
          {/* Mobile Electricity sparks */}
          <circle
            className="electric-spark"
            cx={mobileTopSparkPos.x}
            cy={mobileTopSparkPos.y}
            r="8"
            fill="url(#mobileSparkGradient)"
          />
          <circle
            className="electric-spark"
            cx={mobileBottomSparkPos.x}
            cy={mobileBottomSparkPos.y}
            r="8"
            fill="url(#mobileSparkGradient)"
          />
        </svg>

        {/* Floating info boxes */}
        <div className="choices-container">
          <div
            className={`info-box creator-box${borderAnim ? ' border-animate' : ''}`}
            onClick={() => navigate('/login')}
            style={{ pointerEvents: 'auto' }}
          >
            <h3>Creator</h3>
          </div>
          <div
            className={`info-box brand-box${borderAnim ? ' border-animate' : ''}`}
            onClick={() => navigate('/brand-login')}
            style={{ pointerEvents: 'auto' }}
          >
            <h3>Brand</h3>
          </div>
        </div>
      </div>
      {/* Subtle animated background effect */}
      <div className="whoareyou-bg-effect"></div>
    </div>
  );
};

export default WhoAreYou;