export default function Logo({ inline = false, className = '' }: { inline?: boolean; className?: string }) {
  return (
    <span
      className={`brand-logo ${inline ? 'brand-inline' : ''} ${className}`.trim()}
      aria-label="RedeemGuide"
      title="RedeemGuide"
    >
      <span className="brand-R">R</span>
      <span className="brand-edefault">edeem</span>
      <span className="brand-G">G</span>
      <span className="brand-u">u</span>
      <span className="brand-i">i</span>
      <span className="brand-d">d</span>
      <span className="brand-e2">e</span>
    </span>
  )
}
