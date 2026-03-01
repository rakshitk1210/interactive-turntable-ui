/**
 * TurntableFramer — Self-contained Framer-compatible turntable component.
 *
 * HOW TO USE IN FRAMER
 * ─────────────────────
 * 1. Copy this file into your Framer project (or paste into a new Code Component).
 * 2. Uncomment the four lines at the very bottom of this file (the Framer block).
 * 3. All props will appear in Framer's right-side property panel automatically.
 *
 * DEPENDENCIES (already present in Framer canvas):
 *   • react
 *   • motion/react  (or framer-motion — same API)
 *
 * ZERO external file imports — all SVGs are inlined as JSX.
 */

import React, { useRef, useState, useEffect, useId } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import { addPropertyControls, ControlType } from "framer";

// ─────────────────────────────────────────────────────────────────────────────
// PROP TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TurntableFramerProps {
  // ── Media ──────────────────────────────────────────────────────────────────
  /** URL of the audio file to play (MP3, WAV, OGG). */
  musicFile?: string;
  /** URL of the album artwork shown on the platter centre label. */
  coverImage?: string;

  // ── Shape & Size ───────────────────────────────────────────────────────────
  /** Corner radius of the turntable chassis in px. */
  borderRadius?: number;
  /** Uniform scale applied to the whole component (1 = native 720 × 540 px). */
  scale?: number;

  // ── Colors ─────────────────────────────────────────────────────────────────
  /** Body / housing colour of the turntable. */
  chassisColor?: string;
  /** Fill colour of the outer vinyl ring. */
  platterColor?: string;
  /** Fill colour of the inner vinyl grooves and body. */
  vinylColor?: string;
  /** Background colour of the round centre label. */
  vinylLabelColor?: string;
  /** Tone-arm body tint (applied as a CSS `sepia + hue-rotate` filter). */
  armTint?: string;
  /** Chassis drop-shadow colour. */
  shadowColor?: string;
  /** Accent colour used for the pitch-slider rail and knob stripe. */
  accentColor?: string;

  // ── Shadow ─────────────────────────────────────────────────────────────────
  /** Blur radius of the chassis drop shadow in px. */
  shadowBlur?: number;
  /** Spread radius of the chassis drop shadow in px. */
  shadowSpread?: number;

  // ── Behaviour ──────────────────────────────────────────────────────────────
  /** Start the motor spinning immediately on mount. */
  autoPlay?: boolean;
  /** Show the vertical pitch-speed slider on the right. */
  showPitchSlider?: boolean;
  /** Seconds for one full platter revolution at 1× speed (lower = faster). */
  revolutionSpeed?: number;
  /** Spring stiffness for tone-arm settle animation (px/s²). */
  armSpringStiffness?: number;
  /** Spring damping for tone-arm settle animation. */
  armSpringDamping?: number;
  /**
   * Show built-in "Upload MP3" / "Upload Cover" buttons at the bottom of the
   * component. Useful when testing outside Framer. In Framer, use the property
   * controls panel instead.
   */
  showUploadUI?: boolean;
  /**
   * URL of an image to overlay on the chassis at reduced opacity (mimics the
   * wood-grain texture used in the original design). Pass an empty string to
   * disable. Defaults to `/wood-texture.png`.
   */
  chassisTexture?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE SVG PRIMITIVES
// Each helper is a plain function component so React can key them correctly.
// ─────────────────────────────────────────────────────────────────────────────

/** Outer vinyl ring — includes inner-shadow filter and embedded gold-grain texture. */
function DiskOuter({ color, filterId }: { color: string; filterId: string }) {
  return (
    <svg
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      overflow="visible"
      style={{ display: "block" }}
      viewBox="0 0 440.37 440.37"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id={filterId}
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
        >
          <feComponentTransfer in="SourceAlpha" result="invertedAlpha">
            <feFuncA type="linear" slope="-1" intercept="1" />
          </feComponentTransfer>
          <feMorphology
            in="invertedAlpha"
            operator="dilate"
            radius="1"
            result="spread"
          />
          <feOffset dx="0" dy="0" in="spread" result="offset" />
          <feGaussianBlur stdDeviation="4" in="offset" result="blur" />
          <feComposite in="blur" in2="SourceAlpha" operator="in" result="clipped" />
          <feFlood floodColor="#000000" floodOpacity="0.5" result="shadowColor" />
          <feComposite
            in="shadowColor"
            in2="clipped"
            operator="in"
            result="coloredShadow"
          />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="coloredShadow" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="220.185"
        cy="220.185"
        r="220.185"
        fill={color}
        filter={`url(#${filterId})`}
      />
    </svg>
  );
}

/** Vinyl body / groove ring circles — shared shape, varying fill & filter. */
function DiskRing({
  size,
  color,
  filterId,
}: {
  size: number;
  color: string;
  filterId: string;
}) {
  const r = size / 2;
  return (
    <svg
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      overflow="visible"
      style={{ display: "block" }}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id={filterId}
          x="0"
          y="0"
          width={`${size}`}
          height={`${size}`}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="3.28635" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <circle cx={r} cy={r} r={r} fill={color} />
      </g>
    </svg>
  );
}

/** Spinning highlight / light-flare overlay. */
function DiskLightEffect() {
  return (
    <svg
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      overflow="visible"
      style={{ display: "block" }}
      viewBox="0 0 585.849 585.846"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="ttf_light0" x="79.025" y="67.218" width="253.901" height="265.705" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="20" result="effect1_foregroundBlur" />
        </filter>
        <filter id="ttf_light1" x="252.922" y="252.922" width="253.901" height="265.705" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="20" result="effect1_foregroundBlur" />
        </filter>
        <linearGradient id="ttf_lg0" x1="185.709" y1="107.218" x2="260.926" y2="237.42" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="#242529" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="ttf_lg1" x1="400.139" y1="478.628" x2="324.922" y2="348.426" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="#242529" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <g filter="url(#ttf_light0)">
        <path
          d="M185.709 107.218C159.476 122.364 136.748 142.897 119.025 167.463L292.926 292.923L185.709 107.218Z"
          fill="url(#ttf_lg0)"
          fillOpacity="0.2"
        />
      </g>
      <g filter="url(#ttf_light1)">
        <path
          d="M400.139 478.628C426.373 463.482 449.1 442.949 466.824 418.383L292.922 292.922L400.139 478.628Z"
          fill="url(#ttf_lg1)"
          fillOpacity="0.2"
        />
      </g>
    </svg>
  );
}

/** Centre spindle pin — white dot. */
function CenterPin() {
  return (
    <svg
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      overflow="visible"
      style={{ display: "block" }}
      viewBox="0 0 21.3612 21.3612"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10.6806" cy="10.6806" r="4.92952" fill="white" />
    </svg>
  );
}

/**
 * Tone-arm SVG — inlined verbatim from the original arm-updated.svg.
 * The gold-grain base64 texture is preserved inside the SVG defs.
 */
