import './styles.css'
import { slides } from './slides.js'

const deck = document.getElementById('deck')
const progressFill = document.getElementById('progress-fill')
const counter = document.getElementById('slide-counter')

let current = 0
const total = slides.length

function renderSlides() {
  deck.innerHTML = slides.map((html, i) =>
    `<div class="slide ${i === 0 ? 'active' : ''}" data-index="${i}">${html}</div>`
  ).join('')

  document.body.insertAdjacentHTML('beforeend',
    `<div class="key-hint">← → navigate &nbsp;|&nbsp; space = next</div>`
  )

  updateProgress()
}

function goTo(index) {
  if (index < 0 || index >= total || index === current) return

  const slides = document.querySelectorAll('.slide')
  const leaving = slides[current]
  const entering = slides[index]

  leaving.classList.remove('active')
  leaving.classList.add('exiting')

  entering.style.transform = index > current ? 'translateX(60px)' : 'translateX(-60px)'
  entering.offsetHeight
  entering.classList.add('active')
  entering.style.transform = ''

  setTimeout(() => leaving.classList.remove('exiting'), 500)

  current = index
  updateProgress()
}

function updateProgress() {
  const pct = ((current + 1) / total) * 100
  progressFill.style.width = `${pct}%`
  counter.textContent = `${current + 1} / ${total}`
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
