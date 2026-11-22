/** The boardroom itself: a glowing table in perspective, chairs, light from tall windows. */
export function BoardroomEnvironment() {
  const chairs = Array.from({ length: 12 }, (_, i) => {
    const a = Math.PI + (i / 11) * Math.PI;
    return { x: 960 + Math.cos(a) * 1000, y: 1160 + Math.sin(a) * 175 };
  });
  return (
    <div className="br-env" aria-hidden="true">
      <div className="br-windows">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="br-window" />
        ))}
      </div>
      <svg className="br-table" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <defs>
          <linearGradient id="br-edge" x1="0" x2="1">
            <stop offset="0" stopColor="#7657F6" stopOpacity="0" />
            <stop offset="0.3" stopColor="#7657F6" />
            <stop offset="0.5" stopColor="var(--brand-ims-blue)" />
            <stop offset="0.7" stopColor="#22B9F2" />
            <stop offset="1" stopColor="#22B9F2" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="br-top" cx="0.5" cy="0.3" r="0.7">
            <stop offset="0" stopColor="#1d2550" stopOpacity="0.9" />
            <stop offset="1" stopColor="#080D1B" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        {chairs.map((c, i) => (
          <rect key={i} x={c.x - 30} y={c.y - 58} width="60" height="38" rx="11" className="br-chair" />
        ))}
        <ellipse cx="960" cy="1160" rx="920" ry="165" fill="url(#br-top)" />
        <ellipse cx="960" cy="1160" rx="920" ry="165" fill="none" stroke="url(#br-edge)" strokeWidth="3" />
      </svg>
    </div>
  );
}
