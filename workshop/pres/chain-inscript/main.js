import { slides } from './slides.js'

const deck = document.getElementById('deck')
const progressFill = document.getElementById('progress-fill')
const counter = document.getElementById('topbar-counter')

let current = 0
const total = slides.length

const pad = (n) => String(n).padStart(2, '0')

function renderSlides() {
  deck.innerHTML = slides.map((html, i) =>
    `<div class="slide ${i === 0 ? 'active booting' : ''}" data-index="${i}" data-screen-label="${pad(i + 1)}">${html}</div>`
  ).join('')

  setTimeout(() => deck.querySelector('.slide').classList.remove('booting'), 1100)

  document.body.insertAdjacentHTML('beforeend',
    `<div class="key-hint">← → navigate &nbsp;|&nbsp; space = next</div>`
  )

  updateProgress()
}

function goTo(index) {
  if (index < 0 || index >= total || index === current) return

  const slideEls = document.querySelectorAll('.slide')
  const leaving = slideEls[current]
  const entering = slideEls[index]

  leaving.classList.remove('active')
  leaving.classList.add('exiting')

  entering.style.transform = index > current ? 'translateX(60px)' : 'translateX(-60px)'
  entering.offsetHeight
  entering.classList.add('active', 'booting')
  entering.style.transform = ''
  setTimeout(() => entering.classList.remove('booting'), 1100)

  setTimeout(() => leaving.classList.remove('exiting'), 500)

  current = index
  updateProgress()
}

function updateProgress() {
  const pct = ((current + 1) / total) * 100
  progressFill.style.width = `${pct}%`
  if (counter) counter.textContent = `${pad(current + 1)} / ${pad(total)}`
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault()
    goTo(current + 1)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    goTo(current - 1)
  } else if (e.key === 'Home') {
    goTo(0)
  } else if (e.key === 'End') {
    goTo(total - 1)
  }
})

let touchStartX = 0
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX })
document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) > 50) {
    dx < 0 ? goTo(current + 1) : goTo(current - 1)
  }
})

renderSlides()
