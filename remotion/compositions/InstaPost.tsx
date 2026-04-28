// DIVINIA — InstaPost: imagen estática 1080x1080 para posts IG
// Props: headline, sub, badge, accent, bgColor

import React from 'react'
import { AbsoluteFill } from 'remotion'

const PALETTE = {
  ink: '#0F0F10',
  paper: '#F7F5EF',
  lime: '#B5FF2C',
  violet: '#6E56F8',
  coral: '#FF6B5B',
}

interface InstaPostProps {
  headline: string
  sub?: string
  badge?: string
  accent?: keyof typeof PALETTE
  dark?: boolean
}

export const InstaPost: React.FC<InstaPostProps> = ({
  headline,
  sub,
  badge,
  accent = 'lime',
  dark = true,
}) => {
  const bg = dark ? PALETTE.ink : PALETTE.paper
  const text = dark ? PALETTE.paper : PALETTE.ink
  const accentColor = PALETTE[accent]

  const lines = headline.split('\n')

  return (
    <AbsoluteFill style={{ background: bg, justifyContent: 'center', alignItems: 'center', padding: '80px 80px' }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Orb glow */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
        bottom: -100,
        right: -100,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {badge && (
          <div style={{
            display: 'inline-block',
            background: accentColor,
            color: PALETTE.ink,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            padding: '8px 20px',
            borderRadius: 4,
            marginBottom: 40,
          }}>
            {badge}
          </div>
        )}

        <div>
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: line.length > 12 ? 78 : 96,
                fontWeight: 900,
                lineHeight: 1.0,
                letterSpacing: -3,
                color: i === lines.length - 1 && lines.length > 1 ? accentColor : text,
                marginBottom: i < lines.length - 1 ? 8 : 0,
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {sub && (
          <div style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 28,
            color: dark ? 'rgba(247,245,239,0.5)' : 'rgba(15,15,16,0.5)',
            marginTop: 36,
            fontWeight: 400,
            lineHeight: 1.5,
          }}>
            {sub}
          </div>
        )}
      </div>

      {/* DIVINIA logo bottom */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        left: 80,
        fontFamily: 'system-ui',
        fontSize: 20,
        fontWeight: 800,
        letterSpacing: 5,
        color: accentColor,
        opacity: 0.8,
      }}>
        DIVINIA
      </div>

      {/* Corner accent */}
      <div style={{
        position: 'absolute',
        top: 60,
        right: 80,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: accentColor,
      }} />
    </AbsoluteFill>
  )
}
