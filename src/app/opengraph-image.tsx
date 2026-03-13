import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RetroTV - Daily 70s & 80s TV Show Guessing Game';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* TV Cabinet */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #9a7040, #6b4420)',
            borderRadius: 20,
            padding: '40px 50px',
            marginRight: 60,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 30px rgba(255,179,71,0.15)',
            border: '2px solid rgba(160,120,60,0.3)',
          }}
        >
          {/* Screen */}
          <div
            style={{
              background: '#0a0a0a',
              borderRadius: 12,
              width: 300,
              height: 225,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.9)',
            }}
          >
            <span style={{ fontSize: 100 }}>📺</span>
          </div>
          {/* Knobs */}
          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #c8b890, #8a7a5c)',
                border: '2px solid #6a5c40',
              }}
            />
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #c8b890, #8a7a5c)',
                border: '2px solid #6a5c40',
              }}
            />
          </div>
        </div>

        {/* Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 'bold', color: '#ffb347', letterSpacing: 4 }}>
            RetroTV
          </div>
          <div style={{ fontSize: 26, color: '#a0a0a0', marginTop: 8 }}>
            Daily 70s &amp; 80s TV Show Challenge
          </div>
          <div style={{ fontSize: 20, color: '#ffb347', marginTop: 30, opacity: 0.7 }}>
            Can you guess the show? 🤔
          </div>
          <div style={{ fontSize: 16, color: '#666', marginTop: 12 }}>
            200+ classic shows · New puzzle daily · Free
          </div>
          <div style={{ fontSize: 20, color: '#ffb347', marginTop: 40, opacity: 0.5 }}>
            retrotv.fun
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
