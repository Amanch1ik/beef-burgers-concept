import { useEffect, useRef } from 'react'
import { mountScrollWorld } from './scrub-engine.js'
import * as sfx from './sfx.js'

/* ── Глава-пролёт «Ночная смена» ───────────────────────────────────────────
   Движок: scrub-engine.js из oso95/scroll-world (MIT), вендорнут в src/.
   Видео — футажи Mixkit (free license), перекодированы под скраб:
   720p · crf 21 · GOP 8 · faststart · без звука; мобильные 480p · GOP 4.
   Коннекторов между сценами нет (нужна платная AI-видеогенерация),
   поэтому стыки идут кроссфейдом — движок это поддерживает штатно.      */

const V = (n) => `${import.meta.env.BASE_URL}world/${n}`

const SECTIONS = [
  {
    id: 'fire', label: 'Огонь', accent: '#e2541f', linger: 0.35,
    still: V('fire.jpg'), stillMobile: V('fire-m.jpg'),
    clip: V('fire.mp4'), clipMobile: V('fire-m.mp4'),
    eyebrow: 'Смена не заканчивается',
    title: 'Три часа ночи',
    body: 'Когда весь Бишкек закрыт, у нас горит решётка. Все точки работают круглосуточно — без «до одиннадцати».',
    tags: ['24/7', 'халал'],
  },
  {
    id: 'smash', label: 'Котлета', accent: '#e2541f', linger: 0.45,
    still: V('smash.jpg'), stillMobile: V('smash-m.jpg'),
    clip: V('smash.mp4'), clipMobile: V('smash-m.mp4'),
    eyebrow: 'Говядина',
    title: 'Котлета на живом огне',
    body: 'Фирменную котлету можно добавить в любой бургер за 80 сомов. Так собирают свой «двойной» те, кто знает.',
    tags: ['+80 с', 'фирменная'],
  },
  {
    id: 'build', label: 'Сборка', accent: '#d9a441', linger: 0.5,
    still: V('build.jpg'), stillMobile: V('build-m.jpg'),
    clip: V('build.mp4'), clipMobile: V('build-m.mp4'),
    eyebrow: 'Восемнадцать бургеров',
    title: 'От мини до Big Ben',
    body: 'Мини за 169 и Big Ben на 510 грамм за 319. Чеддер, халапеньо, яйцо — докидываются по 20–30 сомов.',
    tags: ['169–319 с', '18 позиций'],
  },
  {
    id: 'double', label: 'Комбо', accent: '#d9a441', linger: 0.4,
    still: V('double.jpg'), stillMobile: V('double-m.jpg'),
    clip: V('double.mp4'), clipMobile: V('double-m.mp4'),
    eyebrow: 'Средний чек 350',
    title: 'Бургер, фри и кола',
    body: 'Картошка по-деревенски, луковые кольца, крылышки. Литр колы — сотня.',
    tags: ['фри 150 с', 'кола 100 с'],
  },
  {
    id: 'ready', label: 'Готово', accent: '#e2541f', linger: 0.3,
    still: V('hero.jpg'), stillMobile: V('hero-m.jpg'),
    clip: V('hero.mp4'), clipMobile: V('hero-m.mp4'),
    eyebrow: 'Три точки в городе',
    title: 'Забирай или закажи',
    body: 'Панфилова 54/1, ТЦ DK в 12 микрорайоне и Турусбекова / Фрунзе. Все — круглосуточно.',
    cta: {
      primary: { label: 'Смотреть меню', href: '#menu' },
      secondary: { label: 'Где мы', href: '#points' },
    },
  },
]

export default function World() {
  const ref = useRef(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    const phone = window.matchMedia('(max-width: 860px)').matches

    let last = -1
    mountScrollWorld(host, {
      hint: 'крути — ночная смена',
      diveScroll: phone ? 1.05 : 1.4,
      crossfade: 0.16,
      nav: false,
      atmosphere: true,
      sections: SECTIONS,
      connectors: [],
      onSection: (i) => {
        if (i === last) return
        last = i
        if (i === SECTIONS.length - 1) sfx.complete()
        else sfx.whoosh()
      },
    })

    /* Слои движка — position:fixed и рассчитаны на страницу целиком. Глава
       стоит в середине сайта, поэтому её аппарат надо гасить и до, и после:
       иначе он накроет герой сверху и меню снизу. */
    const track = host.querySelector('.sw-track')
    const onScroll = () => {
      if (!track) return
      const vh = window.innerHeight
      const y = window.scrollY || window.pageYOffset
      const top = track.getBoundingClientRect().top + y
      const fadeIn = top - vh * 0.55
      const fadeOut = top + track.offsetHeight - vh * 0.6
      let v = 1
      if (y < fadeIn) v = 0
      else if (y < top) v = (y - fadeIn) / (top - fadeIn)
      else if (y > fadeOut) v = Math.max(0, 1 - (y - fadeOut) / (vh * 0.4))
      host.style.setProperty('--sw-exit', String(v))
      host.classList.toggle('is-hidden', v <= 0.001)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const relayout = () => window.dispatchEvent(new Event('resize'))
    window.addEventListener('load', relayout)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('load', relayout)
      host.innerHTML = ''
    }
  }, [])

  return <section id="story" ref={ref} className="sw-host" />
}
