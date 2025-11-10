import type { ImageRenderer, DocsPageData } from '@acid-info/docusaurus-og'
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
