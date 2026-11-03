import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt =
  'RetroTV — guess the classic 70s and 80s TV show from six screenshots';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * The share card.
 *
 * Drawn to match the game itself: the walnut console TV from RetroTV.tsx, a
 * colour-bar test pattern behind the scanlines, and the six guess squares
 * people already paste into their result tweets. No show still is used — every
 * frame in public/frames belongs to somebody, and a card is a permanent piece
 * of marketing rather than the quiz itself, so the screen shows a test pattern
 * instead. It also keeps the card from looking like a giveaway of one answer.
 *
 * Everything here is text and boxes, so the image is generated at build time
 * and can never fail on a network hiccup.
 */

const AMBER = '#ffb347';
const CRT_GREEN = '#33ff33';

// SMPTE bars, top band then the inverted strip beneath it.
const BARS = ['#bfbfbf', '#bfbf00', '#00bfbf', '#00bf00', '#bf00bf', '#bf0000', '#0000bf'];
const LOWER = ['#0000bf', '#131313', '#bf00bf', '#131313', '#00bfbf', '#131313', '#bfbfbf'];

const fontPath = (file: string) => join(process.cwd(), 'src/assets/fonts', file);

/** A cabinet knob. Two sizes, same turned-aluminium treatment. */
function Knob({ size: d, label }: { size: number; label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          width: d,
          height: d,
          borderRadius: d,
          background: 'linear-gradient(145deg, #d8c9a4, #7d6c4c)',
          border: '2px solid #4a3a20',
          boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.35)',
        }}
      />
      {label ? (
        <div style={{ fontFamily: 'Press Start 2P', fontSize: 8, color: '#d8bb8a', marginTop: 5 }}>
          {label}
        </div>
      ) : null}
    </div>
  );
}

