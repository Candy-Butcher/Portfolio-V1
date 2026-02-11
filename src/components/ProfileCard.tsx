'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';

type CSSVars = React.CSSProperties & {
  ['--icon']?: string;
  ['--grain']?: string;
  ['--behind-gradient']?: string;
  ['--inner-gradient']?: string;
};

const DEFAULT_BEHIND_GRADIENT =
  'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)';

const DEFAULT_INNER_GRADIENT =
  'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  DEVICE_BETA_OFFSET: 20,
};

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

const round = (value: number, precision = 3) =>
  parseFloat(value.toFixed(precision));

const adjust = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
) =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));

const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

export interface ProfileCardProps {
  avatarUrl?: string;
  iconUrl?: string;
  grainUrl?: string;
  behindGradient?: string;
  innerGradient?: string;
  showBehindGradient?: boolean;
  className?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  contactText?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  avatarUrl = '/assets/avatar.jpg',
  iconUrl = '/assets/pattern.svg',
  grainUrl = '/assets/grain.png',
  behindGradient,
  innerGradient,
  showBehindGradient = true,
  className = '',
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = 'Aman Chandre',
  title = 'Game Designer',
  handle = 'amanchandre_',
  contactText = 'Contact Me',
  showUserInfo = true,
  onContactClick,
}) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);

  const animationHandlers = useMemo(() => {
    if (!enableTilt) return null;
    let rafId: number | null = null;

    const updateCardTransform = (
      offsetX: number,
      offsetY: number,
      card: HTMLElement,
      wrap: HTMLDivElement
    ) => {
      const width = card.clientWidth;
      const height = card.clientHeight;

      const percentX = clamp((100 / width) * offsetX);
      const percentY = clamp((100 / height) * offsetY);

      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties: Record<string, string> = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--rotate-x': `${round(-(centerX / 5))}deg`,
        '--rotate-y': `${round(centerY / 4)}deg`,
      };

      Object.entries(properties).forEach(([prop, val]) =>
        wrap.style.setProperty(prop, val)
      );
    };

    return {
      updateCardTransform,
      cancelAnimation: () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      },
    };
  }, [enableTilt]);

  useEffect(() => {
    if (!enableTilt || !animationHandlers) return;
    const card = cardRef.current;
    const wrap = wrapRef.current;
    if (!card || !wrap) return;

    const onMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      animationHandlers.updateCardTransform(
        e.clientX - rect.left,
        e.clientY - rect.top,
        card,
        wrap
      );
    };

    card.addEventListener('pointermove', onMove);
    return () => card.removeEventListener('pointermove', onMove);
  }, [enableTilt, animationHandlers]);

  const cardStyle: CSSVars = {
    '--icon': iconUrl ? `url(${iconUrl})` : 'none',
    '--grain': grainUrl ? `url(${grainUrl})` : 'none',
    '--behind-gradient': showBehindGradient
      ? behindGradient ?? DEFAULT_BEHIND_GRADIENT
      : 'none',
    '--inner-gradient': innerGradient ?? DEFAULT_INNER_GRADIENT,
  };

  const handleContactClick = () => {
    if (onContactClick) onContactClick();
    else window.location.href = 'mailto:aman.chandre@gmail.com';
  };

  return (
    <div
      ref={wrapRef}
      className={`pc-card-wrapper ${className}`.trim()}
      style={cardStyle}
    >
      <section ref={cardRef} className="pc-card">
        <div className="pc-inside">
       <div className="pc-shine" style={{ pointerEvents: "none" }} />
      <div className="pc-glare" style={{ pointerEvents: "none" }} />


          {/* AVATAR BACKGROUND */}
          <div
            className="pc-content pc-avatar-content"
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            <img
              className="avatar"
              src={avatarUrl}
              alt={`${name} avatar`}
              loading="lazy"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: '50% 12%',
                transform: 'translateY(0%)',
              }}
            />

            {showUserInfo && (
              <div className="pc-user-info">
                <div className="pc-user-details">
                  <div className="pc-mini-avatar">
                    <img
                      src={miniAvatarUrl || avatarUrl}
                      alt={`${name} mini avatar`}
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'top center',
                      }}
                    />
                  </div>
                  <div className="pc-user-text">
                    <div className="pc-handle">@{handle}</div>
                  </div>
                </div>
               <button
  className="pc-contact-btn"
  type="button"
  onPointerDown={(e) => e.stopPropagation()}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContactClick) onContactClick();
    else window.location.assign('mailto:aman.chandre@gmail.com');
  }}
>
  {contactText}
</button>
              </div>
            )}
          </div>

          <div className="pc-content">
            <div className="pc-details">
              <h3>{name}</h3>
              <p>{title}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;
