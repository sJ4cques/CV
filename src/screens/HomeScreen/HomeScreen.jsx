import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import chameleonIcon from '../../assets/chameleon-svgrepo-com.svg'
import profileImage from '../../assets/James Yang.jpg'
import SectionHeading from '../../components/SectionHeading'
import ChameleonModeButton from './components/ChameleonModeButton'
import DownloadPdfButton from './components/DownloadPdfButton'
import FlashlightModeButton from './components/FlashlightModeButton'
import IntroScreen from './components/IntroScreen'
import downloadFormalCvPdf from './utils/downloadFormalCvPdf'
import './HomeScreen.css'

const contactItems = [
  { label: 'Email', value: 'jamesyangudv@gmail.com', href: 'mailto:jamesyangudv@gmail.com' },
  { label: 'Telefono', value: '4624-7810', href: 'tel:+50246247810' },
  {
    label: 'Direccion',
    value:
      'Corral Chiquito, Calle Principal, zona 8, Huehuetenango, Huehuetenango 13001',
  },
  { label: 'Nacimiento', value: '19 de agosto de 1996' },
]

const education = [
  {
    level: 'Universitaria',
    period: 'ene 2019 - dic 2022',
    place: 'Universidad Da Vinci de Guatemala, Huehuetenango',
    title: 'Licenciatura en Administracion de Empresas',
    detail: 'Pensum cerrado',
  },
  {
    level: 'Universitaria',
    period: 'ene 2015 - dic 2026',
    place: 'Universidad de Occidente, Huehuetenango',
    title: 'Licenciatura en Ingenieria en Sistemas',
    detail: '6to semestre aprobado, cursando 7mo.',
  },
  {
    level: 'Bachillerato',
    period: 'ene 2013 - dic 2014',
    place: 'Colegio Preuniversitario Cambridge, Huehuetenango',
    title: 'Bachiller en Ciencias y Letras con Orientacion en Computacion',
  },
]

const experience = [
  {
    role:
      'Encargado del Negociado de Contrataciones de la Seccion de Compras y Contrataciones',
    period: 'ene 2018 - ene 2023',
    company: 'Unidad Ejecutora 113 Quinta Brigada de Infanteria "MGS"',
    location: 'Ministerio de la Defensa Nacional, Guatemala',
    summary:
      'Experiencia en el portal de GUATECOMPRAS, SIGES y conformacion de eventos en regimenes y modalidades especificas.',
  },
  {
    role: 'Desarrollo de software',
    period: 'ene 2023 - Actualidad',
    summary: 'Desarrollo de aplicaciones web personalizadas.',
    technologies: [
      'React JS',
      'PostgreSQL',
      'Firebase (NoSQL)',
      'MongoDB (NoSQL)',
      'Tailwind',
      'Angular',
      'Node JS',
      'API REST',
      '.NET Core',
    ],
  },
]

const languages = [
  { name: 'Espanol', details: ['Nativo'] },
  {
    name: 'Ingles',
    details: ['Lectura avanzada', 'Escritura basica', 'Pronunciacion intermedia'],
  },
]

const interests = ['Videojuegos', 'Musica', 'Lectura']

const profile = {
  headline: 'Desarrollador de software',
  name: 'James Antonio Yang Gramajo',
  summary:
    'Desarrollador de software con experiencia en aplicaciones web personalizadas, bases de datos relacionales y NoSQL, integraciones REST y procesos administrativos orientados a resultados.',
}

const dossierTabs = [
  { id: 'perfil', label: 'Perfil', marker: '01' },
  { id: 'formacion', label: 'Formacion', marker: '02' },
  { id: 'experiencia', label: 'Experiencia', marker: '03' },
  { id: 'intel', label: 'Intel', marker: '04' },
]

const CHAMELEON_THEME_DELAY_MS = 2450
const CHAMELEON_WAVE_DURATION_MS = 2850
const CHAMELEON_VIEW_TRANSITION_CLASS = 'chameleon-view-transition'
const PAPER_SHUFFLE_DURATION_MS = 1450

