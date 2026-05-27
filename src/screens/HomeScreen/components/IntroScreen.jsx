import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@<>/{}[]()'
const CODE_STREAM_COUNT = 46
const CODE_STREAM_LENGTH = 42
const LINES = [
  { refKey: 'portfolio', text: 'Portafolio' },
  { refKey: 'name', text: 'James Yang' },
]

function getRandomCharacter() {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
}

function getEncryptedText(targetText, progress) {
  const revealedLength = Math.floor(targetText.length * progress)

  return targetText
    .split('')
    .map((character, index) => {
      if (character === ' ') {
        return ' '
      }

      if (index < revealedLength || progress >= 1) {
        return character
      }

      return getRandomCharacter()
    })
    .join('')
}

function createCodeStream() {
  return Array.from({ length: CODE_STREAM_LENGTH }, getRandomCharacter)
}

function IntroScreen({ onComplete }) {
  const rootRef = useRef(null)
  const portfolioRef = useRef(null)
  const nameRef = useRef(null)
  const codeStreams = useMemo(
    () =>
      Array.from({ length: CODE_STREAM_COUNT }, (_, index) => ({
        characters: createCodeStream(),
        x: -4 + (index * 108) / (CODE_STREAM_COUNT - 1),
      })),
    [],
  )

  useEffect(() => {
    const refs = {
      portfolio: portfolioRef,
      name: nameRef,
    }
    const progress = {
      portfolio: 0,
      name: 0,
    }

    const renderLine = (line) => {
      const element = refs[line.refKey].current

      if (!element) {
        return
      }

      element.textContent = getEncryptedText(line.text, progress[line.refKey])
    }

    LINES.forEach(renderLine)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      LINES.forEach((line) => {
        const element = refs[line.refKey].current

        if (element) {
          element.textContent = line.text
        }
      })

      const reducedMotionDelay = gsap.delayedCall(0.5, onComplete)

      return () => {
        reducedMotionDelay.kill()
      }
    }

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      onComplete,
    })

    timeline
      .set('.intro-code-column', { autoAlpha: 0, y: -24 })
      .to(progress, {
        portfolio: 1,
        duration: 1.15,
        onUpdate: () => renderLine(LINES[0]),
      })
      .to(
        progress,
        {
          name: 1,
          duration: 1.3,
          onUpdate: () => renderLine(LINES[1]),
        },
        '-=0.55',
      )
      .fromTo(
        '.intro-code-column',
        {
          autoAlpha: 0,
          y: -24,
        },
        {
          autoAlpha: 1,
          duration: 0.9,
          ease: 'power2.out',
          stagger: {
            amount: 0.75,
            from: 'random',
          },
          y: -2,
        },
      )
      .to('.intro-code-column', {
        duration: 0.95,
        ease: 'power2.inOut',
        stagger: {
          amount: 0.45,
          from: 'random',
        },
        y: 20,
      })
      .to(rootRef.current, {
        autoAlpha: 0,
        duration: 0.85,
        ease: 'power2.inOut',
      }, '-=0.45')

    return () => {
      timeline.kill()
    }
  }, [onComplete])

  return (
    <section
      aria-label="Presentacion del portafolio"
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center px-6 text-[#F2F2F2]"
      ref={rootRef}
    >
      <svg
        aria-hidden="true"
        className="intro-code-layer"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <mask id="intro-code-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
            <rect width="100" height="100" fill="white" />
            <g className="intro-code-mask">
              {codeStreams.map((stream, index) => (
                <text
                  className="intro-code-column"
                  key={`${stream.characters.join('')}-${index}`}
                  textAnchor="middle"
                  x={stream.x}
                  y="-18"
                >
                  {stream.characters.map((character, characterIndex) => (
                    <tspan
                      dy={characterIndex === 0 ? 0 : 3.25}
                      key={`${character}-${characterIndex}`}
                      x={stream.x}
                    >
                      {character}
                    </tspan>
                  ))}
                </text>
              ))}
            </g>
          </mask>
        </defs>
        <rect className="intro-blackout" height="100" mask="url(#intro-code-mask)" width="100" />
      </svg>
      <div className="intro-copy">
        <p className="intro-line" ref={portfolioRef}>
          Portafolio
        </p>
        <p className="intro-line intro-line-name" ref={nameRef}>
          James Yang
        </p>
      </div>
    </section>
  )
}

export default IntroScreen
