import type { ImageRenderer, DocsPageData, BlogPageData } from '@acid-info/docusaurus-og'
import { readFileSync } from 'fs'
import { join } from 'path'
import React from 'react'

interface PagesPageData {
  route?: string
  metadata?: {
    permalink?: string
    title?: string
  }
}

const BASE_WIDTH = 1200
const BASE_HEIGHT = 630

const fonts = [
  {
    name: 'Adwaita Sans',
    data: readFileSync(
      join(__dirname, '../static/fonts/AdwaitaSans-Regular.ttf'),
    ),
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'Adwaita Sans',
    data: readFileSync(
      join(__dirname, '../static/fonts/AdwaitaSans-Medium.ttf'),
    ),
    weight: 500 as const,
    style: 'normal' as const,
  },
  {
    name: 'Adwaita Sans',
    data: readFileSync(
      join(__dirname, '../static/fonts/AdwaitaSans-SemiBold.ttf'),
    ),
    weight: 600 as const,
    style: 'normal' as const,
  },
  {
    name: 'Adwaita Sans',
    data: readFileSync(
      join(__dirname, '../static/fonts/AdwaitaSans-Bold.ttf'),
    ),
    weight: 700 as const,
    style: 'normal' as const,
  },
  {
    name: 'Adwaita Sans',
    data: readFileSync(
      join(__dirname, '../static/fonts/AdwaitaSans-ExtraBold.ttf'),
    ),
    weight: 800 as const,
    style: 'normal' as const,
  },
  {
    name: 'FiraCode Nerd Font Mono',
    data: readFileSync(
      join(__dirname, '../static/fonts/FiraCodeNerdFontMono-Regular.ttf'),
    ),
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'FiraCode Nerd Font Mono',
    data: readFileSync(
      join(__dirname, '../static/fonts/FiraCodeNerdFontMono-Bold.ttf'),
    ),
    weight: 700 as const,
    style: 'normal' as const,
  },
]

const logoPng = readFileSync(
  join(__dirname, '../static/img/path32.png')
)

const logoDataUrl = `data:image/png;base64,${logoPng.toString('base64')}`

