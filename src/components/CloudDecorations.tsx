import React from 'react';

/**
 * もこもこ雲のSVGアイコン
 */
export const FluffyCloud: React.FC<{
  className?: string;
  fill?: string;
  stroke?: string;
}> = ({ className = 'w-10 h-10', fill = '#FFFFFF', stroke = '#CFE8F3' }) => (
  <svg
    viewBox="0 0 100 60"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M25 50 C12 50 5 40 8 28 C9 18 19 12 28 15 C34 6 48 4 58 12 C65 5 78 8 82 18 C92 20 96 32 90 42 C86 50 78 50 70 50 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * ゆるかわお星さまSVG
 */
export const CuteStar: React.FC<{
  className?: string;
  fill?: string;
}> = ({ className = 'w-6 h-6', fill = '#FFD56B' }) => (
  <svg
    viewBox="0 0 40 40"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 2 C22 12 25 15 35 17 C25 20 22 24 20 34 C18 24 15 20 5 17 C15 15 18 12 20 2 Z"
      fill={fill}
      stroke="#F0B538"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * パステルキャンディSVG
 */
export const CuteCandy: React.FC<{
  className?: string;
}> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 50 30"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* キャンディの包み紙の端 */}
    <path d="M12 15 L2 5 L2 25 Z" fill="#FFAEC5" stroke="#E27897" strokeWidth="2" strokeLinejoin="round" />
    <path d="M38 15 L48 5 L48 25 Z" fill="#FFAEC5" stroke="#E27897" strokeWidth="2" strokeLinejoin="round" />
    {/* まあるい本体 */}
    <circle cx="25" cy="15" r="13" fill="#FFF2CC" stroke="#E5BA55" strokeWidth="2" />
    <path d="M22 6 C24 10 26 20 28 24" stroke="#FFAEC5" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/**
 * ゆるかわお花SVG
 */
export const CuteFlower: React.FC<{
  className?: string;
  petalColor?: string;
  centerColor?: string;
}> = ({
  className = 'w-6 h-6',
  petalColor = '#FFC1D3',
  centerColor = '#FFE885',
}) => (
  <svg
    viewBox="0 0 40 40"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 花びら5枚 */}
    <circle cx="20" cy="10" r="7" fill={petalColor} />
    <circle cx="29" cy="17" r="7" fill={petalColor} />
    <circle cx="26" cy="28" r="7" fill={petalColor} />
    <circle cx="14" cy="28" r="7" fill={petalColor} />
    <circle cx="11" cy="17" r="7" fill={petalColor} />
    {/* 花芯 */}
    <circle cx="20" cy="20" r="6" fill={centerColor} stroke="#E5BA55" strokeWidth="1.5" />
  </svg>
);

/**
 * ゆるかわ吹き出し雲SVG
 */
export const CuteCloudBalloon: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`relative bg-white/90 backdrop-blur-xs border-2 border-[#E1EFF6] rounded-2xl px-3 py-2 shadow-xs ${className}`}>
    {children}
    {/* 吹き出しの三角ぽい雲のしっぽ */}
    <div className="absolute -bottom-2 left-6 w-3 h-3 bg-white border-r-2 border-b-2 border-[#E1EFF6] rotate-45 transform" />
  </div>
);

/**
 * 背景に浮かぶもこもこ雲たち（アニメーションまたは固定配置）
 */
export const BackgroundClouds: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 no-print" aria-hidden="true">
      {/* 雲1：左上 */}
      <div className="absolute -top-6 -left-10 opacity-70 w-64 h-36">
        <FluffyCloud className="w-full h-full text-white drop-shadow-xs" fill="#FFFFFF" stroke="#E1EFF6" />
      </div>
      {/* 雲2：右上 */}
      <div className="absolute top-12 -right-12 opacity-60 w-72 h-40">
        <FluffyCloud className="w-full h-full text-white drop-shadow-xs" fill="#FFFFFF" stroke="#E1EFF6" />
      </div>
      {/* 雲3：左中央 */}
      <div className="absolute top-1/3 -left-16 opacity-50 w-56 h-32">
        <FluffyCloud className="w-full h-full text-white" fill="#FFFFFF" stroke="#E8F4FA" />
      </div>
      {/* 雲4：右下寄り */}
      <div className="absolute top-2/3 -right-10 opacity-55 w-60 h-36">
        <FluffyCloud className="w-full h-full text-white" fill="#FFFFFF" stroke="#E8F4FA" />
      </div>
      {/* 雲5：最下部 */}
      <div className="absolute -bottom-10 left-1/4 opacity-40 w-80 h-44">
        <FluffyCloud className="w-full h-full text-white" fill="#FFFFFF" stroke="#E8F4FA" />
      </div>

      {/* ゆるい星のアクセント */}
      <div className="absolute top-24 left-[15%] opacity-70">
        <CuteStar className="w-5 h-5" />
      </div>
      <div className="absolute top-36 right-[20%] opacity-60">
        <CuteStar className="w-4 h-4" />
      </div>
      <div className="absolute top-3/4 left-[8%] opacity-60">
        <CuteFlower className="w-6 h-6" />
      </div>
      <div className="absolute top-1/2 right-[10%] opacity-60">
        <CuteCandy className="w-7 h-5" />
      </div>
    </div>
  );
};
