import { useEffect, useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'motion/react'
import Lenis from 'lenis'
import * as sfx from './sfx.js'
import World from './World.jsx'
import { BRAND, POINTS, MENU, telHref, telText } from './data.js'

/* ── Разлочка звука по первому жесту ────────────────────────────────────── */
function useAudioUnlock() {
  useEffect(() => {
    const go = () => sfx.unlock()
    const opts = { once: true, passive: true }
    const evs = ['pointerdown', 'wheel', 'touchstart', 'keydown']
    evs.forEach((e) => window.addEventListener(e, go, opts))
    return () => evs.forEach((e) => window.removeEventListener(e, go))
  }, [])
}

/* Живые часы — весь смысл сети в том, что она работает всегда. */
function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

const pad = (n) => String(n).padStart(2, '0')

function MuteToggle() {
  const [muted, setMuted] = useState(false)
  return (
    <button
      onClick={() => { const v = !muted; setMuted(v); sfx.setMuted(v); if (!v) sfx.tick() }}
      onMouseEnter={() => !muted && sfx.tick()}
      className="card fixed bottom-5 right-5 z-[140] grid h-11 w-11 place-items-center rounded-full text-base"
      aria-label={muted ? 'Включить звук' : 'Выключить звук'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}

/* ── Словесный знак ─────────────────────────────────────────────────────────
   Настоящая эмблема сети — чёрный круглый бейдж, и повторять её форму было бы
   подделкой знака, а не заглушкой. Поэтому здесь честный вордмарк: только
   название, набранное типографикой. Оригинал подставляется в одну строку. */
function Wordmark({ stacked = false, size = 22 }) {
  const star = <span className="ember" style={{ fontSize: size * 0.5 }}>★</span>
  if (!stacked) {
    return (
      <span className="display flex items-baseline gap-2" style={{ fontSize: size }}>
        <span>BEEF</span>{star}<span>BURGERS</span>
      </span>
    )
  }
  return (
    <span className="display flex flex-col items-center leading-[0.82]" style={{ fontSize: size }}>
      <span className="kraft">BEEF</span>
      <span className="my-1 flex items-center gap-3" style={{ fontSize: size * 0.28 }}>
        <i className="block h-px w-8" style={{ background: 'var(--line)' }} />
        {star}
        <i className="block h-px w-8" style={{ background: 'var(--line)' }} />
      </span>
      <span>BURGERS</span>
    </span>
  )
}

/* ── Header ─────────────────────────────────────────────────────────────── */
function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-[120] px-4 py-3 md:px-8 md:py-4">
      <div className="card mx-auto flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2 md:px-5">
        <a href="#top" className="flex items-center">
          <Wordmark size={24} />
        </a>
        <nav className="hidden items-center gap-7 text-sm text-[color:var(--muted)] md:flex">
          <a href="#story" onMouseEnter={() => sfx.tick()} className="transition-colors hover:text-[color:var(--fg)]">Ночная смена</a>
          <a href="#menu" onMouseEnter={() => sfx.tick()} className="transition-colors hover:text-[color:var(--fg)]">Меню</a>
          <a href="#points" onMouseEnter={() => sfx.tick()} className="transition-colors hover:text-[color:var(--fg)]">Где мы</a>
        </nav>
        <a href={BRAND.igUrl} target="_blank" rel="noreferrer"
          className="btn btn-primary rounded-full px-4 py-2 text-xs md:px-5">Заказать</a>
      </div>
    </header>
  )
}

/* ── Hero ───────────────────────────────────────────────────────────────── */
function Hero({ now }) {
  return (
    <section id="top" className="relative overflow-hidden px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
      {/* Угли под решёткой — фоновое свечение, а не картинка. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{
        background:
          'radial-gradient(60% 45% at 50% 8%, color-mix(in oklab, var(--ember) 16%, transparent), transparent 60%),' +
          'radial-gradient(120% 90% at 50% 40%, transparent 55%, #000 100%)',
      }} />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <Wordmark stacked size={54} />

        <div className="eyebrow kraft mt-7">Бишкек · халал · круглосуточно</div>

        <h1 className="display mt-4 text-[clamp(3rem,12vw,8rem)]">
          Открыто<br /><span className="ember">прямо сейчас</span>
        </h1>

        {/* Живые часы — доказательство слогана, а не украшение. */}
        <div className="card mt-8 flex items-center gap-4 px-6 py-4">
          <span className="pulse inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: 'var(--kraft)' }} />
          <span className="display text-3xl tabular-nums md:text-4xl">
            {pad(now.getHours())}<span className="ember">:</span>{pad(now.getMinutes())}
            <span className="text-[color:var(--muted)]">:{pad(now.getSeconds())}</span>
          </span>
          <span className="text-left text-xs leading-tight text-[color:var(--muted)]">
            все три точки<br />работают
          </span>
        </div>

        <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-[color:var(--muted)] md:text-lg">
          Пока весь город закрыт, у нас горит решётка. Ни «до одиннадцати»,
          ни «приходите завтра».
        </p>

        <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
          <a href="#menu" className="btn btn-primary w-full rounded-full px-8 py-4 text-sm sm:w-auto">Меню</a>
          <a href="#points" className="btn btn-ghost w-full rounded-full px-8 py-4 text-sm sm:w-auto">Где ближайшая</a>
        </div>

        <ul className="mt-14 grid w-full max-w-3xl grid-cols-3 gap-3 md:gap-4">
          {[
            { n: '24/7', l: 'без выходных' },
            { n: POINTS.length, l: 'точки в городе' },
            { n: `${BRAND.avgCheck} с`, l: 'средний чек' },
          ].map((s) => (
            <li key={s.l} className="card px-3 py-5">
              <div className="display kraft text-[clamp(1.5rem,5vw,2.6rem)]">{s.n}</div>
              <div className="mt-1.5 text-xs text-[color:var(--muted)] md:text-sm">{s.l}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── Меню ───────────────────────────────────────────────────────────────── */
function Menu({ onAdd }) {
  const [cat, setCat] = useState(MENU[0].id)
  const active = MENU.find((c) => c.id === cat)

  return (
    <section id="menu" className="relative mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <div className="text-center">
        <div className="eyebrow kraft">Меню</div>
        <h2 className="display mt-3 text-[clamp(2.4rem,7vw,4.4rem)]">
          Что <span className="ember">жарим</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-[color:var(--muted)]">
          Цены в сомах по меню доставки. В заведении могут отличаться.
        </p>
      </div>

      {/* На мобиле категории едут горизонтально, а не рвутся на две строки. */}
      <div className="mt-9 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
        {MENU.map((c) => {
          const on = cat === c.id
          return (
            <button key={c.id} onClick={() => { setCat(c.id); sfx.tick() }}
              className="relative shrink-0 rounded-full px-5 py-2.5 text-sm transition-colors"
              style={{ color: on ? '#fff' : 'var(--muted)' }}>
              {on && (
                <motion.span layoutId="catPill" className="absolute inset-0 z-0 rounded-full"
                  style={{ background: 'var(--ember)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
              )}
              <span className="tag relative z-10">{c.title}</span>
            </button>
          )
        })}
      </div>

      <div className="card mt-10 overflow-hidden">
        <div className="flex items-baseline justify-between gap-4 border-b px-5 py-4 md:px-6" style={{ borderColor: 'var(--line)' }}>
          <span className="tag text-lg">{active.title}</span>
          <span className="text-xs text-[color:var(--muted)]">{active.note}</span>
        </div>

        <motion.ul key={cat} initial={{ y: 8 }} animate={{ y: 0 }} transition={{ duration: .22 }}
          className="divide-y" style={{ borderColor: 'var(--line)' }}>
          {active.items.map((it) => (
            <li key={it.n} className="flex items-center justify-between gap-4 px-5 py-3.5 md:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{it.n}</span>
                  {it.hit && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                      style={{ background: 'var(--ember)' }}>хит</span>
                  )}
                </div>
                {it.w && <div className="mt-0.5 text-xs text-[color:var(--muted)]">{it.w}</div>}
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="display kraft text-xl tabular-nums">
                  {it.p}<span className="ml-1 text-sm text-[color:var(--muted)]">с</span>
                </span>
                <button onClick={() => { sfx.chomp(); onAdd() }}
                  className="btn btn-ghost rounded-full px-3.5 py-1.5 text-[11px]"
                  aria-label={`Добавить ${it.n}`}>+</button>
              </div>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

/* ── Точки ──────────────────────────────────────────────────────────────── */
function Points({ now }) {
  return (
    <section id="points" className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <div className="text-center">
        <div className="eyebrow kraft">Где мы</div>
        <h2 className="display mt-3 text-[clamp(2.4rem,7vw,4.4rem)]">Три точки</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-[color:var(--muted)]">
          Все работают круглосуточно. Сейчас {pad(now.getHours())}:{pad(now.getMinutes())} — открыты все.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {POINTS.map((p) => (
          <li key={p.id} className="card flex flex-col gap-3 p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="tag text-lg">{p.name}</h3>
              {p.halal && (
                <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider"
                  style={{ borderColor: 'var(--kraft)', color: 'var(--kraft)' }}>халал</span>
              )}
            </div>
            <p className="text-sm leading-snug text-[color:var(--muted)]">{p.addr}</p>
            <p className="text-xs text-[color:var(--muted)]">{p.area}</p>

            <div className="mt-auto flex items-center gap-2.5 pt-2 text-sm">
              <span className="pulse inline-block h-2 w-2 rounded-full" style={{ background: 'var(--kraft)' }} />
              <span className="font-semibold">Открыто · круглосуточно</span>
            </div>

            {p.tel && (
              <a href={telHref(p.tel)} className="display ember text-xl tabular-nums transition-opacity hover:opacity-70">
                {telText(p.tel)}
              </a>
            )}
            {p.rating && (
              <p className="text-xs text-[color:var(--muted)]">★ {p.rating} · {p.reviews} оценок в 2ГИС</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t px-5 py-16 md:px-8 md:py-20" style={{ borderColor: 'var(--line)' }}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <Wordmark stacked size={44} />
          <h2 className="display text-[clamp(2.4rem,8vw,5rem)]">Голоден в 4 утра?</h2>
          <p className="max-w-md text-sm text-[color:var(--muted)]">
            Мы открыты. Панфилова 54/1, ТЦ DK в 12 микрорайоне, Турусбекова / Фрунзе.
          </p>
          <a href={BRAND.igUrl} target="_blank" rel="noreferrer"
            className="btn btn-primary rounded-full px-10 py-4 text-sm">Написать в Instagram</a>
        </div>

        <div className="mt-14 grid gap-8 border-t pt-8 text-sm md:grid-cols-3" style={{ borderColor: 'var(--line)' }}>
          <div>
            <div className="eyebrow text-[color:var(--muted)]">Связаться</div>
            <ul className="mt-3 space-y-2">
              <li><a className="hover:opacity-70" href={BRAND.igUrl} target="_blank" rel="noreferrer">Instagram · @{BRAND.ig}</a></li>
              <li><a className="hover:opacity-70" href={telHref('0700993355')}>0700 99 33 55</a></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow text-[color:var(--muted)]">Доставка</div>
            <ul className="mt-3 space-y-2 text-[color:var(--muted)]">
              <li>Ковёр-Самолёт · Glovo</li>
              <li>средний чек {BRAND.avgCheck} сом</li>
            </ul>
          </div>
          <div>
            <div className="eyebrow text-[color:var(--muted)]">Кухня</div>
            <ul className="mt-3 space-y-2 text-[color:var(--muted)]">
              <li>Халяльная</li>
              <li>Круглосуточно, без выходных</li>
            </ul>
          </div>
        </div>

        <p id="legal" className="mt-10 text-xs leading-relaxed text-[color:var(--muted)]">
          <b className="text-[color:var(--fg)]">Концепт, не официальный сайт.</b> У сети Beef Burgers своего сайта нет —
          в Instagram-био нет даже ссылки. Точки, график, телефон и цены взяты из их публичных источников
          (Instagram-профиль, карточки 2ГИС и страница доставки «Ковёр-Самолёт») и приведены как есть.
          Эмблема на странице типографическая, набрана по названию сети; оригинальный логотип принадлежит
          Beef Burgers и должен быть предоставлен ими. Права на бренд и меню — у Beef Burgers.
        </p>
      </div>
    </footer>
  )
}

/* ── App ────────────────────────────────────────────────────────────────── */
export default function App() {
  const now = useClock()
  const [order, setOrder] = useState(0)
  useAudioUnlock()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.1 })
    let raf
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href')
        if (id.length > 1) { e.preventDefault(); lenis.scrollTo(id, { offset: -80 }) }
      })
    })
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [])

  const add = () => setOrder((o) => o + 1)

  return (
    <MotionConfig reducedMotion="user">
      <Header />
      {/* Живая демо-ссылка не должна сойти за официальный сайт сети. */}
      <a href="#legal"
        className="fixed bottom-5 left-5 z-[130] rounded-full px-3 py-1.5 text-[10px] uppercase"
        style={{ background: 'var(--fg)', color: 'var(--bg)', letterSpacing: '.12em' }}>
        Концепт · не офсайт
      </a>
      <main>
        <Hero now={now} />
        <World />
        <Menu onAdd={add} />
        <Points now={now} />
      </main>
      <Footer />
      <MuteToggle />

      <AnimatePresence>
        {order > 0 && (
          <motion.div
            initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }}
            className="card fixed bottom-5 left-1/2 z-[140] -translate-x-1/2 px-5 py-2.5 text-sm">
            В заказе: <b className="kraft tabular-nums">{order}</b>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
