"use client";

interface RetroTVProps {
  children: React.ReactNode;
}

export default function RetroTV({ children }: RetroTVProps) {
  return (
    <div className="tv-cabinet">
      <div className="tv-body">
        {/* Left speaker */}
        <div className="tv-speaker-panel">
          <div className="tv-speaker-cloth">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="tv-speaker-bar" />
            ))}
          </div>
        </div>

        {/* Center: screen + controls */}
        <div className="tv-center">
          <div className="tv-screen-bezel">
            <div className="tv-screen">
              {children}
            </div>
          </div>
          {/* Control strip */}
          <div className="tv-control-strip">
            <div className="tv-knob-group">
              <div className="tv-knob tv-knob-lg">
                <div className="tv-knob-line" />
              </div>
              <span className="tv-label">CH</span>
            </div>
            <div className="tv-brand-badge">
              <span className="tv-brand-text">RETRO</span>
              <span className="tv-brand-sub">Solid State</span>
            </div>
            <div className="tv-knob-group">
              <div className="tv-knob tv-knob-lg">
                <div className="tv-knob-line" />
              </div>
              <span className="tv-label">VOL</span>
            </div>
            <div className="tv-knob-group">
              <div className="tv-knob tv-knob-sm" />
              <span className="tv-label">TINT</span>
            </div>
            <div className="tv-knob-group">
              <div className="tv-knob tv-knob-sm" />
              <span className="tv-label">BRT</span>
            </div>
            <div className="tv-power-light" />
          </div>
        </div>

        {/* Right speaker */}
        <div className="tv-speaker-panel">
          <div className="tv-speaker-cloth">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="tv-speaker-bar" />
            ))}
          </div>
        </div>
      </div>
      {/* Feet */}
      <div className="tv-feet">
        <div className="tv-foot" />
        <div className="tv-foot" />
      </div>
    </div>
  );
}
