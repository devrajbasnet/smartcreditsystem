(function(){
  const card = document.getElementById('card');
  const scene = document.getElementById('cardScene');
  const cardNumberInput = document.getElementById('cardNumber');
  const cardNameInput = document.getElementById('cardName');
  const expiryInput = document.getElementById('expiry');
  const cvvInput = document.getElementById('cvv');
  const networkLabel = document.getElementById('networkLabel');
  const cardNumberDisplay = document.getElementById('cardNumberDisplay');
  const nameDisplay = document.getElementById('nameDisplay');
  const expiryDisplay = document.getElementById('expiryDisplay');
  const cvvDisplay = document.getElementById('cvvDisplay');
  const payForm = document.getElementById('payForm');
  const payBtn = document.getElementById('payBtn');
  const successView = document.getElementById('successView');

  let tiltX = 0, tiltY = 0;
  let isFlipped = false;

  // ---- 3D tilt on mouse move ----
  scene.addEventListener('mousemove', (e) => {
    const rect = scene.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;  // 0..1
    const py = (e.clientY - rect.top) / rect.height;
    tiltY = (px - 0.5) * 26;   // rotateY
    tiltX = (0.5 - py) * 18;   // rotateX
    applyTransform();
  });
  scene.addEventListener('mouseleave', () => {
    tiltX = 0; tiltY = 0;
    applyTransform();
  });

  function applyTransform(){
    const flipDeg = isFlipped ? 180 : 0;
    card.style.transform = rotateX(${tiltX}deg) rotateY(${flipDeg + tiltY}deg);
  }

  // ---- card number formatting + network detection ----
  function detectNetwork(digits){
    if(/^4/.test(digits)) return 'VISA';
    if(/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'MASTERCARD';
    if(/^3[47]/.test(digits)) return 'AMEX';
    if(/^6(?:011|5)/.test(digits)) return 'DISCOVER';
    return '';
  }

  cardNumberInput.addEventListener('input', () => {
    let digits = cardNumberInput.value.replace(/\D/g,'').slice(0,16);
    let formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    cardNumberInput.value = formatted;

    networkLabel.textContent = detectNetwork(digits);

    const groups = digits.match(/.{1,4}/g) || [];
    const spans = cardNumberDisplay.querySelectorAll('.grp');
    spans.forEach((span, i) => {
      if(groups[i]){
        span.textContent = groups[i].padEnd(4, '•');
        span.classList.add('filled');
      } else {
        span.textContent = '••••';
        span.classList.remove('filled');
      }
    });
    clearError('cardNumber');
  });

  cardNameInput.addEventListener('input', () => {
    nameDisplay.textContent = cardNameInput.value.trim() ? cardNameInput.value.toUpperCase() : 'YOUR NAME';
    clearError('cardName');
  });

  expiryInput.addEventListener('input', () => {
    let v = expiryInput.value.replace(/\D/g,'').slice(0,4);
    if(v.length >= 3){
      v = v.slice(0,2) + '/' + v.slice(2);
    }
    expiryInput.value = v;
    expiryDisplay.textContent = v.length ? (v + 'MM/YY'.slice(v.length)) : 'MM/YY';
    clearError('expiry');
  });

  cvvInput.addEventListener('input', () => {
    cvvInput.value = cvvInput.value.replace(/\D/g,'').slice(0,4);
    cvvDisplay.textContent = cvvInput.value ? cvvInput.value.padEnd(3,'•') : '•••';
    clearError('cvv');
  });

  cvvInput.addEventListener('focus', () => { isFlipped = true; applyTransform(); });
  cvvInput.addEventListener('blur', () => { isFlipped = false; applyTransform(); });

  // ---- validation ----
  function showError(field){
    document.getElementById(field).classList.add('invalid');
    document.getElementById('err-' + field).classList.add('show');
  }
  function clearError(field){
    document.getElementById(field).classList.remove('invalid');
    document.getElementById('err-' + field).classList.remove('show');
  }

  function validate(){
    let ok = true;
    const digits = cardNumberInput.value.replace(/\D/g,'');
    if(digits.length < 15){ showError('cardNumber'); ok = false; }

    if(cardNameInput.value.trim().length < 2){ showError('cardName'); ok = false; }

    const expMatch = expiryInput.value.match(/^(\d{2})\/(\d{2})$/);
    if(!expMatch){
      showError('expiry'); ok = false;
    } else {
      const mm = parseInt(expMatch[1], 10);
      const yy = parseInt(expMatch[2], 10);
      const now = new Date();
      const curYY = now.getFullYear() % 100;
      const curMM = now.getMonth() + 1;
      if(mm < 1 || mm > 12 || yy < curYY || (yy === curYY && mm < curMM)){
        showError('expiry'); ok = false;
      }
    }

    if(cvvInput.value.length < 3){ showError('cvv'); ok = false; }

    return ok;
  }

  // ---- render prefilled sample values onto the card on load ----
  ['input'].forEach(evt => {
    cardNumberInput.dispatchEvent(new Event(evt));
    cardNameInput.dispatchEvent(new Event(evt));
    expiryInput.dispatchEvent(new Event(evt));
    cvvInput.dispatchEvent(new Event(evt));
  });

  payForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!validate()) return;

    payBtn.disabled = true;
    payBtn.textContent = 'Processing…';

    setTimeout(() => {
      payForm.style.display = 'none';
      successView.classList.add('show');
    }, 900);
  });
})();