export default async function Image() {
  const [pressStart, vt323] = await Promise.all([
    readFile(fontPath('PressStart2P-Regular.ttf')),
    readFile(fontPath('VT323-Regular.ttf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: '#0f0f1a',
          fontFamily: 'VT323',
          position: 'relative',
        }}
      >
        {/* Amber room-light spill behind the set. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            background:
              'radial-gradient(circle at 26% 50%, rgba(255,179,71,0.16) 0%, rgba(255,179,71,0.04) 38%, rgba(15,15,26,0) 70%)',
          }}
        />

        {/* ─── The set ─── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginLeft: 56,
            width: 500,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 500,
              background: '#52331a',
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(28,14,5,0.18) 0px, rgba(28,14,5,0.18) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 9px), repeating-linear-gradient(90deg, rgba(139,95,53,0.16) 0px, rgba(139,95,53,0.16) 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 31px), linear-gradient(172deg, #6b4521 0%, #52331a 45%, #381f0c 100%)',
              borderRadius: '16px 16px 6px 6px',
              border: '1px solid #1a0d04',
              boxShadow:
                'inset 0 2px 0 rgba(255,213,160,0.22), 0 18px 48px rgba(0,0,0,0.72), 0 0 60px rgba(255,179,71,0.07)',
            }}
          >
            {/* Left speaker grille */}
            <div style={{ display: 'flex', width: 52, padding: '18px 10px' }}>
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  borderRadius: 3,
                  background: '#1b1008',
                  backgroundImage:
                    'repeating-linear-gradient(90deg, rgba(0,0,0,0.75) 0px, rgba(0,0,0,0.75) 2px, rgba(120,88,48,0.28) 2px, rgba(120,88,48,0.28) 4px)',
                  boxShadow: 'inset 0 0 0 1px rgba(180,134,74,0.22), inset 0 4px 10px rgba(0,0,0,0.8)',
                }}
              />
            </div>

            {/* Screen + controls */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px 0' }}>
              <div
                style={{
                  display: 'flex',
                  position: 'relative',
                  width: 376,
                  height: 282,
                  borderRadius: 18,
                  overflow: 'hidden',
                  background: '#0a0a0a',
                  border: '7px solid #16100a',
                  boxShadow: 'inset 0 0 22px rgba(0,0,0,0.95), 0 0 24px rgba(255,179,71,0.12)',
                }}
              >
                {/* Colour bars */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                  <div style={{ display: 'flex', flex: 74 }}>
                    {BARS.map((c) => (
                      <div key={c} style={{ display: 'flex', flex: 1, background: c }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', flex: 26 }}>
                    {LOWER.map((c, i) => (
                      <div key={`${c}-${i}`} style={{ display: 'flex', flex: 1, background: c }} />
                    ))}
                  </div>
                </div>

                {/* Dim the pattern so the question mark carries the screen */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    background:
                      'radial-gradient(circle at 50% 48%, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.62) 52%, rgba(0,0,0,0.34) 100%)',
                  }}
                />

                {/* Scanlines */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.45) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)',
                  }}
                />

                {/* The prompt */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Press Start 2P',
                      fontSize: 104,
                      color: AMBER,
                      textShadow: '0 0 28px rgba(255,179,71,0.85), 0 0 60px rgba(255,179,71,0.4)',
                    }}
                  >
                    ?
                  </div>
                </div>

                {/* Glass */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    background:
                      'linear-gradient(148deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 34%, rgba(255,255,255,0) 58%)',
                  }}
                />
              </div>

              {/* Control strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: 376,
                  marginTop: 14,
                  padding: '0 6px',
                }}
              >
                <Knob size={30} label="CH" />
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '7px 14px',
                    borderRadius: 4,
                    background: 'linear-gradient(180deg, #2a1b0d, #191007)',
                    border: '1px solid rgba(198,156,85,0.45)',
                  }}
                >
                  <div style={{ fontFamily: 'Press Start 2P', fontSize: 11, color: '#e0bc86', letterSpacing: 1 }}>
                    RETRO
                  </div>
                  <div style={{ fontFamily: 'VT323', fontSize: 15, color: '#a07d4e', marginTop: 2 }}>
                    Solid State
                  </div>
                </div>
                <Knob size={30} label="VOL" />
                <div
                  style={{
                    display: 'flex',
                    width: 11,
                    height: 11,
                    borderRadius: 11,
                    background: '#ff4433',
                    boxShadow: '0 0 12px rgba(255,68,51,0.9)',
                  }}
                />
              </div>
            </div>

            {/* Right speaker grille */}
            <div style={{ display: 'flex', width: 52, padding: '18px 10px' }}>
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  borderRadius: 3,
                  background: '#1b1008',
                  backgroundImage:
                    'repeating-linear-gradient(90deg, rgba(0,0,0,0.75) 0px, rgba(0,0,0,0.75) 2px, rgba(120,88,48,0.28) 2px, rgba(120,88,48,0.28) 4px)',
                  boxShadow: 'inset 0 0 0 1px rgba(180,134,74,0.22), inset 0 4px 10px rgba(0,0,0,0.8)',
                }}
              />
            </div>
          </div>

          {/* Feet */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 400, marginTop: -1 }}>
            <div style={{ display: 'flex', width: 26, height: 14, background: '#2a1a0a', borderRadius: '0 0 4px 4px' }} />
            <div style={{ display: 'flex', width: 26, height: 14, background: '#2a1a0a', borderRadius: '0 0 4px 4px' }} />
          </div>
        </div>

        {/* ─── The pitch ─── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 530,
            marginLeft: 50,
          }}
        >
          <div
            style={{
              fontFamily: 'Press Start 2P',
              fontSize: 58,
              color: AMBER,
              textShadow: '0 0 30px rgba(255,179,71,0.45)',
            }}
          >
            RetroTV
          </div>

          <div style={{ display: 'flex', width: 300, height: 3, background: AMBER, opacity: 0.5, marginTop: 22 }} />

          <div style={{ fontFamily: 'VT323', fontSize: 40, color: '#dcdce6', marginTop: 22, lineHeight: 1.25 }}>
            Guess the classic 70s &amp; 80s TV show from six screenshots.
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 34 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  width: 46,
                  height: 46,
                  borderRadius: 5,
                  background: i === 1 ? CRT_GREEN : '#20202e',
                  border: i === 1 ? '1px solid #1f8f1f' : '1px solid #32324a',
                  boxShadow: i === 1 ? '0 0 18px rgba(51,255,51,0.45)' : 'none',
                }}
              />
            ))}
          </div>

          <div style={{ fontFamily: 'VT323', fontSize: 30, color: '#8d8da0', marginTop: 20 }}>
            Six guesses. A new puzzle every day. Free, no login.
          </div>

          <div
            style={{
              fontFamily: 'Press Start 2P',
              fontSize: 22,
              color: AMBER,
              marginTop: 44,
              opacity: 0.9,
            }}
          >
            retrotv.fun
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Press Start 2P', data: pressStart, style: 'normal', weight: 400 },
        { name: 'VT323', data: vt323, style: 'normal', weight: 400 },
      ],
    },
  );
}