function TimelineItem({ item }) {
  return (
    <article className="file-entry grid gap-3 sm:grid-cols-[1fr_auto] sm:gap-8">
      <div>
        <h3 className="text-xl font-semibold leading-tight text-black">{item.level || item.role}</h3>
        {item.company ? (
          <p className="mt-2 text-lg font-semibold leading-snug text-black">{item.company}</p>
        ) : null}
        {item.place ? <p className="mt-2 text-lg text-black/70">{item.place}</p> : null}
        {item.location ? <p className="mt-2 text-lg text-black/70">{item.location}</p> : null}
        {item.title ? <p className="mt-2 text-lg text-black">{item.title}</p> : null}
        {item.detail ? <p className="mt-1 text-lg text-black">{item.detail}</p> : null}
        {item.summary ? <p className="mt-3 max-w-3xl text-lg leading-relaxed text-black">{item.summary}</p> : null}
        {item.technologies ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {item.technologies.map((technology) => (
              <li
                className="classified-chip px-3 py-1 text-sm font-medium text-black"
                key={technology}
              >
                {technology}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="text-base font-semibold text-black/70 sm:text-right">{item.period}</p>
    </article>
  )
}

function RedactedText({ children, width = '8ch' }) {
  return (
    <span className="redacted-text" style={{ '--redacted-width': width }} tabIndex={0}>
      {children}
    </span>
  )
}

function ContactLink({ item }) {
  const content = (
    <>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B6B09F]">
        {item.label}
      </span>
      <span className="text-sm leading-relaxed text-[#F2F2F2]">{item.value}</span>
    </>
  )

  if (item.href) {
    return (
      <a className="contact-item" href={item.href}>
        {content}
      </a>
    )
  }

  return <div className="contact-item">{content}</div>
}

function DossierFile({ fileId, isDeclassified }) {
  if (fileId === 'perfil') {
    return (
      <div className="profile-document-stack">
        <aside className="profile-photo-sheet" aria-label="Fotografia de expediente">
          <div className="evidence-photo">
            <img alt="James Antonio Yang Gramajo" src={profileImage} />
          </div>
          <div className="profile-photo-tag">Huehuetenango</div>
        </aside>

        <section className="folder-file is-profile" id="file-perfil">
          <div className="case-file flex min-h-full flex-col justify-between gap-10">
            <div>
              <div className="classified-stamp mb-6 w-fit px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
                {isDeclassified ? 'Expediente desclasificado' : 'Archivo clasificado'}
              </div>
              <p className="mb-4 text-sm uppercase tracking-[0.28em] text-black/55">
                Portafolio CV
              </p>
              <h1 className="case-title text-5xl font-semibold leading-[0.95] text-black sm:text-7xl lg:text-8xl">
                James <RedactedText width="7ch">Antonio</RedactedText> Yang Gramajo
              </h1>
              <p className="case-summary mt-8 max-w-2xl text-xl leading-relaxed text-black/70">
                {profile.headline}.
              </p>
            </div>

            <div className="profile-contact-sheet">
              <SectionHeading eyebrow="Perfil" title="Datos personales" />
              <div className="classified-contact mt-6 grid gap-2">
                {contactItems.map((item) => (
                  <ContactLink item={item} key={item.label} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (fileId === 'formacion') {
    return (
      <section className="folder-file" id="file-formacion">
        <div className="grid gap-10 lg:grid-cols-[30%_70%]">
          <SectionHeading eyebrow="Formacion" title="Base academica y estudios en curso" />
          <div className="file-stack grid gap-8">
            {education.map((item) => (
              <TimelineItem item={item} key={`${item.level}-${item.period}-${item.title}`} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (fileId === 'experiencia') {
    return (
      <section className="folder-file" id="file-experiencia">
        <div className="grid gap-10 lg:grid-cols-[30%_70%]">
          <SectionHeading eyebrow="Experiencia" title="Procesos administrativos y desarrollo web" />
          <div className="file-stack grid gap-10">
            {experience.map((item) => (
              <TimelineItem item={item} key={`${item.role}-${item.period}`} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="folder-file folder-file--intel grid gap-8 lg:grid-cols-[60%_40%]" id="file-intel">
      <div>
        <SectionHeading eyebrow="Idiomas" title="Comunicacion" tone="dark" />
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {languages.map((language) => (
            <article className="intel-card" key={language.name}>
              <h3 className="text-2xl font-semibold">{language.name}</h3>
              <ul className="mt-4 grid gap-2 text-lg text-[#F2F2F2]/80">
                {language.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="interest-file text-black">
        <SectionHeading eyebrow="Intereses" title="Pasatiempos" />
        <ul className="mt-10 grid gap-4 text-3xl font-semibold">
          {interests.map((interest) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function HomeScreen() {
  const [showIntro, setShowIntro] = useState(true)
  const [activeFile, setActiveFile] = useState('perfil')
  const [previousActiveFile, setPreviousActiveFile] = useState('perfil')
  const [isPaperShuffling, setIsPaperShuffling] = useState(false)
  const [isDeclassified, setIsDeclassified] = useState(true)
  const [isFlashlightOn, setIsFlashlightOn] = useState(false)
  const [flashlightPosition, setFlashlightPosition] = useState({ x: 0, y: 0 })
  const [chameleonRipple, setChameleonRipple] = useState(null)
  const chameleonRippleTimeoutRef = useRef(null)
  const chameleonThemeTimeoutRef = useRef(null)
  const paperShuffleTimeoutRef = useRef(null)
  const activeFileIndex = dossierTabs.findIndex((tab) => tab.id === activeFile)
  const previousActiveFileIndex = dossierTabs.findIndex((tab) => tab.id === previousActiveFile)

  const clearChameleonRippleTimeout = useCallback(() => {
    if (chameleonRippleTimeoutRef.current) {
      window.clearTimeout(chameleonRippleTimeoutRef.current)
      chameleonRippleTimeoutRef.current = null
    }
  }, [])

  const clearChameleonThemeTimeout = useCallback(() => {
    if (chameleonThemeTimeoutRef.current) {
      window.clearTimeout(chameleonThemeTimeoutRef.current)
      chameleonThemeTimeoutRef.current = null
    }
  }, [])

  const clearPaperShuffleTimeout = useCallback(() => {
    if (paperShuffleTimeoutRef.current) {
      window.clearTimeout(paperShuffleTimeoutRef.current)
      paperShuffleTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearChameleonRippleTimeout()
      clearChameleonThemeTimeout()
      clearPaperShuffleTimeout()
    }
  }, [clearChameleonRippleTimeout, clearChameleonThemeTimeout, clearPaperShuffleTimeout])

  useEffect(() => {
    if (!isFlashlightOn) {
      return undefined
    }

    const updateFlashlightPosition = (event) => {
      setFlashlightPosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('pointermove', updateFlashlightPosition)

    return () => {
      window.removeEventListener('pointermove', updateFlashlightPosition)
    }
  }, [isFlashlightOn])

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
  }, [])
  const handlePdfDownload = useCallback(() => {
    void downloadFormalCvPdf({
      contactItems,
      education,
      experience,
      interests,
      languages,
      profile: {
        ...profile,
        photo: profileImage,
      },
    })
  }, [])
  const handleFileSelect = useCallback((fileId) => {
    if (fileId === activeFile) {
      return
    }

    clearPaperShuffleTimeout()
    setPreviousActiveFile(activeFile)
    setActiveFile(fileId)
    setIsPaperShuffling(true)

    paperShuffleTimeoutRef.current = window.setTimeout(() => {
      setIsPaperShuffling(false)
      paperShuffleTimeoutRef.current = null
    }, PAPER_SHUFFLE_DURATION_MS)
  }, [activeFile, clearPaperShuffleTimeout])
  const handleFlashlightToggle = useCallback((event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect()

    setFlashlightPosition({
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2,
    })
    setIsFlashlightOn((currentValue) => !currentValue)
  }, [])
  const handleVisualModeToggle = useCallback((event) => {
    const root = document.documentElement
    const nextMode = !isDeclassified
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const buttonRect = event.currentTarget.getBoundingClientRect()
    const fallbackX = buttonRect.left + buttonRect.width / 2
    const fallbackY = buttonRect.top + buttonRect.height / 2
    const originX = Number(event.clientX) || fallbackX
    const originY = Number(event.clientY) || fallbackY
    const maxRadius =
      Math.ceil(
        Math.max(
          Math.hypot(originX, originY),
          Math.hypot(viewportWidth - originX, originY),
          Math.hypot(originX, viewportHeight - originY),
          Math.hypot(viewportWidth - originX, viewportHeight - originY),
        ),
      ) + 80
    const canUseViewTransition = typeof document.startViewTransition === 'function'

    clearChameleonRippleTimeout()
    clearChameleonThemeTimeout()
    setChameleonRipple({
      key: Date.now(),
      maxRadius,
      targetDeclassified: nextMode,
      usesViewTransition: canUseViewTransition,
      x: originX,
      y: originY,
    })

    if (canUseViewTransition) {
      root.style.setProperty('--chameleon-x', `${originX}px`)
      root.style.setProperty('--chameleon-y', `${originY}px`)
      root.style.setProperty('--chameleon-end-radius', `${maxRadius}px`)
      root.classList.add(CHAMELEON_VIEW_TRANSITION_CLASS)

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setIsDeclassified(nextMode)
        })
      })

      transition.finished.finally(() => {
        root.classList.remove(CHAMELEON_VIEW_TRANSITION_CLASS)
        root.style.removeProperty('--chameleon-x')
        root.style.removeProperty('--chameleon-y')
        root.style.removeProperty('--chameleon-end-radius')
      })
    } else {
      chameleonThemeTimeoutRef.current = window.setTimeout(() => {
        setIsDeclassified(nextMode)
        chameleonThemeTimeoutRef.current = null
      }, CHAMELEON_THEME_DELAY_MS)
    }

    chameleonRippleTimeoutRef.current = window.setTimeout(() => {
      setChameleonRipple(null)
      chameleonRippleTimeoutRef.current = null
    }, CHAMELEON_WAVE_DURATION_MS)
  }, [clearChameleonRippleTimeout, clearChameleonThemeTimeout, isDeclassified])

  return (
    <>
      {showIntro ? <IntroScreen onComplete={handleIntroComplete} /> : null}
      {chameleonRipple && !chameleonRipple.usesViewTransition ? (
        <div
          aria-hidden="true"
          className={`chameleon-fallback-fill ${
            chameleonRipple.targetDeclassified ? 'to-declassified' : 'to-classified'
          }`}
          style={{
            '--chameleon-end-radius': `${chameleonRipple.maxRadius}px`,
            '--chameleon-x': `${chameleonRipple.x}px`,
            '--chameleon-y': `${chameleonRipple.y}px`,
          }}
        />
      ) : null}
      {chameleonRipple ? (
        <div
          aria-hidden="true"
          className="chameleon-ripple-ring"
          style={{
            '--chameleon-end-radius': `${chameleonRipple.maxRadius}px`,
            '--chameleon-x': `${chameleonRipple.x}px`,
            '--chameleon-y': `${chameleonRipple.y}px`,
          }}
        />
      ) : null}
      {isFlashlightOn ? (
        <div
          aria-hidden="true"
          className="flashlight-overlay"
          style={{
            '--flashlight-x': `${flashlightPosition.x}px`,
            '--flashlight-y': `${flashlightPosition.y}px`,
          }}
        />
      ) : null}

      <main
        className={`classified-dossier min-h-screen bg-[#F2F2F2] px-4 py-6 text-black sm:px-8 lg:px-12 lg:py-10 ${
          isDeclassified ? 'declassified-mode' : ''
        }`}
      >
        <section className="folder-shell mx-auto min-h-[calc(100vh-3rem)] max-w-7xl">
          <div className="folder-header">
            <nav className="folder-tabs" aria-label="Archivos del expediente">
              {dossierTabs.map((tab) => (
                <button
                  aria-controls={`file-${tab.id}`}
                  aria-selected={activeFile === tab.id}
                  className={`folder-tab ${activeFile === tab.id ? 'is-active' : ''}`}
                  key={tab.id}
                  onClick={() => handleFileSelect(tab.id)}
                  type="button"
                >
                  <span>{tab.marker}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="folder-actions">
              <FlashlightModeButton
                isActive={isFlashlightOn}
                onActivate={handleFlashlightToggle}
              />
              <ChameleonModeButton
                icon={chameleonIcon}
                isActive={isDeclassified}
                onActivate={handleVisualModeToggle}
              />
              <DownloadPdfButton onClick={handlePdfDownload} />
            </div>
          </div>

          <div className={`folder-panel ${isPaperShuffling ? 'is-shuffling' : ''}`}>
            {dossierTabs.map((tab, index) => {
              const stackDepth = (index - activeFileIndex + dossierTabs.length) % dossierTabs.length
              const previousStackDepth =
                (index - previousActiveFileIndex + dossierTabs.length) % dossierTabs.length
              const isActive = stackDepth === 0
              const isIncoming = isPaperShuffling && isActive

              return (
                <div
                  aria-hidden={!isActive}
                  className={[
                    'document-layer',
                    `document-layer--${tab.id}`,
                    isActive ? 'is-active' : `is-depth-${stackDepth}`,
                    isIncoming ? 'is-incoming' : '',
                    isIncoming ? `from-depth-${previousStackDepth}` : '',
                  ].filter(Boolean).join(' ')}
                  key={tab.id}
                  style={{ '--stack-depth': String(stackDepth) }}
                >
                  <DossierFile fileId={tab.id} isDeclassified={isDeclassified} />
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </>
  )
}

export default HomeScreen
