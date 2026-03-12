export default function Loader({ size = 40 }: { size?: number }) {
  return (
    <div className="loading" style={{ width: size, height: size }}>
      <svg viewBox="0 0 50 50" width={size} height={size}>
        <polyline id="back" points="1 1 49 1 49 49 1 49 1 1" stroke="#ccdbd3" />
        <polyline id="front" points="1 1 49 1 49 49 1 49 1 1" />
      </svg>
    </div>
  )
}