function ArmSvg({ uniqueId }: { uniqueId: string }) {
  const pid = `arm_${uniqueId}`;
  return (
    <svg
      width="145"
      height="464"
      viewBox="0 0 145 464"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      {/* ── Defs ──────────────────────────────────────────────────────────── */}
      <defs>
        <filter
          id={`${pid}_blur`}
          x="2.232"
          y="-0.0003"
          width="142.473"
          height="463.251"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="11.6125" result="effect1_foregroundBlur" />
        </filter>
        <filter
          id={`${pid}_drop`}
          x="64.285"
          y="78.418"
          width="20.794"
          height="20.796"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="4.199" dy="4.199" />
          <feGaussianBlur stdDeviation="2.94" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <linearGradient id={`${pid}_lg0`} x1="62.006" y1="163.937" x2="121.951" y2="346.286" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" /><stop offset="1" />
        </linearGradient>
        <linearGradient id={`${pid}_lg1`} x1="63.638" y1="64.044" x2="77.394" y2="136.937" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" /><stop offset="1" />
        </linearGradient>
        <linearGradient id={`${pid}_lg2`} x1="46.015" y1="368.236" x2="47.753" y2="393.549" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" /><stop offset="1" />
        </linearGradient>
        <linearGradient id={`${pid}_lg3`} x1="64.842" y1="47.599" x2="65.119" y2="58.376" gradientUnits="userSpaceOnUse">
          <stop /><stop offset="1" stopColor="white" />
        </linearGradient>
        <linearGradient id={`${pid}_lg4`} x1="64.357" y1="15.576" x2="66.519" y2="51.776" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" /><stop offset="1" />
        </linearGradient>
        <linearGradient id={`${pid}_lg5`} x1="22.149" y1="388.177" x2="26.055" y2="437.639" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" /><stop offset="1" />
        </linearGradient>
        {/* Gold grain texture — base64 embedded, pattern ID scoped per instance */}
        <pattern id={`${pid}_gold`} patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
          <image
            href="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAIAAgADASIAAhEBAxEB/8QAGgAAAwEBAQEAAAAAAAAAAAAAAQIDAAQHBf/EADkQAAEDAQcDAwIGAgICAgMBAAEAAgMRBBMUITFBURIyUkJhkSKhBSMzU2JxFYEkQ7Hh8PFjcsHR/8QAGgEBAQEBAQEBAAAAAAAAAAAAAAEEAgMFBv/EAB0RAQEAAgMBAQEAAAAAAAAAAAARASESUWEiAoH/2gAMAwEAAhEDEQA/APVr5nKBlZyqG7poErrrgL8W+4QyM2cELxvkExEXAS9MXAQAyN8glL2eQWLYuAlIi4CDF7eQgXt8gsRFXtCUti8QqCXNp3JS8e6xbFwhRlUG6/coF3DigQyupCH0+RQbqPKHW7lY05KxpyUAMjhqlMxG6f5QP9IpL6tf/8AFjMNM/hE03FECGoFMwB3+Epnboapi1ozqEKNpWgQIZ2AboGdnuno2taBYtYdaKaEsSzlLfMOYKp0R8BAxxhWYVMzMO6UzsrqqmOOmyBijroEIlfsrqsbQzlOYY66BAws9kIQ2iOmqU2iI7pzBHTRA2eM7KkIbRFlmKIGeLyTmzR8IYePhKJ4iEbpcTAN/sqmzx8BA2ePgUSkRxMNdfslxMOeasbPHXtCU2dmf0hLhYniYT6glM8NO4J3WePgJTZ2V0CuiEM0Ne4IGeDTqCbDR+IS4WPhLgDERUyKBtMIRdZY9ggbMzLJLghTaotTslNpjplVPhmV0S4ZnCXBCOtMe1UMTH7qhszKDlDCsrmlwRI2llcgVjaW0pQqmGYgbOyitwRLFCmTUHWs7MVDA3dKY6aUKaWENqk0DEuInPpyVCH1yASEyjQD4VIUzTn05JTNPTMJi6YDQfC3XMKVaPhAl7MlvJ86J72UHNo+EL2XwCqEMk+eWSUyTKt5MR2hG8ly+kIRAyzVzqhez1Oa6A+UnNgWJdTNgSrHKZZqFAzTLrFKZtCxczxS4JlxmaA=="
            x="0"
            y="0"
            width="1"
            height="1"
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>
      </defs>

      {/* ── Soft blur shadow (background element) ─────────────────────────── */}
      <g filter={`url(#${pid}_blur)`}>
        <path d="M51.4493 83.7043L117.723 123.929C121.436 126.182 122.596 131.033 120.304 134.723C118.043 138.363 113.271 139.501 109.611 137.272L43.3961 96.9509C39.8871 94.8142 38.6548 90.3107 40.5871 86.685C42.6804 82.7571 47.6443 81.3949 51.4493 83.7043Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path d="M73.0508 192.968C69.7215 180.237 69.3927 156.794 70.478 148.254C70.478 148.254 74.248 147.474 76.9771 147.738C79.7063 148.001 83.7374 149.555 83.7374 149.555C81.1017 166.041 85.889 188.86 87.1553 194.356L90.2355 207.474C94.5676 225.205 103.655 267.1 105.345 292.835C107.036 318.57 99.1565 339.78 95.0053 347.168L77.6472 375.898C77.6472 375.898 73.6082 373.985 71.2825 372.464C68.9568 370.943 65.7365 368.107 65.7365 368.107C71.3943 360.681 85.574 341.549 89.1883 325.266C93.0413 307.908 92.7233 299.609 90.6606 285.635C88.598 271.661 84.4471 247.752 84.4471 247.752C82.2764 233.611 76.3801 205.698 73.0508 192.968Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path d="M66.3265 134.398L72.4944 66.4456C72.5295 66.0581 72.8509 65.7614 73.2399 65.7626C74.9063 65.7679 79.2676 65.8024 82.3573 66.0126C85.4595 66.2236 89.98 66.7462 91.6867 66.9495C92.0764 66.996 92.3606 67.3344 92.3443 67.7266L89.5162 135.593C89.5131 135.67 89.4982 135.745 89.4722 135.817L84.2586 150.276C84.1326 150.626 83.7723 150.832 83.4069 150.764C82.0914 150.519 79.0092 149.967 76.9186 149.775C74.8383 149.584 71.7366 149.789 70.3914 149.896C70.012 149.926 69.6677 149.673 69.5855 149.302L66.3411 134.629C66.3244 134.553 66.3194 134.475 66.3265 134.398Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path d="M62.204 438.733C59.2556 436.938 52.4026 432.395 48.2867 429.728C47.6799 429.335 46.8721 429.522 46.4944 430.139C46.1276 430.737 46.3045 431.518 46.9049 431.883C51.3467 434.578 59.0288 438.545 61.4801 439.932C61.8043 440.115 62.2181 440.021 62.4241 439.711C62.6422 439.382 62.5409 438.938 62.204 438.733Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path d="M70.0014 393.622L79.6379 378.465C80.1212 377.705 79.8374 376.693 79.0341 376.286C77.154 375.333 73.9279 373.643 71.7641 372.212C69.6246 370.796 66.857 368.539 65.2432 367.187C64.5368 366.594 63.4659 366.753 62.9717 367.532L52.8672 383.442C52.4403 384.114 52.6085 385.001 53.2583 385.461C54.9069 386.629 57.9982 388.78 60.3225 390.163C62.6999 391.578 66.2682 393.306 68.1069 394.175C68.7877 394.497 69.5974 394.257 70.0014 393.622Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path d="M72.3731 67.8785L60.7595 60.1795C60.7595 60.1795 71.5349 56.7983 83.4963 57.2093C95.4577 57.6203 107.163 63.2126 107.163 63.2126L92.3581 69.1086C92.3581 69.1086 88.7052 68.0295 82.222 67.6352C75.7388 67.2409 72.3731 67.8785 72.3731 67.8785Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path d="M59.9315 53.8881L60.0747 59.6872C60.0902 60.3122 60.6032 60.8066 61.2282 60.793C64.8582 60.7139 76.4654 60.5138 84.1296 60.9865C91.6936 61.453 102.675 62.9881 106.312 63.5149C106.971 63.6104 107.565 63.1199 107.602 62.4551L107.92 56.787C107.948 56.2952 107.613 55.8564 107.132 55.7527C106.655 55.65 106.322 55.2187 106.343 54.7316L107.5 27.7136C107.521 27.2173 107.218 26.7648 106.747 26.608C92.3403 21.8163 72.2753 23.1108 63.0398 24.4934C62.5022 24.5739 62.106 25.0315 62.0929 25.575L61.4581 51.8627C61.4469 52.3233 61.1377 52.7231 60.6948 52.8497C60.2335 52.9815 59.9196 53.4085 59.9315 53.8881Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path fillRule="evenodd" clipRule="evenodd" d="M50.5514 383.352C50.7801 382.955 51.3057 382.851 51.6698 383.129C53.2811 384.361 57.4089 387.456 60.5258 389.263C63.6697 391.085 68.7265 393.335 70.6714 394.183C71.0927 394.367 71.2529 394.88 71.0131 395.272L45.2173 437.478C44.6332 438.434 43.4404 438.818 42.4165 438.364C40.2277 437.394 36.4951 435.685 33.9463 434.22C31.4686 432.797 28.3143 430.665 26.4138 429.351C25.457 428.689 25.1779 427.407 25.7585 426.399L50.5514 383.352ZM47.1551 405.249C43.436 405.341 40.4955 408.431 40.5873 412.15C40.6793 415.869 43.7687 418.809 47.4878 418.717C51.2068 418.625 54.1472 415.536 54.0555 411.817C53.9636 408.098 50.8742 405.157 47.1551 405.249ZM55.6242 392.202C51.9051 392.294 48.9646 395.383 49.0564 399.102C49.1483 402.821 52.2377 405.762 55.9569 405.67C59.6758 405.578 62.6165 402.488 62.5246 398.769C62.4327 395.05 59.3431 392.11 55.6242 392.202Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path d="M50.3556 69.2728L116.629 109.497C120.342 111.751 121.502 116.602 119.21 120.292C116.949 123.932 112.177 125.069 108.517 122.84L42.3024 82.5194C38.7934 80.3826 37.5612 75.8791 39.4934 72.2535C41.5868 68.3255 46.5506 66.9634 50.3556 69.2728Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path d="M35.3664 83.4755C34.1276 87.7239 40.6111 95.9875 45.0541 97.9406L50.5868 87.5762L45.5399 84.5305C42.6904 82.5014 36.6052 79.2271 35.3664 83.4755Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path d="M42.4906 82.7209C41.2756 82.0487 39.0264 80.4577 35.1046 79.7689C34.2622 79.621 33.8557 79.8249 33.6295 80.1274L39.5345 72.205C37.327 77.6566 40.4147 80.9278 42.4906 82.7209Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path d="M43.8745 83.368C42.6595 82.6958 39.9967 81.0017 37.8145 80.3881C35.6323 79.7745 34.1148 79.3491 33.5757 80.2018C33.0365 81.0546 34.5846 84.9666 35.8356 87.3497C35.2606 85.6443 35.0173 82.2533 37.3414 81.9357C39.6655 81.6181 43.018 82.9413 43.8745 83.368Z" fill="#2C2C2C" fillOpacity="0.3" />
        <path d="M83.1177 92.2826C84.2614 94.4086 83.4651 97.0591 81.3392 98.2028C79.2133 99.3465 76.5627 98.5502 75.4191 96.4243C74.2754 94.2984 75.0716 91.6478 77.1976 90.5041C79.3235 89.3605 81.974 90.1567 83.1177 92.2826Z" fill="#2C2C2C" fillOpacity="0.3" />
      </g>

      {/* ── Stylus wires ──────────────────────────────────────────────────── */}
      <path d="M17.8528 429.853L52.9385 378.032" stroke="#8E4F4C" strokeWidth="0.83989" />
      <path d="M22.8176 431.381L57.9033 379.559" stroke="#8E4F4C" strokeWidth="0.83989" />

      {/* ── Main arm tube ─────────────────────────────────────────────────── */}
      <path d="M41.8935 73.2038L109.781 115.74C113.584 118.124 114.712 123.153 112.289 126.932C109.899 130.66 104.952 131.765 101.203 129.408L33.3777 86.7728C29.7834 84.5133 28.5763 79.8419 30.6261 76.1241C32.8469 72.0962 37.9959 70.7617 41.8935 73.2038Z" fill="#403F3F" />
      <path d="M62.6079 186.419C59.355 173.216 59.3597 148.989 60.6066 140.181C60.6066 140.181 64.5135 139.43 67.3296 139.743C70.1456 140.055 74.288 141.72 74.288 141.72C71.3224 158.715 75.9335 182.364 77.1612 188.062L80.1511 201.661C84.3668 220.046 93.1403 263.468 94.5093 290.084C95.8782 316.699 87.4245 338.5 83.0266 346.073L64.6688 375.503C64.6688 375.503 60.5236 373.468 58.1429 371.861C55.7622 370.255 52.4764 367.278 52.4764 367.278C58.4315 359.688 73.3642 340.128 77.338 323.357C81.5743 305.478 81.3676 296.898 79.4417 282.428C77.5158 267.959 73.5783 243.194 73.5783 243.194C71.5431 228.55 65.8609 199.623 62.6079 186.419Z" fill="#333333" />
      <path d="M62.6079 186.419C59.355 173.216 59.3597 148.989 60.6066 140.181C60.6066 140.181 64.5135 139.43 67.3296 139.743C70.1456 140.055 74.288 141.72 74.288 141.72C71.3224 158.715 75.9335 182.364 77.1612 188.062L80.1511 201.661C84.3668 220.046 93.1403 263.468 94.5093 290.084C95.8782 316.699 87.4245 338.5 83.0266 346.073L64.6688 375.503C64.6688 375.503 60.5236 373.468 58.1429 371.861C55.7622 370.255 52.4764 367.278 52.4764 367.278C58.4315 359.688 73.3642 340.128 77.338 323.357C81.5743 305.478 81.3676 296.898 79.4417 282.428C77.5158 267.959 73.5783 243.194 73.5783 243.194C71.5431 228.55 65.8609 199.623 62.6079 186.419Z" fill={`url(#${pid}_lg0)`} fillOpacity="0.04" />

      {/* ── Headshell body (gold) ──────────────────────────────────────────── */}
      <path d="M56.5206 125.803L63.8924 55.6802C63.9344 55.2804 64.2708 54.9785 64.6728 54.9855C66.3945 55.0154 70.9004 55.1152 74.0898 55.3777C77.292 55.6413 81.9553 56.2478 83.7158 56.483C84.1178 56.5367 84.4064 56.8906 84.3838 57.2955L80.4643 127.378C80.4599 127.457 80.4434 127.535 80.4155 127.609L74.816 142.473C74.6806 142.832 74.3054 143.04 73.9288 142.964C72.5731 142.692 69.3965 142.076 67.2391 141.847C65.0925 141.619 61.8846 141.785 60.493 141.876C60.1005 141.901 59.7485 141.635 59.669 141.25L56.5324 126.042C56.5162 125.963 56.5122 125.883 56.5206 125.803Z" fill="#FFE090" />
      <path d="M56.5206 125.803L63.8924 55.6802C63.9344 55.2804 64.2708 54.9785 64.6728 54.9855C66.3945 55.0154 70.9004 55.1152 74.0898 55.3777C77.292 55.6413 81.9553 56.2478 83.7158 56.483C84.1178 56.5367 84.4064 56.8906 84.3838 57.2955L80.4643 127.378C80.4599 127.457 80.4434 127.535 80.4155 127.609L74.816 142.473C74.6806 142.832 74.3054 143.04 73.9288 142.964C72.5731 142.692 69.3965 142.076 67.2391 141.847C65.0925 141.619 61.8846 141.785 60.493 141.876C60.1005 141.901 59.7485 141.635 59.669 141.25L56.5324 126.042C56.5162 125.963 56.5122 125.883 56.5206 125.803Z" fill={`url(#${pid}_gold)`} fillOpacity="0.35" style={{ mixBlendMode: "multiply" }} />
      <path d="M56.5206 125.803L63.8924 55.6802C63.9344 55.2804 64.2708 54.9785 64.6728 54.9855C66.3945 55.0154 70.9004 55.1152 74.0898 55.3777C77.292 55.6413 81.9553 56.2478 83.7158 56.483C84.1178 56.5367 84.4064 56.8906 84.3838 57.2955L80.4643 127.378C80.4599 127.457 80.4434 127.535 80.4155 127.609L74.816 142.473C74.6806 142.832 74.3054 143.04 73.9288 142.964C72.5731 142.692 69.3965 142.076 67.2391 141.847C65.0925 141.619 61.8846 141.785 60.493 141.876C60.1005 141.901 59.7485 141.635 59.669 141.25L56.5324 126.042C56.5162 125.963 56.5122 125.883 56.5206 125.803Z" fill={`url(#${pid}_lg1)`} fillOpacity="0.04" />

      {/* ── Stylus holder tip ─────────────────────────────────────────────── */}
      <path d="M47.7885 440.202C44.7683 438.303 37.7541 433.509 33.5404 430.692C32.9193 430.277 32.0818 430.459 31.6825 431.09C31.2947 431.704 31.466 432.513 32.081 432.899C36.631 435.749 44.5104 439.961 47.0228 441.43C47.3551 441.624 47.7841 441.533 48.0015 441.215C48.2317 440.879 48.1336 440.419 47.7885 440.202Z" fill="#BCC4CB" />
      <path d="M47.7885 440.202C44.7683 438.303 37.7541 433.509 33.5404 430.692C32.9193 430.277 32.0818 430.459 31.6825 431.09C31.2947 431.704 31.466 432.513 32.081 432.899C36.631 435.749 44.5104 439.961 47.0228 441.43C47.3551 441.624 47.7841 441.533 48.0015 441.215C48.2317 440.879 48.1336 440.419 47.7885 440.202Z" fill="#737373" />

      {/* ── Cartridge body (gold) ──────────────────────────────────────────── */}
      <path d="M56.5082 393.705L66.6881 378.185C67.1985 377.407 66.9202 376.357 66.0961 375.925C64.1675 374.912 60.859 373.119 58.6442 371.608C56.4544 370.114 53.6278 367.741 51.9802 366.32C51.259 365.697 50.1501 365.846 49.628 366.643L38.9536 382.934C38.5026 383.623 38.6634 384.541 39.328 385.026C41.0143 386.257 44.1768 388.525 46.5581 389.988C48.9938 391.486 52.6554 393.323 54.5426 394.248C55.2412 394.591 56.0814 394.355 56.5082 393.705Z" fill="#FFE090" />
      <path d="M56.5082 393.705L66.6881 378.185C67.1985 377.407 66.9202 376.357 66.0961 375.925C64.1675 374.912 60.859 373.119 58.6442 371.608C56.4544 370.114 53.6278 367.741 51.9802 366.32C51.259 365.697 50.1501 365.846 49.628 366.643L38.9536 382.934C38.5026 383.623 38.6634 384.541 39.328 385.026C41.0143 386.257 44.1768 388.525 46.5581 389.988C48.9938 391.486 52.6554 393.323 54.5426 394.248C55.2412 394.591 56.0814 394.355 56.5082 393.705Z" fill={`url(#${pid}_gold)`} fillOpacity="0.35" style={{ mixBlendMode: "multiply" }} />
      <path d="M56.5082 393.705L66.6881 378.185C67.1985 377.407 66.9202 376.357 66.0961 375.925C64.1675 374.912 60.859 373.119 58.6442 371.608C56.4544 370.114 53.6278 367.741 51.9802 366.32C51.259 365.697 50.1501 365.846 49.628 366.643L38.9536 382.934C38.5026 383.623 38.6634 384.541 39.328 385.026C41.0143 386.257 44.1768 388.525 46.5581 389.988C48.9938 391.486 52.6554 393.323 54.5426 394.248C55.2412 394.591 56.0814 394.355 56.5082 393.705Z" fill={`url(#${pid}_lg2)`} fillOpacity="0.04" />

      {/* ── Top bracket (headshell cap) ────────────────────────────────────── */}
      <path d="M63.746 57.159L51.8592 49.0331C51.8592 49.0331 63.0428 45.6979 75.3961 46.2984C87.7494 46.8988 99.7615 52.8491 99.7615 52.8491L84.3778 58.7238C84.3778 58.7238 80.6192 57.555 73.9261 57.0523C67.233 56.5496 63.746 57.159 63.746 57.159Z" fill="#4F4F4F" />
      <path d="M63.746 57.159L51.8592 49.0331C51.8592 49.0331 63.0428 45.6979 75.3961 46.2984C87.7494 46.8988 99.7615 52.8491 99.7615 52.8491L84.3778 58.7238C84.3778 58.7238 80.6192 57.555 73.9261 57.0523C67.233 56.5496 63.746 57.159 63.746 57.159Z" fill={`url(#${pid}_lg3)`} fillOpacity="0.04" />

      {/* ── Cartridge housing ─────────────────────────────────────────────── */}
      <path d="M51.0961 42.5204L51.1589 48.5145C51.1656 49.1605 51.6884 49.6789 52.3345 49.674C56.0864 49.6456 68.0826 49.6094 75.9949 50.2105C83.8037 50.8037 95.128 52.5513 98.8784 53.1491C99.5579 53.2574 100.179 52.7593 100.227 52.0729L100.639 46.2209C100.674 45.7131 100.335 45.2548 99.8392 45.1406C99.3482 45.0275 99.0101 44.577 99.0388 44.0739L100.631 16.1741C100.661 15.6616 100.355 15.1896 99.87 15.0207C85.0544 9.85785 64.3028 10.9006 54.7398 12.1934C54.1831 12.2687 53.767 12.7357 53.7455 13.297L52.7032 40.45C52.685 40.9257 52.3596 41.3343 51.9 41.4586C51.4214 41.588 51.0909 42.0246 51.0961 42.5204Z" fill="#242729" />
      <path d="M51.0961 42.5204L51.1589 48.5145C51.1656 49.1605 51.6884 49.6789 52.3345 49.674C56.0864 49.6456 68.0826 49.6094 75.9949 50.2105C83.8037 50.8037 95.128 52.5513 98.8784 53.1491C99.5579 53.2574 100.179 52.7593 100.227 52.0729L100.639 46.2209C100.674 45.7131 100.335 45.2548 99.8392 45.1406C99.3482 45.0275 99.0101 44.577 99.0388 44.0739L100.631 16.1741C100.661 15.6616 100.355 15.1896 99.87 15.0207C85.0544 9.85785 64.3028 10.9006 54.7398 12.1934C54.1831 12.2687 53.767 12.7357 53.7455 13.297L52.7032 40.45C52.685 40.9257 52.3596 41.3343 51.9 41.4586C51.4214 41.588 51.0909 42.0246 51.0961 42.5204Z" fill={`url(#${pid}_lg4)`} fillOpacity="0.08" />

      {/* ── Lower stylus body ─────────────────────────────────────────────── */}
      <path fillRule="evenodd" clipRule="evenodd" d="M36.562 382.807C36.8042 382.4 37.3489 382.3 37.721 382.593C39.3678 383.89 43.5874 387.148 46.7814 389.061C50.0031 390.99 55.1951 393.39 57.1923 394.294C57.6249 394.49 57.7828 395.022 57.5293 395.424L30.2551 438.656C29.6375 439.634 28.3994 440.014 27.3481 439.53C25.1007 438.496 21.269 436.674 18.6569 435.124C16.1178 433.616 12.8899 431.368 10.9454 429.981C9.96655 429.284 9.69704 427.955 10.3118 426.922L36.562 382.807ZM32.7309 405.383C28.8867 405.423 25.803 408.572 25.8433 412.416C25.8837 416.26 29.0327 419.344 32.8768 419.304C36.7209 419.264 39.8045 416.114 39.7644 412.27C39.7241 408.426 36.5751 405.342 32.7309 405.383ZM41.6735 392.026C37.8294 392.066 34.7457 395.215 34.7859 399.059C34.8262 402.903 37.9752 405.987 41.8194 405.947C45.6633 405.906 48.7473 402.757 48.707 398.913C48.6667 395.069 45.5175 391.986 41.6735 392.026Z" fill="#373B3E" />
      <path fillRule="evenodd" clipRule="evenodd" d="M36.562 382.807C36.8042 382.4 37.3489 382.3 37.721 382.593C39.3678 383.89 43.5874 387.148 46.7814 389.061C50.0031 390.99 55.1951 393.39 57.1923 394.294C57.6249 394.49 57.7828 395.022 57.5293 395.424L30.2551 438.656C29.6375 439.634 28.3994 440.014 27.3481 439.53C25.1007 438.496 21.269 436.674 18.6569 435.124C16.1178 433.616 12.8899 431.368 10.9454 429.981C9.96655 429.284 9.69704 427.955 10.3118 426.922L36.562 382.807ZM32.7309 405.383C28.8867 405.423 25.803 408.572 25.8433 412.416C25.8837 416.26 29.0327 419.344 32.8768 419.304C36.7209 419.264 39.8045 416.114 39.7644 412.27C39.7241 408.426 36.5751 405.342 32.7309 405.383ZM41.6735 392.026C37.8294 392.066 34.7457 395.215 34.7859 399.059C34.8262 402.903 37.9752 405.987 41.8194 405.947C45.6633 405.906 48.7473 402.757 48.707 398.913C48.6667 395.069 45.5175 391.986 41.6735 392.026Z" fill={`url(#${pid}_lg5)`} fillOpacity="0.04" />

      {/* ── Second arm tube layer ─────────────────────────────────────────── */}
      <path d="M40.9755 58.2761L108.863 100.813C112.666 103.196 113.794 108.225 111.371 112.004C108.982 115.732 104.034 116.837 100.285 114.481L32.4598 71.845C28.8654 69.5856 27.6583 64.9142 29.7082 61.1963C31.9289 57.1685 37.0779 55.834 40.9755 58.2761Z" fill="#393939" />
      <path d="M25.279 72.731C23.9365 77.1025 30.5142 85.7364 35.0763 87.8197L40.9454 77.1919L35.7754 73.9707C32.8609 71.8322 26.6214 68.3595 25.279 72.731Z" fill="#403F3F" />
      <path d="M32.6513 72.056C31.4057 71.3436 29.1051 69.6666 25.0629 68.8973C24.1946 68.732 23.7716 68.9368 23.5335 69.246L29.7513 61.1469C27.3902 66.7474 30.5326 70.1728 32.6513 72.056Z" fill="#393939" />
      <path d="M34.0716 72.745C32.8261 72.0326 30.0997 70.243 27.8539 69.5769C25.6081 68.9108 24.0463 68.449 23.4767 69.3221C22.9071 70.1953 24.4492 74.2602 25.7069 76.741C25.1378 74.9704 24.9361 71.463 27.3423 71.169C29.7484 70.875 33.1929 72.2915 34.0716 72.745Z" fill="#4E4B4B" />
      <path d="M34.0716 72.745C32.8261 72.0326 30.0997 70.243 27.8539 69.5769C25.6081 68.9108 24.0463 68.449 23.4767 69.3221C22.9071 70.1953 24.4492 74.2602 25.7069 76.741C25.1378 74.9704 24.9361 71.463 27.3423 71.169C29.7484 70.875 33.1929 72.2915 34.0716 72.745Z" fill="black" fillOpacity="0.2" />

      {/* ── Pivot bearing ─────────────────────────────────────────────────── */}
      <g filter={`url(#${pid}_drop)`}>
        <circle
          cx="70.4816"
          cy="84.6161"
          r="4.51687"
          transform="rotate(-27.4641 70.4816 84.6161)"
          fill="#FFF6DE"
        />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function TurntableFramer({
  musicFile = "",
  coverImage = "",
  borderRadius = 48,
  scale = 1,
  chassisColor = "#F8F8F8",
  platterColor = "#4B4B4B",
  vinylColor = "#242529",
  vinylLabelColor = "#c8a96e",
  armTint,
  shadowColor = "rgba(0,0,0,0.25)",
  accentColor = "#e7e8e9",
  shadowBlur = 25,
  shadowSpread = 0,
  autoPlay = false,
  showPitchSlider = true,
  showUploadUI = false,
  chassisTexture = "/wood-texture.png",
  revolutionSpeed = 1.8,
  armSpringStiffness = 300,
  armSpringDamping = 30,
}: TurntableFramerProps) {

  const uid = useId().replace(/:/g, "_");

  // ── State ─────────────────────────────────────────────────────────────────
  const [isMotorRunning, setIsMotorRunning] = useState(autoPlay);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [pitch, setPitch] = useState(1.0);
  const [armAngle, setArmAngle] = useState(-27);

  // Local overrides for when showUploadUI is true (blob URLs from user-picked files)
  const [localMusic, setLocalMusic] = useState<string>("");
  const [localCover, setLocalCover] = useState<string>("");
  const musicInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const localMusicBlobRef = useRef<string>("");
  const localCoverBlobRef = useRef<string>("");

  // The effective URLs are the locally-uploaded blob (if present) or the passed prop
  const effectiveMusicFile = localMusic || musicFile || "";
  const effectiveCoverImage = localCover || coverImage || "";

  const handleMusicPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localMusicBlobRef.current) URL.revokeObjectURL(localMusicBlobRef.current);
    const url = URL.createObjectURL(file);
    localMusicBlobRef.current = url;
    setLocalMusic(url);
    e.target.value = "";
  };

  const handleCoverPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localCoverBlobRef.current) URL.revokeObjectURL(localCoverBlobRef.current);
    const url = URL.createObjectURL(file);
    localCoverBlobRef.current = url;
    setLocalCover(url);
    e.target.value = "";
  };

  // Revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      if (localMusicBlobRef.current) URL.revokeObjectURL(localMusicBlobRef.current);
      if (localCoverBlobRef.current) URL.revokeObjectURL(localCoverBlobRef.current);
    };
  }, []);

  // ── Audio ─────────────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!effectiveMusicFile) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(effectiveMusicFile);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.8;
    } else {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = effectiveMusicFile;
      audioRef.current.load();
      if (wasPlaying && isMotorRunning) {
        audioRef.current.play().catch(console.error);
      }
    }
    return () => {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.src = "";
      audioRef.current = null;
    };
  }, [effectiveMusicFile]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const isArmOnRecord = armAngle > -10 && armAngle < 30;
    if (isMotorRunning && isArmOnRecord && !isScrubbing) {
      audio.playbackRate = pitch;
      if (audio.paused) audio.play().catch(() => {});
    } else {
      if (!audio.paused) audio.pause();
    }
    if (!audio.paused) audio.playbackRate = pitch;
  }, [isMotorRunning, isScrubbing, armAngle, pitch]);

  // ── Arm helpers ───────────────────────────────────────────────────────────
  const handleScrub = (deltaTime: number) => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    a.currentTime = (a.currentTime + deltaTime + a.duration) % a.duration;
  };

  const handleDragEnd = () => {
    if (armAngle < -20) setArmAngle(-27);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: 720,
        height: 540,
      }}
    >
      {/* ── Chassis ────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          userSelect: "none",
          width: 720,
          height: 540,
          borderRadius,
          backgroundColor: chassisColor,
          boxShadow: `0 25px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`,
        }}
      >
        {/* ── Wood-grain texture overlay (matches Chassis.tsx) ────────────── */}
        {chassisTexture && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${chassisTexture})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.4,
              borderRadius,
              pointerEvents: "none",
            }}
          />
        )}

        {/* ── Tone-arm base plate — rendered BEFORE platter so vinyl sits on top ── */}
        <svg
          style={{ position: "absolute", pointerEvents: "none", left: 475, top: 30 }}
          width="195"
          height="195"
          viewBox="0 0 194.562 194.562"
          fill="none"
          overflow="visible"
        >
          <defs>
            <filter
              id={`${uid}_armBase`}
              x="0" y="0" width="194.562" height="194.562"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feMorphology radius="9.98177" operator="erode" in="SourceAlpha" result="effect1_innerShadow" />
              <feOffset />
              <feGaussianBlur stdDeviation="4.99089" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.333 0 0 0 0 0.333 0 0 0 0 0.333 0 0 0 0.05 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_result" />
            </filter>
          </defs>
          <g filter={`url(#${uid}_armBase)`}>
            <circle
              cx="97.2812"
              cy="97.2812"
              r="97.2812"
              fill={chassisColor}
              fillOpacity={0.5}
              paintOrder="stroke fill"
            />
          </g>
        </svg>

        {/* ── Platter zone ─────────────────────────────────────────────────── */}
        <PlatterInner
          isPlaying={isMotorRunning}
          playbackRate={pitch}
          onScrub={handleScrub}
          onScrubStart={() => setIsScrubbing(true)}
          onScrubEnd={() => setIsScrubbing(false)}
          coverImage={effectiveCoverImage}
          vinylColor={vinylColor}
          platterColor={platterColor}
          vinylLabelColor={vinylLabelColor}
          revolutionSpeed={revolutionSpeed}
          uid={uid}
        />

        {/* ── Tone arm ────────────────────────────────────────────────────── */}
        <ToneArmInner
          angle={armAngle}
          onAngleChange={setArmAngle}
          onDragEnd={handleDragEnd}
          springStiffness={armSpringStiffness}
          springDamping={armSpringDamping}
          armTint={armTint}
          uid={uid}
        />

        {/* ── Start / Stop button ─────────────────────────────────────────── */}
        <StartButtonInner
          isPlaying={isMotorRunning}
          onToggle={() => setIsMotorRunning((p) => !p)}
          accentColor={accentColor}
        />

        {/* ── Pitch slider ────────────────────────────────────────────────── */}
        {showPitchSlider && (
          <PitchSliderInner
            value={pitch}
            onChange={setPitch}
            accentColor={accentColor}
          />
        )}

        {/* ── Upload UI (showUploadUI=true only) ──────────────────────────── */}
        {showUploadUI && (
          <>
            <input ref={musicInputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.aac,.flac" style={{ display: "none" }} onChange={handleMusicPick} />
            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverPick} />
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 8,
                zIndex: 300,
              }}
            >
              {([ 
                { label: effectiveMusicFile ? "♫ Music ✓" : "Upload MP3", onClick: () => musicInputRef.current?.click() },
                { label: effectiveCoverImage ? "⬛ Cover ✓" : "Upload Cover", onClick: () => coverInputRef.current?.click() },
              ] as { label: string; onClick: () => void }[]).map(({ label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(8px)",
                    color: "#fff",
                    fontSize: 11,
                    fontFamily: "system-ui, sans-serif",
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Inner-shadow rim overlay ─────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 200,
            borderRadius,
            boxShadow: "inset 0px 0px 11px 11px rgba(152,152,152,0.26)",
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATTER (internal)
// ─────────────────────────────────────────────────────────────────────────────

interface PlatterInnerProps {
  isPlaying: boolean;
  playbackRate: number;
  onScrub: (dt: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  coverImage?: string;
  vinylColor: string;
  platterColor: string;
  vinylLabelColor: string;
  revolutionSpeed: number;
  uid: string;
}

function PlatterInner({
  isPlaying,
  playbackRate,
  onScrub,
  onScrubStart,
  onScrubEnd,
  coverImage,
  vinylColor,
  platterColor,
  vinylLabelColor,
  revolutionSpeed,
  uid,
}: PlatterInnerProps) {
  const safeRate = playbackRate > 0 ? playbackRate : 1;
  const duration = revolutionSpeed / safeRate;

  const rotate = useMotionValue(0);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const isDragging = useRef(false);
  const platterRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef(0);

  const startSpinRef = useRef<() => void>(() => {});
  startSpinRef.current = () => {
    animRef.current = animate(rotate, rotate.get() + 360, {
      duration,
      ease: "linear",
      onComplete: () => startSpinRef.current(),
    });
  };

  const stopSpin = () => {
    animRef.current?.stop();
    animRef.current = null;
  };

  useEffect(() => {
    if (isPlaying && !isDragging.current) startSpinRef.current();
    else stopSpin();
    return stopSpin;
  }, [isPlaying, duration]);

  const getCenter = () => {
    const r = platterRef.current!.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    stopSpin();
    const { cx, cy } = getCenter();
    lastAngleRef.current = Math.atan2(e.clientY - cy, e.clientX - cx);
    onScrubStart();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const { cx, cy } = getCenter();
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
    let delta = angle - lastAngleRef.current;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    lastAngleRef.current = angle;
    rotate.set(rotate.get() + delta * (180 / Math.PI));
    onScrub((delta / (2 * Math.PI)) * revolutionSpeed);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    onScrubEnd();
    if (isPlaying) startSpinRef.current();
  };

  return (
    <div
      ref={platterRef}
      style={{
        position: "absolute",
        top: 30,
        left: 38,
        width: 480,
        height: 480,
        overflow: "hidden",
        borderRadius: "50%",
      }}
    >
      {/* Static platter mat */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 35% 35%, #3a3a3a 0%, #1a1a1a 60%, #0d0d0d 100%)",
        }}
      />

      {/* Rotating vinyl */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          rotate,
          transformOrigin: "center center",
          touchAction: "none",
          cursor: "grab",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Outer ring */}
        <div style={{ position: "absolute", left: 19.82, top: 19.81, width: 440.37, height: 440.37 }}>
          <DiskOuter color={platterColor} filterId={`${uid}_diskOuter`} />
        </div>

        {/* Vinyl body */}
        <div style={{ position: "absolute", left: 25.57, top: 25.57, width: 428.868, height: 428.868 }}>
          <DiskRing size={428.868} color={vinylColor} filterId={`${uid}_diskMain`} />
        </div>

        {/* Groove ring 1 */}
        <div style={{ position: "absolute", left: 63.36, top: 63.36, width: 353.282, height: 353.282 }}>
          <DiskRing size={353.282} color={vinylColor} filterId={`${uid}_groove1`} />
        </div>

        {/* Groove ring 2 */}
        <div style={{ position: "absolute", left: 95.41, top: 95.4, width: 289.198, height: 289.198 }}>
          <DiskRing size={289.198} color={vinylColor} filterId={`${uid}_groove2`} />
        </div>

        {/* Album art label */}
        <div
          style={{
            position: "absolute",
            left: 134.02,
            top: 134.02,
            width: 211.969,
            height: 211.969,
            borderRadius: "50%",
            overflow: "hidden",
            backgroundColor: vinylLabelColor,
          }}
        >
          {coverImage && (
            <img
              src={coverImage}
              alt="Album cover"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              draggable={false}
            />
          )}
          {!coverImage && (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `radial-gradient(circle at center, ${vinylLabelColor} 0%, rgba(0,0,0,0.4) 100%)`,
              }}
            />
          )}
        </div>

        {/* Centre hub */}
        <div style={{ position: "absolute", left: 211.25, top: 211.25, width: 57.511, height: 57.511 }}>
          <DiskRing size={57.511} color={vinylColor} filterId={`${uid}_hub`} />
        </div>

        {/* Centre pin */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: 21.3612,
            height: 21.3612,
          }}
        >
          <CenterPin />
        </div>

        {/* Light flare — no overflow needed; platter container clips it */}
        <div
          style={{ position: "absolute", pointerEvents: "none", left: -52.93, top: -52.92, width: 585.849, height: 585.846, opacity: 0.6 }}
        >
          <DiskLightEffect />
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TONE ARM (internal)
// ─────────────────────────────────────────────────────────────────────────────

interface ToneArmInnerProps {
  angle: number;
  onAngleChange: (a: number) => void;
  onDragEnd: () => void;
  springStiffness: number;
  springDamping: number;
  armTint?: string;
  uid: string;
}

function ToneArmInner({
  angle,
  onAngleChange,
  onDragEnd,
  springStiffness,
  springDamping,
  armTint,
  uid,
}: ToneArmInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartCursor = useRef(0);
  const dragStartAngle = useRef(0);

  const ASSET_ROTATION = -27.46;
  const MIN_ANGLE = -35;
  const MAX_ANGLE = 30;
  const POS_LEFT = 501.8;
  const POS_TOP = 42.66;
  const PIVOT_X = 70.48;
  const PIVOT_Y = 84.62;

  const getPivot = () => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const s = rect.width / 145;
    return { x: rect.left + PIVOT_X * s, y: rect.top + PIVOT_Y * s };
  };

  const cursorAngle = (cx: number, cy: number) => {
    const p = getPivot();
    if (!p) return 0;
    return Math.atan2(cy - p.y, cx - p.x) * (180 / Math.PI) - 90;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartCursor.current = cursorAngle(e.clientX, e.clientY);
    dragStartAngle.current = angle;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const curr = cursorAngle(e.clientX, e.clientY);
    let delta = curr - dragStartCursor.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    onAngleChange(Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, dragStartAngle.current + delta)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    onDragEnd();
  };

  const tintStyle: React.CSSProperties = armTint
    ? { filter: `sepia(1) saturate(3) hue-rotate(${armTint})` }
    : {};

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        pointerEvents: "none",
        zIndex: 35,
        userSelect: "none",
        left: POS_LEFT,
        top: POS_TOP,
        width: 145,
        height: 464,
        ...tintStyle,
      }}
    >
      <motion.div
        animate={{ rotate: angle - ASSET_ROTATION }}
        style={{
          position: "absolute",
          inset: 0,
          originX: `${PIVOT_X}px`,
          originY: `${PIVOT_Y}px`,
        }}
        transition={
          isDragging
            ? { duration: 0 }
            : { type: "spring", stiffness: springStiffness, damping: springDamping, mass: 0.8 }
        }
      >
        <ArmSvg uniqueId={uid} />
        <div
          style={{
            position: "absolute",
            top: 90,
            left: 5,
            width: 100,
            height: 330,
            touchAction: "none",
            cursor: "grab",
            pointerEvents: "auto",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// START BUTTON (internal)
// ─────────────────────────────────────────────────────────────────────────────

function StartButtonInner({
  isPlaying,
  onToggle,
  accentColor,
}: {
  isPlaying: boolean;
  onToggle: () => void;
  accentColor: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 38,
        bottom: 30,
        width: 72,
        height: 72,
        borderRadius: 47,
        cursor: "pointer",
        touchAction: "none",
        userSelect: "none",
        zIndex: 30,
        overflow: "hidden",
        border: "4px solid #6a6a6a",
        background:
          "linear-gradient(119.36deg, rgba(81,83,86,0.3) 0%, rgba(0,0,0,0.3) 100%), linear-gradient(90deg, #28292B 0%, #28292B 100%)",
      }}
      onClick={onToggle}
      aria-label={isPlaying ? "Stop" : "Start"}
    >
      {/* Inner circle */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 56,
          height: 56,
        }}
      >
        <svg style={{ position: "absolute", display: "block", width: "100%", height: "100%" }} viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="28" fill="#252527" />
        </svg>
      </div>

      {/* Icon */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isPlaying ? (
          /* Pause / stop icon */
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M3.79981 1.84646e-06C4.46454 -3.36351e-05 5.03742 -0.000141959 5.4961 0.0615253C5.98766 0.127628 6.45862 0.277012 6.84082 0.659182C7.223 1.04136 7.37236 1.51236 7.43848 2.00391C7.50014 2.46255 7.50004 3.03552 7.5 3.7002V13.7998C7.50004 14.4645 7.50014 15.0374 7.43848 15.4961C7.37236 15.9876 7.223 16.4586 6.84082 16.8408C6.45862 17.223 5.98767 17.3724 5.4961 17.4385C5.03742 17.5001 4.46454 17.5 3.79981 17.5H3.70117C3.03631 17.5 2.46265 17.5002 2.00391 17.4385C1.5124 17.3724 1.04133 17.223 0.659182 16.8408C0.277039 16.4586 0.127635 15.9876 0.0615253 15.4961C-0.000138188 15.0374 -3.36535e-05 14.4645 1.82414e-06 13.7998V3.7002C-3.36532e-05 3.03552 -0.000137928 2.46255 0.0615253 2.00391C0.127636 1.51238 0.277038 1.04136 0.659182 0.659182C1.04134 0.277028 1.5124 0.127648 2.00391 0.0615253C2.46264 -0.00014978 3.03633 -3.36419e-05 3.70117 1.84646e-06H3.79981ZM13.7998 1.84646e-06C14.4645 -3.36312e-05 15.0374 -0.000138184 15.4961 0.0615253C15.9876 0.127639 16.4586 0.276998 16.8408 0.659182C17.223 1.04137 17.3724 1.51236 17.4385 2.00391C17.5001 2.46255 17.5 3.03552 17.5 3.7002V13.7998C17.5 14.4645 17.5001 15.0374 17.4385 15.4961C17.3724 15.9876 17.223 16.4586 16.8408 16.8408C16.4586 17.223 15.9876 17.3724 15.4961 17.4385C15.0374 17.5001 14.4645 17.5 13.7998 17.5H13.7002C13.0355 17.5 12.4626 17.5001 12.0039 17.4385C11.5124 17.3724 11.0414 17.223 10.6592 16.8408C10.277 16.4586 10.1276 15.9876 10.0615 15.4961C9.99986 15.0374 9.99997 14.4645 10 13.7998V3.7002C9.99997 3.03552 9.99986 2.46255 10.0615 2.00391C10.1276 1.51236 10.277 1.04137 10.6592 0.659182C11.0414 0.276997 11.5124 0.12764 12.0039 0.0615253C12.4626 -0.000137931 13.0355 -3.36309e-05 13.7002 1.84646e-06H13.7998Z"
              fill="#4CC35B"
            />
          </svg>
        ) : (
          /* Play icon */
          <svg width="15.5" height="16.5" viewBox="0 0 15.5 16.5001" fill="none">
            <path
              d="M9.69054 2.58706C11.3235 3.51475 12.6067 4.24375 13.5209 4.91154C14.4413 5.58392 15.1221 6.2867 15.3659 7.21321C15.5447 7.89269 15.5447 8.60743 15.3659 9.28691C15.1221 10.2134 14.4413 10.9162 13.5209 11.5886C12.6067 12.2564 11.3235 12.9854 9.69059 13.913C8.11319 14.8092 6.78303 15.5649 5.77322 15.9944C4.7553 16.4274 3.82729 16.6468 2.92536 16.3912C2.26252 16.2034 1.65941 15.8469 1.17356 15.3567C0.514188 14.6914 0.24951 13.772 0.124288 12.6654C-1.76951e-05 11.567 -9.82927e-06 10.129 1.79089e-07 8.30017V8.19997C-9.82927e-06 6.37108 -1.76951e-05 4.93315 0.124288 3.8347C0.24951 2.72816 0.514188 1.80867 1.17356 1.14341C1.65941 0.653232 2.26252 0.296724 2.92536 0.108895C3.82729 -0.146689 4.7553 0.0727526 5.77322 0.505712C6.78303 0.93522 8.11316 1.6909 9.69054 2.58706Z"
              fill="white"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PITCH SLIDER (internal)
// ─────────────────────────────────────────────────────────────────────────────

function PitchSliderInner({
  value,
  onChange,
  accentColor,
}: {
  value: number;
  onChange: (v: number) => void;
  accentColor: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draft, setDraft] = useState<number | null>(null);

  const GROOVE_H = 223;
  const GROOVE_TOP = 12.5;

  const valToY = (v: number) => ((1.08 - Math.max(0.92, Math.min(1.08, v))) / 0.16) * GROOVE_H;
  const yToVal = (y: number) => 1.08 - (y / GROOVE_H) * 0.16;

  const valueFromEvent = (e: React.PointerEvent) => {
    if (!trackRef.current) return null;
    const rect = trackRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(GROOVE_H, e.clientY - (rect.top + GROOVE_TOP)));
    return yToVal(y);
  };

  const display = isDragging && draft !== null ? draft : value;
  const knobY = valToY(display);

  return (
    <div
      style={{
        position: "absolute",
        userSelect: "none",
        zIndex: 30,
        left: 607,
        top: 245.8,
        width: 60.5,
        height: 264,
        fontFamily: "'Bree Serif', serif",
      }}
    >
      {/* Tick labels */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 12,
          width: 7,
          height: 223,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 8,
          lineHeight: 1,
          pointerEvents: "none",
          opacity: 0.5,
          color: accentColor,
        }}
      >
        {["+8", "6", "4", "2", "", "2", "4", "6", "-8"].map((l, i) => (
          <div key={i} style={{ height: 4, display: "flex", alignItems: "center" }}>
            <span style={{ opacity: l === "" ? 0 : 1 }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Tick marks */}
      <div
        style={{
          position: "absolute",
          left: 9,
          top: 12,
          width: 4,
          height: 223,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ width: "100%", height: 4, flexShrink: 0, backgroundColor: accentColor }} />
        ))}
      </div>

      {/* Groove line */}
      <div
        style={{
          position: "absolute",
          left: 13,
          top: 12,
          height: 223,
          width: 1,
          pointerEvents: "none",
          opacity: 0.5,
          backgroundColor: accentColor,
        }}
      />

      {/* Slider body */}
      <div style={{ position: "absolute", left: 21, top: 0, width: 40, height: 264 }}>
        <div
          ref={trackRef}
          style={{ position: "relative", width: 40, height: 248, cursor: "grab", touchAction: "none" }}
          onPointerDown={(e) => {
            setIsDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            const v = valueFromEvent(e);
            if (v !== null) setDraft(v);
          }}
          onPointerMove={(e) => {
            if (!isDragging) return;
            const v = valueFromEvent(e);
            if (v !== null) setDraft(v);
          }}
          onPointerUp={(e) => {
            if (!isDragging) return;
            setIsDragging(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
            const committed = draft ?? value;
            setDraft(null);
            onChange(Math.abs(committed - 1.0) < 0.005 ? 1.0 : committed);
          }}
          onPointerLeave={(e) => {
            if (!isDragging) return;
            setIsDragging(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
            const committed = draft ?? value;
            setDraft(null);
            onChange(Math.abs(committed - 1.0) < 0.005 ? 1.0 : committed);
          }}
        >
          {/* Track background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 8,
              pointerEvents: "none",
              opacity: 0.5,
              backgroundColor: "#f4f4f4",
              boxShadow: "inset 0px 0px 7px 2px rgba(0,0,0,0.03)",
            }}
          />

          {/* Groove */}
          <div
            style={{
              position: "absolute",
              left: 17,
              top: GROOVE_TOP,
              width: 6,
              height: GROOVE_H,
              borderRadius: 99,
              pointerEvents: "none",
              backgroundColor: accentColor,
              opacity: 0.5,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 99,
                boxShadow: "inset -2px 0px 6px 1px rgba(215,215,215,0.3)",
              }}
            />
          </div>

          {/* Knob */}
          <div
            style={{
              position: "absolute",
              left: 3.8,
              width: 32,
              height: 40,
              top: `calc(${GROOVE_TOP}px + ${knobY}px - 18.5px)`,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 9,
                backgroundColor: "#333",
                boxShadow: "0px 1px 12px 4px rgba(0,0,0,0.1)",
              }}
            />
            {/* Accent stripe */}
            <div
              style={{
                position: "absolute",
                left: 0,
                width: "100%",
                height: 3,
                top: 18.5,
                backgroundColor: accentColor === "#e7e8e9" ? "#fcdf92" : accentColor,
              }}
            />
          </div>
        </div>

        {/* PITCH label */}
        <div style={{ position: "absolute", bottom: 0, width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: 8, fontFamily: "serif", lineHeight: 1, opacity: 0.7, color: accentColor, margin: 0 }}>PITCH</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT (required by Framer)
// ─────────────────────────────────────────────────────────────────────────────

export default TurntableFramer;

// ─────────────────────────────────────────────────────────────────────────────
// FRAMER PROPERTY CONTROLS
//
// • Inside Framer: the real "framer" package resolves → controls appear in the
//   property panel (Upload Music, Upload Cover, colours, etc.)
// • Outside Framer (Vite, Next.js, etc.): vite.config.ts aliases "framer" to
//   src/framer-stub.ts which exports a no-op addPropertyControls → build passes.
// ─────────────────────────────────────────────────────────────────────────────

addPropertyControls(TurntableFramer, {
    // ── Media ──────────────────────────────────────────────────────────────
    musicFile: {
      type: ControlType.File,
      title: "Upload Music",
      allowedFileTypes: ["mp3", "wav", "ogg", "aac", "flac"],
    },
    coverImage: {
      type: ControlType.Image,
      title: "Upload Cover",
    },

    // ── Shape & Size ───────────────────────────────────────────────────────
    borderRadius: {
      type: ControlType.Number,
      title: "Border Radius",
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 48,
      displayStepper: true,
    },
    scale: {
      type: ControlType.Number,
      title: "Scale",
      min: 0.3,
      max: 2,
      step: 0.05,
      defaultValue: 1,
      displayStepper: true,
    },

    // ── Colors ─────────────────────────────────────────────────────────────
    chassisColor: {
      type: ControlType.Color,
      title: "Chassis Color",
      defaultValue: "#F8F8F8",
    },
    platterColor: {
      type: ControlType.Color,
      title: "Platter Ring",
      defaultValue: "#4B4B4B",
    },
    vinylColor: {
      type: ControlType.Color,
      title: "Vinyl Body",
      defaultValue: "#242529",
    },
    vinylLabelColor: {
      type: ControlType.Color,
      title: "Label Color",
      defaultValue: "#c8a96e",
    },
    accentColor: {
      type: ControlType.Color,
      title: "Accent Color",
      defaultValue: "#e7e8e9",
    },
    shadowColor: {
      type: ControlType.Color,
      title: "Shadow Color",
      defaultValue: "rgba(0,0,0,0.25)",
    },

    // ── Shadow ─────────────────────────────────────────────────────────────
    shadowBlur: {
      type: ControlType.Number,
      title: "Shadow Blur",
      min: 0,
      max: 80,
      step: 1,
      defaultValue: 25,
    },
    shadowSpread: {
      type: ControlType.Number,
      title: "Shadow Spread",
      min: 0,
      max: 40,
      step: 1,
      defaultValue: 0,
    },

    // ── Behaviour ──────────────────────────────────────────────────────────
    autoPlay: {
      type: ControlType.Boolean,
      title: "Auto Play",
      defaultValue: false,
      enabledTitle: "On",
      disabledTitle: "Off",
    },
    showPitchSlider: {
      type: ControlType.Boolean,
      title: "Pitch Slider",
      defaultValue: true,
      enabledTitle: "Show",
      disabledTitle: "Hide",
    },
    revolutionSpeed: {
      type: ControlType.Number,
      title: "Rev Speed (s)",
      min: 0.5,
      max: 5,
      step: 0.1,
      defaultValue: 1.8,
      description: "Seconds per full revolution at 1× pitch.",
    },
    armSpringStiffness: {
      type: ControlType.Number,
      title: "Arm Stiffness",
      min: 50,
      max: 800,
      step: 10,
      defaultValue: 300,
    },
    armSpringDamping: {
      type: ControlType.Number,
      title: "Arm Damping",
      min: 5,
      max: 80,
      step: 1,
      defaultValue: 30,
    },
  });
