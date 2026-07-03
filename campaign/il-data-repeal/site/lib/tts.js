/* ============================================================
   TTS Helper — Web Speech API wrapper
   ============================================================ */

export function speak(text, rate = 0.95) {
  if (!('speechSynthesis' in window)) return false;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  speechSynthesis.speak(utter);
  return true;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

export function isSpeaking() {
  if (!('speechSynthesis' in window)) return false;
  return speechSynthesis.speaking;
}

export function speakSequence(texts, rate = 0.95) {
  if (!('speechSynthesis' in window)) return false;
  speechSynthesis.cancel();

  texts.forEach((text, i) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    speechSynthesis.speak(utter);
  });

  return true;
}
