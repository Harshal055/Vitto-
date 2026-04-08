import { getReasonInfo, getSeverityIcon } from '../../utils/formatters';

/**
 * Displays a single reason code with severity indicator.
 */
export default function ReasonCodeCard({ code, index }) {
  const info = getReasonInfo(code);
  const icon = getSeverityIcon(info.severity);

  return (
    <div
      className="reason-code-card"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`reason-icon ${info.severity}`}>
        {icon}
      </div>
      <div>
        <div className="reason-code-name">{info.code}</div>
        <div className="reason-code-message">{info.message}</div>
      </div>
    </div>
  );
}