export const docs: ImageRenderer<DocsPageData> = (data) => {
  const getCategoryFromPath = (permalink: string): string => {
    const segments = permalink.split('/').filter(Boolean)
    if (segments.length > 1 && segments[0] === 'docs') {
      const categorySlug = segments[1]
      const categoryMap: Record<string, string> = {
        'dankmaterialshell': 'DMS',
        'dankgreeter': 'DMS Greeter',
        'dgop': 'dgop',
        'danksearch': 'dsearch',
      }
      return categoryMap[categorySlug] || 'Dank Linux'
    }
    return 'Dank Linux'
  }

  const category = getCategoryFromPath(data.metadata.permalink)
  const title = data.metadata.title

  return [
    <div
      style={{
        display: 'flex',
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        background: 'linear-gradient(135deg, #1a1318 0%, #2d1b3d 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontSmooth: 'always',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 50%, rgba(128, 90, 213, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(208, 188, 255, 0.12) 0%, transparent 50%)',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: '60px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <img
          src={logoDataUrl}
          style={{
            position: 'absolute',
            top: '50px',
            right: '50px',
            opacity: 0.6,
            width: '120px',
            height: '120px',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '54px',
              color: '#B794F4',
              fontFamily: 'Adwaita Sans',
              fontWeight: 500,
              marginLeft: '4px',
              marginBottom: '18px',
              letterSpacing: '0.5px',
            }}
          >
            {category}
          </div>

          <div
            style={{
              fontSize: '96px',
              color: '#ffffff',
              fontFamily: 'Adwaita Sans',
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: '1000px',
            }}
          >
            {title}
          </div>
        </div>

        {/* <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            borderTop: '2px solid rgba(208, 188, 255, 0.2)',
            paddingTop: '30px',
          }}
        >
          <div
            style={{
              fontSize: '36px',
              color: '#ffffff',
              fontFamily: 'Adwaita Sans',
              fontWeight: 500,
            }}
          >
            Dank Linux
          </div>
        </div> */}
      </div>
    </div>,
    {
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
      fonts,
    },
  ]
}

export const pages: ImageRenderer<PagesPageData> = (data) => {
  const route = data.route || data.metadata?.permalink || '/'
  const isHomePage = route === '/'
  const isPluginsPage = route === '/plugins' || route === '/plugins/'

  if (isPluginsPage) {
    return [
      <div
        style={{
          display: 'flex',
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          background: '#000000',
          position: 'relative',
          overflow: 'hidden',
          fontSmooth: 'always',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 10% 20%, rgba(128, 90, 213, 0.3) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(208, 188, 255, 0.05) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(107, 70, 193, 0.2) 0%, transparent 35%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(to bottom, rgba(208, 188, 255, 0.03) 1px, transparent 1px), linear-gradient(to right, rgba(208, 188, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: '60px',
            position: 'relative',
            zIndex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            <img
              src={logoDataUrl}
              style={{
                width: '80px',
                height: '80px',
              }}
            />
            <div
              style={{
                fontSize: '48px',
                fontFamily: 'Adwaita Sans',
                fontWeight: 800,
                color: '#fffffff2',
                letterSpacing: '0.08em',
                textRendering: 'optimizeLegibility',
                fontSmooth: 'always',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                lineHeight: 1,
              }}
            >
              DANK LINUX
            </div>
          </div>

          <div
            style={{
              fontSize: '96px',
              fontWeight: 800,
              letterSpacing: '-2px',
              background: 'linear-gradient(135deg, #D0BCFF 0%, #805AD5 50%, #6B46C1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              textRendering: 'optimizeLegibility',
              fontSmooth: 'always',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textAlign: 'center',
            }}
          >
            Plugin Registry
          </div>
        </div>
      </div>,
      {
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        fonts,
      },
    ]
  }

  return [
    <div
      style={{
        display: 'flex',
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        background: '#000000',
        position: 'relative',
        overflow: 'hidden',
        fontSmooth: 'always',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 10% 20%, rgba(128, 90, 213, 0.3) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(208, 188, 255, 0.05) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(107, 70, 193, 0.2) 0%, transparent 35%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(to bottom, rgba(208, 188, 255, 0.03) 1px, transparent 1px), linear-gradient(to right, rgba(208, 188, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: '60px',
          position: 'relative',
          zIndex: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            paddingTop: '20px',
            width: '100%',
          }}
        >
          <img
            src={logoDataUrl}
            style={{
              width: '80px',
              height: '80px',
            }}
          />
          <div
            style={{
              fontSize: '48px',
              fontFamily: 'Adwaita Sans',
              fontWeight: 800,
              color: '#fffffff2',
              letterSpacing: '0.08em',
              textRendering: 'optimizeLegibility',
              fontSmooth: 'always',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              lineHeight: 1,
            }}
          >
            DANK LINUX
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'Adwaita Sans',
            lineHeight: 1.1,
            textAlign: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '96px',
              fontWeight: 800,
              letterSpacing: '-2px',
              color: '#ffffff',
              textRendering: 'optimizeLegibility',
              fontSmooth: 'always',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            Modern Desktop
          </div>

          <div
            style={{
              fontSize: '80px',
              fontWeight: 800,
              letterSpacing: '-2px',
              color: '#ffffff',
              textRendering: 'optimizeLegibility',
              fontSmooth: 'always',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            for
          </div>

          <div
            style={{
              fontSize: '96px',
              fontWeight: 800,
              letterSpacing: '-2px',
              background: 'linear-gradient(135deg, #D0BCFF 0%, #805AD5 50%, #6B46C1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              textRendering: 'optimizeLegibility',
              fontSmooth: 'always',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            Wayland
          </div>
        </div>

        <div style={{ height: '40px' }} />
      </div>
    </div>,
    {
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
      fonts,
    },
  ]
}

export const blog: ImageRenderer<BlogPageData> = (data) => {
  // Handle different blog page types
  let title = 'Blog'
  let isV1Release = false
  let isV12Release = false

  if (data.pageType === 'post' && data.data) {
    const postData = data.data as Record<string, unknown>
    const metadata = postData.metadata as Record<string, unknown> | undefined
    title = String(metadata?.title || postData.title || 'Blog')
    // Check for v1 release post
    const id = String(postData.id || '')
    const permalink = String(metadata?.permalink || '')
    isV1Release = id === 'v1-release' || permalink.includes('v1-release') || title.includes('1.0')
    isV12Release = id === 'v1.2-release' || permalink.includes('v1.2-release') || title.includes('1.2')
  } else if (data.pageType === 'tag' && 'label' in data.data) {
    title = `Tag: ${String(data.data.label)}`
  } else if (data.pageType === 'archive') {
    title = 'Blog Archive'
  } else if (data.pageType === 'tags') {
    title = 'Blog Tags'
  }

  // Special OG image for v1 release - matches blog hero with bats and confetti
  if (isV1Release) {
    const BatSvg = ({ color, size, opacity }: { color: string; size: number; opacity: number }) => (
      <svg
        width={size}
        height={size * 0.5}
        viewBox="0 0 100 50"
        style={{ display: 'flex' }}
      >
        <path
          d="M45 12.5 L50 17.5 L55 12.5 L60 17.5 L70 12.5 L85 7.5 L100 15 L85 25 L75 20 L65 27.5 L58 22.5 L50 32.5 L42 22.5 L35 27.5 L25 20 L15 25 L0 15 L15 7.5 L30 12.5 L40 17.5 Z"
          fill={color}
          opacity={opacity}
        />
      </svg>
    )

    return [
      <div
        style={{
          display: 'flex',
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          backgroundColor: '#0d0d0d',
          position: 'relative',
          overflow: 'hidden',
          fontSmooth: 'always',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(208, 188, 255, 0.2) 0%, transparent 60%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(128, 90, 213, 0.06) 0%, transparent 100%)',
          }}
        />

        {/* Sparkle confetti layer */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: `
              radial-gradient(circle at 10% 20%, #D0BCFF 2px, transparent 2px),
              radial-gradient(circle at 40% 70%, #805AD5 2px, transparent 2px),
              radial-gradient(circle at 70% 25%, #B794F4 1.5px, transparent 1.5px),
              radial-gradient(circle at 90% 60%, #9F7AEA 2px, transparent 2px),
              radial-gradient(circle at 25% 85%, #D0BCFF 1.5px, transparent 1.5px),
              radial-gradient(circle at 60% 45%, #805AD5 2px, transparent 2px),
              radial-gradient(circle at 85% 80%, #B794F4 1.5px, transparent 1.5px),
              radial-gradient(circle at 15% 50%, #9F7AEA 1.5px, transparent 1.5px),
              radial-gradient(circle at 22% 32%, #D0BCFF 2px, transparent 2px),
              radial-gradient(circle at 78% 55%, #805AD5 1.5px, transparent 1.5px),
              radial-gradient(circle at 52% 18%, #B794F4 2px, transparent 2px),
              radial-gradient(circle at 8% 75%, #9F7AEA 1.5px, transparent 1.5px),
              radial-gradient(circle at 88% 28%, #D0BCFF 1.5px, transparent 1.5px),
              radial-gradient(circle at 33% 58%, #805AD5 2px, transparent 2px),
              radial-gradient(circle at 67% 82%, #B794F4 1.5px, transparent 1.5px),
              radial-gradient(circle at 45% 12%, #9F7AEA 2px, transparent 2px)
            `,
            opacity: 0.5,
          }}
        />

        {/* Bat silhouettes - left side */}
        <div style={{ display: 'flex', position: 'absolute', top: '20%', left: '3%', transform: 'rotate(-15deg)' }}>
          <BatSvg color="#805AD5" size={70} opacity={0.55} />
        </div>
        <div style={{ display: 'flex', position: 'absolute', top: '44%', left: '4%', transform: 'rotate(-8deg)' }}>
          <BatSvg color="#9F7AEA" size={55} opacity={0.5} />
        </div>
        <div style={{ display: 'flex', position: 'absolute', top: '68%', left: '5%', transform: 'rotate(-20deg)' }}>
          <BatSvg color="#B794F4" size={50} opacity={0.45} />
        </div>

        {/* Bat silhouettes - right side */}
        <div style={{ display: 'flex', position: 'absolute', top: '22%', left: '88%', transform: 'rotate(12deg)' }}>
          <BatSvg color="#B794F4" size={60} opacity={0.5} />
        </div>
        <div style={{ display: 'flex', position: 'absolute', top: '46%', left: '86%', transform: 'rotate(18deg)' }}>
          <BatSvg color="#805AD5" size={75} opacity={0.55} />
        </div>
        <div style={{ display: 'flex', position: 'absolute', top: '70%', left: '89%', transform: 'rotate(8deg)' }}>
          <BatSvg color="#9F7AEA" size={55} opacity={0.5} />
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '24px',
              fontFamily: 'Adwaita Sans',
            }}
          >
            <div
              style={{
                fontSize: '180px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-4px',
              }}
            >
              DMS
            </div>
            <div
              style={{
                fontSize: '180px',
                fontWeight: 800,
                letterSpacing: '-4px',
                background: 'linear-gradient(135deg, #D0BCFF 0%, #805AD5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              1.0
            </div>
          </div>

          <div
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: 'rgba(208, 188, 255, 0.4)',
              fontFamily: 'Adwaita Sans',
              marginTop: '16px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}
          >
            The Dark Knight
          </div>
        </div>
      </div>,
      {
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        fonts,
      },
    ]
  }

  // Special OG image for v1.2 release - Spicy Miso
  if (isV12Release) {
    return [
      <div
        style={{
          display: 'flex',
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          background: '#000000',
          position: 'relative',
          overflow: 'hidden',
          fontSmooth: 'always',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {/* Radial gradient overlays - warm red/orange tones */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 10% 20%, rgba(239, 68, 68, 0.3) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(251, 146, 60, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.2) 0%, transparent 35%)',
          }}
        />

        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(to bottom, rgba(251, 146, 60, 0.03) 1px, transparent 1px), linear-gradient(to right, rgba(251, 146, 60, 0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Confetti sparkles - red/orange tones */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: `
              radial-gradient(circle at 8% 15%, #ef4444 2.5px, transparent 2.5px),
              radial-gradient(circle at 15% 75%, #dc2626 2px, transparent 2px),
              radial-gradient(circle at 25% 35%, #f97316 2px, transparent 2px),
              radial-gradient(circle at 35% 85%, #fb923c 2.5px, transparent 2.5px),
              radial-gradient(circle at 45% 20%, #ef4444 2px, transparent 2px),
              radial-gradient(circle at 55% 70%, #dc2626 2.5px, transparent 2.5px),
              radial-gradient(circle at 65% 25%, #f97316 2px, transparent 2px),
              radial-gradient(circle at 75% 80%, #fb923c 2px, transparent 2px),
              radial-gradient(circle at 85% 40%, #ef4444 2.5px, transparent 2.5px),
              radial-gradient(circle at 92% 65%, #dc2626 2px, transparent 2px),
              radial-gradient(circle at 12% 45%, #f97316 2px, transparent 2px),
              radial-gradient(circle at 88% 18%, #fb923c 2px, transparent 2px),
              radial-gradient(circle at 42% 90%, #ef4444 2px, transparent 2px),
              radial-gradient(circle at 72% 12%, #dc2626 2.5px, transparent 2.5px),
              radial-gradient(circle at 5% 55%, #f97316 2.5px, transparent 2.5px),
              radial-gradient(circle at 95% 85%, #fb923c 2.5px, transparent 2.5px)
            `,
            opacity: 0.6,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '24px',
              fontFamily: 'Adwaita Sans',
            }}
          >
            <div
              style={{
                fontSize: '180px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-4px',
              }}
            >
              DMS
            </div>
            <div
              style={{
                fontSize: '180px',
                fontWeight: 800,
                letterSpacing: '-4px',
                background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 50%, #dc2626 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              1.2
            </div>
          </div>

          <div
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: 'rgba(252, 165, 165, 0.4)',
              fontFamily: 'Adwaita Sans',
              marginTop: '16px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}
          >
            Spicy Miso
          </div>
        </div>
      </div>,
      {
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        fonts,
      },
    ]
  }

  return [
    <div
      style={{
        display: 'flex',
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        background: 'linear-gradient(135deg, #1a1318 0%, #2d1b3d 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontSmooth: 'always',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 50%, rgba(128, 90, 213, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(208, 188, 255, 0.12) 0%, transparent 50%)',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: '60px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <img
          src={logoDataUrl}
          style={{
            position: 'absolute',
            top: '50px',
            right: '50px',
            opacity: 0.6,
            width: '120px',
            height: '120px',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '54px',
              color: '#B794F4',
              fontFamily: 'Adwaita Sans',
              fontWeight: 500,
              marginLeft: '4px',
              marginBottom: '18px',
              letterSpacing: '0.5px',
            }}
          >
            Blog
          </div>

          <div
            style={{
              fontSize: '96px',
              color: '#ffffff',
              fontFamily: 'Adwaita Sans',
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: '1000px',
            }}
          >
            {title}
          </div>
        </div>
      </div>
    </div>,
    {
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
      fonts,
    },
  ]
}
