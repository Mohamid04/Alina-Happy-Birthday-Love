import { useEffect, useMemo, useRef, useState } from 'react'
import { birthdayConfig as data } from './config'
import './App.css'

const Icon = ({ children }) => <span className="icon" aria-hidden="true">{children}</span>
const isVideo = (src) => /\.mp4$/i.test(src)
const Media = ({ src, alt, className = '' }) => isVideo(src)
  ? <video className={className} src={src} muted autoPlay loop playsInline controls aria-label={alt} />
  : <img className={className} src={src} alt={alt} />

function App() {
  const [stage, setStage] = useState('lock')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [music, setMusic] = useState(false)
  const [modal, setModal] = useState(null)
  const [collected, setCollected] = useState(0)
  const [hearts, setHearts] = useState([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [giftOpen, setGiftOpen] = useState(false)
  const [final, setFinal] = useState(false)
  const [time, setTime] = useState(new Date())
  const audioRef = useRef(null)

  useEffect(() => {
    if (!audioRef.current) return
    if (music) audioRef.current.play().catch(() => setMusic(false))
    else audioRef.current.pause()
  }, [music])

  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer) }, [])
  useEffect(() => {
    if (stage !== 'game' || collected >= 10) return
    const timer = setInterval(() => setHearts((current) => [...current, { id: Date.now(), left: 8 + Math.random() * 84, top: 16 + Math.random() * 68 }]), 850)
    return () => clearInterval(timer)
  }, [stage, collected])
  const progress = useMemo(() => ({ lock: 0, reveal: 1, story: 2, gallery: 3, game: 4, quiz: 5, gift: 6, final: 7 }[stage] || 0), [stage])
  const days = Math.max(0, Math.floor((time.getTime() - new Date(data.storyDate).getTime()) / 86400000))
  const next = (target) => { setStage(target); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const unlock = (event) => { event.preventDefault(); if (password === data.password) { setStage('reveal'); setError(''); setMusic(true) } else setError('That isn’t it, love. Try the date in four digits.') }
  const catchHeart = (id) => { setHearts((current) => current.filter((heart) => heart.id !== id)); setCollected((count) => count + 1) }
  const answerQuiz = (answer) => { setQuizScore((score) => score + (answer === data.quiz[quizIndex].correct ? 1 : 0)); setQuizIndex((index) => index + 1) }

  return <div className={`app ${stage}`}>
    <div className="grain" />
    <audio ref={audioRef} src={`${import.meta.env.BASE_URL}Music/Music.mp3`} loop preload="auto" />
    {stage !== 'lock' && <header className="topbar"><button className="wordmark" onClick={() => next('reveal')}><span>for</span> {data.wifeName}</button><div className="progress"><span style={{ width: `${(progress / 7) * 100}%` }} /></div><button className="music" onClick={() => setMusic(!music)}><Icon>{music ? '■' : '♫'}</Icon> {music ? 'Music on' : 'Music off'}</button></header>}
    {stage === 'lock' && <main className="lock-screen"><div className="lock-orbit orbit-one" /><div className="lock-orbit orbit-two" /><div className="lock-content"><div className="eyebrow">A little secret for you</div><div className="lock-symbol">♡</div><h1>Someone very<br /><em>special</em> has a surprise<br />waiting for you.</h1><p className="lock-note">{data.clue}</p><form onSubmit={unlock} className="pass-form"><input aria-label="Password" inputMode="numeric" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="DDMM" maxLength="4" /><button aria-label="Unlock surprise"><Icon>→</Icon></button></form>{error && <p className="error">{error}</p>}<button className="music-minimal" onClick={() => setMusic(!music)}><Icon>{music ? '■' : '♫'}</Icon> {music ? 'pause the soundtrack' : 'play the soundtrack'}</button></div><div className="lock-footer">EST. 2021 <span>✦</span> MADE WITH LOVE</div></main>}
    {stage === 'reveal' && <main className="reveal page"><div className="sparkles">✦　·　✧　·　✦</div><div className="eyebrow">A celebration of you</div><h1>Happy Birthday,<br /><em>my love.</em></h1><p>Today is all about you.</p><div className="cake"><div className="flame">✦</div><div className="candle" /><div className="cake-top" /><div className="cake-body" /><div className="plate" /></div><button className="button primary" onClick={() => next('story')}>Open your surprise <Icon>→</Icon></button><div className="scroll-hint">SCROLL TO BEGIN <span>↓</span></div></main>}
    {stage === 'story' && <main className="page section-page"><SectionLabel number="01" title="Our story" /><h2>The best things<br /><em>take their time.</em></h2><p className="intro">A few moments from the story I never want to stop telling.</p><div className="timeline">{data.timeline.map((item, index) => <article className="timeline-item" key={item.title}><div className="timeline-marker">{String(index + 1).padStart(2, '0')}</div><img src={item.image} alt={item.title} /><div className="timeline-copy"><span>{item.date}</span><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div><button className="text-button" onClick={() => next('gallery')}>Keep exploring <Icon>→</Icon></button></main>}
    {stage === 'gallery' && <main className="page section-page gallery-page"><SectionLabel number="02" title="The archive" /><h2>Our beautiful<br /><em>memories.</em></h2><p className="intro">Proof that the everyday can be extraordinary with you.</p><div className="gallery">{data.photos.map((photo, index) => <button className={`polaroid tilt-${index % 3}`} key={photo.src} onClick={() => setModal(photo)}><Media src={photo.src} alt={photo.caption} /><span>{photo.caption}</span><b>♡</b></button>)}</div><button className="text-button" onClick={() => next('game')}>There’s more <Icon>→</Icon></button></main>}
    {stage === 'game' && <main className="page game-page"><SectionLabel number="03" title="A tiny challenge" /><h2>Catch my<br /><em>heart.</em></h2><p className="intro">Catch 10 hearts to unlock the next part of your surprise.</p><div className="score">Hearts collected <strong>{collected}/10</strong></div><div className="game-board">{collected < 10 ? hearts.map((heart) => <button className="flying-heart" style={{ left: `${heart.left}%`, top: `${heart.top}%` }} key={heart.id} onClick={() => catchHeart(heart.id)}>♥</button>) : <div className="game-win"><span>♡</span><p>You collected all my hearts...<br /><em>but you already had them.</em></p><button className="button primary" onClick={() => next('quiz')}>Continue <Icon>→</Icon></button></div>}</div></main>}
    {stage === 'quiz' && <main className="page quiz-page"><SectionLabel number="04" title="A little quiz" />{quizIndex < data.quiz.length ? <><h2>How well do<br /><em>you know us?</em></h2><div className="quiz-card"><span className="quiz-count">0{quizIndex + 1} / 0{data.quiz.length}</span><h3>{data.quiz[quizIndex].question}</h3><div className="answers">{data.quiz[quizIndex].answers.map((answer, index) => <button key={answer} onClick={() => answerQuiz(index)}>{answer}<Icon>↗</Icon></button>)}</div></div></> : <div className="quiz-result"><span className="big-heart">♡</span><h2>You scored<br /><em>{quizScore} out of {data.quiz.length}.</em></h2><p>Honestly, the only answer I really care about is that you’re mine.</p><button className="button primary" onClick={() => next('gift')}>Find your gift <Icon>→</Icon></button></div>}</main>}
    {stage === 'gift' && <main className="page gift-page"><SectionLabel number="05" title="From me to you" />{!giftOpen ? <><h2>One last<br /><em>surprise...</em></h2><button className="gift-box" onClick={() => setGiftOpen(true)} aria-label="Open gift"><span className="gift-lid" /><span className="gift-ribbon" /><span className="gift-body" /><span className="gift-bow">✦</span></button><p className="tap-note">tap to open</p></> : <Letter onDone={() => next('final')} />}</main>}
    {stage === 'final' && <main className="final-page">{!final ? <div className="question"><div className="eyebrow">Before you go...</div><h2>Will you make more<br /><em>beautiful memories</em><br />with me?</h2><div className="final-buttons"><button className="button primary" onClick={() => setFinal(true)}>YES ♡</button><button className="button outline" onClick={() => setFinal(true)}>OF COURSE ♡</button></div></div> : <div className="celebration"><div className="final-hearts">♡　✦　♡</div><div className="eyebrow">And so it goes</div><h1>Forever starts<br /><em>with us.</em></h1><p>Happy Birthday, {data.wifeName} ♡</p><div className="collage">{data.photos.slice(0, 4).map((photo) => <Media src={photo.src} alt="A beautiful memory" key={photo.src} />)}</div><div className="counter"><strong>{days}</strong><span>days of choosing you<br />and counting</span></div></div>}</main>}
    {modal && <div className="modal" onClick={() => setModal(null)}><button className="modal-close" onClick={() => setModal(null)}>×</button><Media src={modal.src} alt={modal.caption} /><p>{modal.caption} <span>♡</span></p></div>}
  </div>
}

function SectionLabel({ number, title }) { return <div className="section-label"><span>{number}</span><i /><b>{title}</b></div> }
function Letter({ onDone }) { const [shown, setShown] = useState(0); useEffect(() => { const timer = setInterval(() => setShown((value) => value + 1), 28); return () => clearInterval(timer) }, []); return <div className="letter"><div className="letter-top">A LETTER FOR YOU <span>♡</span></div><p>{data.letter.slice(0, shown)}</p>{shown >= data.letter.length && <button className="text-button" onClick={onDone}>One more thing <Icon>→</Icon></button>}</div> }

export default App
