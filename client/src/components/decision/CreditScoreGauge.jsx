import { getScoreColor } from '../../utils/formatters';

/**
 * Animated SVG circular gauge for credit score visualization.
 */
export default function CreditScoreGauge({ score, maxScore = 750 }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(score / maxScore, 1);
  const dashoffset = circumference * (1 - percentage);
  const color = getScoreColor(score);

  return (
    <div className="score-gauge" style={{ '--gauge-color': color }}>
      <svg viewBox="0 0 200 200">
        <circle
          className="track"
          cx="100"
          cy="100"
          r={radius}
        />
        <circle
          className="progress"
          cx="100"
          cy="100"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ animation: 'scoreReveal 1.5s ease forwards' }}
        />
      </svg>
      <div className="score-value">
        <div className="score-number" style={{ color }}>{score}</div>
        <div className="score-max">/ {maxScore}</div>
      </div>
    </div>
  );
}
