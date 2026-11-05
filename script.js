const canvas = document.getElementById('c');
const context = canvas.getContext('2d');
const $ = (id) => document.getElementById(id);

let width;
let height;
let centerX;
let centerY;
let scale;
let wideLayout;
let exponent = 1;
let tilt = Math.cos((72 * Math.PI) / 180);
let lens = true;
let rings = [1, 0, 0];
let eaten = 0;
let flash = 0;
let drag = null;
let mouse = null;
let particles = [];
let stars = [];
let disk = [];
let lastFrame = performance.now();

const mass = () => Math.pow(10, exponent);
const schwarzschildRadius = () => (16 + exponent * 7) * scale;
const lightSpeed = () => 420 * scale;
const gravitationalParameter = () =>
  0.5 * schwarzschildRadius() * lightSpeed() * lightSpeed();

const formatNumber = (value, decimals) =>
  value.toFixed(decimals).replace('.', ',');

const formatLargeNumber = (value) => {
  if (value >= 1e9) return `${formatNumber(value / 1e9, 1)} bilhões`;
  if (value >= 1e6) return `${formatNumber(value / 1e6, 1)} milhões`;
  if (value >= 1e4) return Math.round(value).toLocaleString('pt-BR');
  return formatNumber(value, value < 100 ? 1 : 0);
};

// Canvas and simulation setup
function resize() {
  const pixelRatio = devicePixelRatio || 1;
  width = innerWidth;
  height = innerHeight;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  wideLayout = width > 760;

  if (wideLayout) {
    centerX = (width - 374) / 2;
    centerY = height / 2;
    scale = Math.min(width - 374, height) / 650;
  } else {
    centerX = width / 2;
    centerY = height * 0.28;
    scale = Math.min(width, height * 0.54) / 600;
  }
}

addEventListener('resize', resize);
resize();

for (let i = 0; i < 650; i++) {
  stars.push({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 1.3 + 0.3,
    phase: Math.random() * 6.28,
  });
}

for (let i = 0; i < 1500; i++) {
  disk.push({
    angle: Math.random() * 6.283,
    radius: 1.8 + Math.pow(Math.random(), 1.6) * 4.2,
  });
}

// Laboratory controls
function setExponent(value) {
  exponent = Math.max(0, Math.min(10, value));
  $('m').value = exponent;
}

function preset(value) {
  setExponent(value);
}

function launchParticle(radiusInRs) {
  const radius = schwarzschildRadius();
  const angle = Math.random() * 6.283;
  const distance = radiusInRs * radius;
  const velocity = Math.sqrt(gravitationalParameter() / distance);

  particles.push({
    x: centerX + distance * Math.cos(angle),
    y: centerY + distance * Math.sin(angle),
    vx: -velocity * Math.sin(angle),
    vy: velocity * Math.cos(angle),
    trail: [],
    hue: radiusInRs >= 3 ? 170 : 10,
  });
}

function toggleLens() {
  lens = !lens;
  $('l').checked = lens;
}

$('m').oninput = (event) => setExponent(+event.target.value);
$('t').oninput = (event) => {
  tilt = Math.cos((event.target.value * Math.PI) / 180);
};
$('l').onchange = (event) => {
  lens = event.target.checked;
};

[1, 2, 3].forEach((index) => {
  $(`r${index}`).onchange = (event) => {
    rings[index - 1] = event.target.checked ? 1 : 0;
  };
});

addEventListener(
  'wheel',
  (event) => {
    if (event.target === canvas) setExponent(exponent - event.deltaY * 0.002);
  },
  { passive: true },
);

canvas.addEventListener('pointerdown', (event) => {
  mouse = { x: event.clientX, y: event.clientY };
  drag = {
    startX: event.clientX,
    startY: event.clientY,
    endX: event.clientX,
    endY: event.clientY,
  };
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  mouse = { x: event.clientX, y: event.clientY };
  if (drag) {
    drag.endX = event.clientX;
    drag.endY = event.clientY;
  }
});

canvas.addEventListener('pointerleave', () => {
  if (!drag) mouse = null;
});

canvas.addEventListener('pointerup', () => {
  if (!drag) return;

  const velocityScale = 2.2;
  particles.push({
    x: drag.startX,
    y: drag.startY,
    vx: (drag.endX - drag.startX) * velocityScale,
    vy: (drag.endY - drag.startY) * velocityScale,
    trail: [],
    hue: Math.random() * 60 + 170,
  });
  drag = null;
});

// Navigation and lessons
document.querySelectorAll('nav button').forEach((button) => {
  button.onclick = () => {
    document
      .querySelectorAll('nav button, .tab')
      .forEach((element) => element.classList.remove('on'));
    button.classList.add('on');
    $(button.dataset.t).classList.add('on');
  };
});

const lessons = [
  {
    rings: [1, 0, 0],
    lens: 1,
    html: `<h3>1. O que é um buraco negro?</h3>
      <p>É uma região onde a gravidade é tão intensa que nem a luz consegue escapar. Pode surgir, por exemplo, quando uma estrela muito massiva colapsa no fim da vida.</p>
      <p>A fronteira sem volta é o <b>horizonte de eventos</b> (círculo vermelho). Clique e arraste na tela para lançar matéria e veja o que acontece quando ela cruza essa fronteira.</p>`,
  },
  {
    rings: [1, 0, 0],
    lens: 1,
    html: `<h3>2. O raio de Schwarzschild</h3>
      <p>O tamanho do horizonte depende só da massa: <b>rs = 2GM/c²</b>, cerca de 2,95 km para cada massa solar (M☉). Se o Sol virasse um buraco negro, teria só uns 6 km de diâmetro.</p>
      <p>Compare três casos. Os valores aparecem no canto superior esquerdo.</p>
      <p><button onclick="preset(1)">Estelar (10 M☉)</button><button onclick="preset(6.63)">Sagitário A*</button><button onclick="preset(9.81)">M87*</button></p>
      <p class="note">Sagitário A* tem cerca de 4,3 milhões de M☉ e M87* cerca de 6,5 bilhões. O desenho na tela é só simbólico.</p>`,
  },
  {
    rings: [0, 0, 0],
    lens: 1,
    html: `<h3>3. Lente gravitacional</h3>
      <p>A massa curva o espaço-tempo, e a luz segue essa curvatura. Estrelas que estão atrás do buraco negro aparecem deslocadas, formando um anel ao redor dele (anel de Einstein).</p>
      <p>Alterne para ver a diferença:</p>
      <p><button onclick="toggleLens()">Ligar/desligar lente</button></p>`,
  },
  {
    rings: [1, 1, 0],
    lens: 1,
    html: `<h3>4. Esfera de fótons</h3>
      <p>A <b>1,5 rs</b> do centro a gravidade é forte o bastante para fazer a luz orbitar o buraco negro, mas essa órbita é instável: qualquer perturbação a faz fugir ou cair. É isso que forma o anel brilhante (círculo dourado).</p>
      <p class="note">Na imagem real de um buraco negro, a “sombra” parece ~2,6 rs porque a luz é desviada. Aqui o desenho é simplificado.</p>`,
  },
  {
    rings: [1, 1, 1],
    lens: 1,
    html: `<h3>5. Disco de acreção e última órbita estável</h3>
      <p>A matéria que cai forma um disco que esquenta por atrito e brilha. O lado que se aproxima de nós parece mais brilhante (efeito Doppler).</p>
      <p>Na relatividade geral, não existem órbitas circulares estáveis abaixo de <b>3 rs</b> (círculo ciano). Teste a diferença:</p>
      <p><button onclick="launchParticle(5)">Órbita a 5 rs</button><button onclick="launchParticle(2)">Órbita a 2 rs</button></p>
      <p class="note">A de 5 rs orbita; a de 2 rs espirala para dentro.</p>`,
  },
  {
    rings: [1, 0, 0],
    lens: 1,
    html: `<h3>6. Tempo e velocidade de escape</h3>
      <p>Mova o cursor sobre a tela e leia, no canto superior esquerdo, os valores da posição dele.</p>
      <p>A velocidade de escape é <b>√(rs/r)</b> da velocidade da luz: chega a 100% no horizonte. Para um observador distante, um relógio perto do horizonte anda mais devagar, com fator <b>√(1 − rs/r)</b>, e quase pára ao se aproximar dele.</p>`,
  },
];

let lessonIndex = 0;

function showLesson(index) {
  lessonIndex = index;
  const lesson = lessons[index];
  rings = lesson.rings.slice();

  [1, 2, 3].forEach((ringIndex) => {
    $(`r${ringIndex}`).checked = !!rings[ringIndex - 1];
  });

  const nextAction =
    index < lessons.length - 1
      ? `showLesson(${index + 1})`
      : `document.querySelector('[data-t=quiz]').click()`;
  const nextLabel =
    index < lessons.length - 1 ? 'Próxima ›' : 'Ir ao quiz ›';

  $('learn').innerHTML =
    lesson.html +
    `<div class="step">
      <button onclick="showLesson(${Math.max(0, index - 1)})" ${
        index ? '' : 'disabled'
      }>‹ Anterior</button>
      <span>${index + 1} / ${lessons.length}</span>
      <button onclick="${nextAction}">${nextLabel}</button>
    </div>`;
}

showLesson(0);

// Quiz
const questions = [
  {
    question: 'O que define o horizonte de eventos?',
    options: [
      'Uma superfície sólida',
      'A fronteira além da qual nem a luz escapa',
      'A região mais quente do disco',
      'O limite externo do disco',
    ],
    answer: 1,
    explanation:
      'É a fronteira sem volta: dentro dela, a velocidade de escape passa da velocidade da luz.',
  },
  {
    question: 'De que depende o raio do horizonte (rs)?',
    options: [
      'Da massa',
      'Da cor do disco',
      'Da rotação do observador',
      'Da distância das estrelas',
    ],
    answer: 0,
    explanation: 'rs = 2GM/c². Dobrar a massa dobra o raio.',
  },
  {
    question:
      'Por que estrelas de fundo parecem deformadas perto do buraco negro?',
    options: [
      'Elas explodem',
      'Lente gravitacional: a massa curva o caminho da luz',
      'O disco reflete a luz',
      'É só um efeito da câmera',
    ],
    answer: 1,
    explanation:
      'A luz segue o espaço-tempo curvo, o que desloca e distorce as imagens.',
  },
  {
    question:
      'Abaixo de qual distância não há órbita circular estável (buraco negro sem rotação)?',
    options: ['1 rs', '1,5 rs', '3 rs', '10 rs'],
    answer: 2,
    explanation:
      'A última órbita circular estável fica em 3 rs (6GM/c²). Mais perto, a matéria cai.',
  },
  {
    question: 'Visto de longe, um relógio perto do horizonte…',
    options: [
      'Anda mais rápido',
      'Anda no mesmo ritmo',
      'Anda mais devagar',
      'Anda para trás',
    ],
    answer: 2,
    explanation:
      'Fator √(1 − rs/r): quanto mais perto do horizonte, mais devagar.',
  },
];

let questionIndex = 0;
let score = 0;

function renderQuestion() {
  const quiz = $('quiz');

  if (questionIndex >= questions.length) {
    quiz.innerHTML = `<h3>Resultado</h3>
      <p>Você acertou <b>${score} de ${questions.length}</b>.</p>
      <p><button onclick="questionIndex=0;score=0;renderQuestion()">Refazer</button><button onclick="document.querySelector('[data-t=learn]').click()">Rever lições</button></p>`;
    return;
  }

  const question = questions[questionIndex];
  quiz.innerHTML =
    `<h3>Pergunta ${questionIndex + 1} / ${questions.length}</h3>
      <p>${question.question}</p>` +
    question.options
      .map(
        (option, index) =>
          `<button class="quiz-option" onclick="answerQuestion(${index})">${option}</button>`,
      )
      .join('') +
    '<div id="fb"></div>';
}

function answerQuestion(index) {
  const question = questions[questionIndex];
  const isCorrect = index === question.answer;
  if (isCorrect) score++;

  [...$('quiz').querySelectorAll('button')].forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === question.answer) {
      button.style.borderColor = '#5ee08a';
    } else if (buttonIndex === index) {
      button.style.borderColor = '#ff6b6b';
    }
  });

  $('fb').innerHTML = `<p class="quiz-feedback">
    <b>${isCorrect ? 'Correto!' : 'Não foi dessa vez.'}</b>
    ${question.explanation}
    </p><button onclick="questionIndex++;renderQuestion()">${
      questionIndex < questions.length - 1 ? 'Próxima' : 'Ver resultado'
    }</button>`;
}

renderQuestion();

// Physics and rendering
function step(deltaTime) {
  const radius = schwarzschildRadius();
  const gravity = gravitationalParameter();
  const lightSpeedSquared = lightSpeed() * lightSpeed();

  for (let iteration = 0; iteration < 8; iteration++) {
    const timeStep = deltaTime / 8;

    for (let index = particles.length - 1; index >= 0; index--) {
      const particle = particles[index];
      const dx = centerX - particle.x;
      const dy = centerY - particle.y;
      const distanceSquared = dx * dx + dy * dy;
      const distance = Math.sqrt(distanceSquared);
      const angularMomentum =
        -dx * particle.vy + dy * particle.vx;
      const acceleration =
        gravity / distanceSquared +
        (3 * gravity * angularMomentum * angularMomentum) /
          (lightSpeedSquared * distanceSquared * distanceSquared);

      particle.vx += (acceleration * dx * timeStep) / distance;
      particle.vy += (acceleration * dy * timeStep) / distance;
      particle.x += particle.vx * timeStep;
      particle.y += particle.vy * timeStep;

      if (distance < radius) {
        particles.splice(index, 1);
        eaten++;
        $('n').textContent = eaten;
        flash = 1;
      } else if (distance > Math.max(width, height) * 3) {
        particles.splice(index, 1);
      }
    }
  }

  for (const particle of particles) {
    particle.trail.push(particle.x, particle.y);
    if (particle.trail.length > 90) particle.trail.splice(0, 2);
  }

  flash = Math.max(0, flash - deltaTime * 2.5);
}

function drawStars(time, radius) {
  for (const star of stars) {
    let starX = star.x * width;
    let starY = star.y * height;

    if (lens) {
      const dx = starX - centerX;
      const dy = starY - centerY;
      const distance = Math.hypot(dx, dy) || 1;
      const einsteinRadius = radius * 1.6;
      const adjustedRadius =
        0.5 *
        (distance +
          Math.sqrt(distance * distance + 4 * einsteinRadius * einsteinRadius));
      starX = centerX + (dx / distance) * adjustedRadius;
      starY = centerY + (dy / distance) * adjustedRadius;
    }

    context.globalAlpha =
      0.45 + 0.55 * Math.sin(time * 0.0015 + star.phase) ** 2;
    context.fillStyle = '#dfe6ff';
    context.fillRect(starX, starY, star.size, star.size);
  }

  context.globalAlpha = 1;
}

function drawDisk(isFront, deltaTime, radius, gravity) {
  context.globalCompositeOperation = 'lighter';

  for (const point of disk) {
    const distance = point.radius * radius;
    if (isFront === false) {
      point.angle += Math.sqrt(gravity / (distance * distance * distance)) * deltaTime;
    }

    const sine = Math.sin(point.angle);
    const cosine = Math.cos(point.angle);
    if ((sine > 0) !== isFront) continue;

    const pointX = centerX + distance * cosine;
    const pointY = centerY + distance * sine * tilt;
    const brightness = 0.55 - 0.45 * cosine;
    const falloff = 1 - (point.radius - 1.8) / 4.2;
    const size = (1.1 + falloff * 1.4) * scale + 0.5;

    context.fillStyle = `hsla(${20 + brightness * 32},100%,${
      38 + brightness * 34
    }%,${(0.15 + 0.7 * falloff) * (0.5 + brightness * 0.7)})`;
    context.fillRect(pointX, pointY, size, size);
  }

  context.globalCompositeOperation = 'source-over';
}

const ringColors = ['#ff6b6b', '#ffd166', '#5ee0ff'];
const ringNames = [
  'Horizonte de eventos (1 rs)',
  'Esfera de fótons (1,5 rs)',
  'Última órbita estável (3 rs)',
];
const ringRadii = [1, 1.5, 3];

function drawRings(radius) {
  context.lineWidth = 1.5;
  context.setLineDash([6, 5]);

  ringRadii.forEach((ringRadius, index) => {
    if (!rings[index]) return;

    context.strokeStyle = ringColors[index];
    context.beginPath();
    context.arc(centerX, centerY, radius * ringRadius, 0, 6.283);
    context.stroke();
  });

  context.setLineDash([]);
}

function updateReadout(radius) {
  $('rm').textContent = formatLargeNumber(mass());
  const kilometers = 2.953 * mass();
  const astronomicalUnits = kilometers / 1.496e8;
  $('rr').textContent =
    formatLargeNumber(kilometers) +
    ' km' +
    (kilometers >= 1e6
      ? ` (≈ ${formatNumber(astronomicalUnits, astronomicalUnits < 10 ? 2 : 0)} UA)`
      : '');

  $('lg').innerHTML =
    rings
      .map((visible, index) =>
        visible
          ? `<i style="background:${ringColors[index]}"></i>${ringNames[index]}&nbsp; `
          : '',
      )
      .join('') + (rings.some((visible) => visible) ? '<br>' : '');

  if (mouse) {
    const relativeDistance =
      Math.hypot(mouse.x - centerX, mouse.y - centerY) / radius;
    $('pr').textContent =
      relativeDistance <= 1
        ? 'Cursor dentro do horizonte: nada escapa.'
        : `Cursor a ${formatNumber(relativeDistance, 1)} rs · escape: ${formatNumber(
            Math.sqrt(1 / relativeDistance) * 100,
            0,
          )}% de c · relógio: ${formatNumber(
            Math.sqrt(1 - 1 / relativeDistance),
            2,
          )}× o ritmo de longe`;
  } else {
    $('pr').textContent = '';
  }
}

function frame(timestamp) {
  const deltaTime = Math.min(0.033, (timestamp - lastFrame) / 1000);
  lastFrame = timestamp;
  step(deltaTime);

  const radius = schwarzschildRadius();
  const gravity = gravitationalParameter();
  context.fillStyle = '#02030a';
  context.fillRect(0, 0, width, height);

  drawStars(timestamp, radius);
  drawDisk(false, deltaTime, radius, gravity);

  const glow = context.createRadialGradient(
    centerX,
    centerY,
    radius * 0.9,
    centerX,
    centerY,
    radius * 2.6,
  );
  glow.addColorStop(0, `rgba(255,170,80,${0.28 + flash * 0.4})`);
  glow.addColorStop(1, 'rgba(255,120,40,0)');
  context.fillStyle = glow;
  context.beginPath();
  context.arc(centerX, centerY, radius * 2.6, 0, 6.283);
  context.fill();

  context.fillStyle = '#000';
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 6.283);
  context.fill();

  context.save();
  context.shadowColor = `rgba(255,190,110,${0.8 + flash * 0.2})`;
  context.shadowBlur = 18 + flash * 30;
  context.strokeStyle = `rgba(255,226,180,${0.85 + flash * 0.15})`;
  context.lineWidth = 2.2 * scale + flash * 3;
  context.beginPath();
  context.arc(centerX, centerY, radius * 1.03, 0, 6.283);
  context.stroke();
  context.restore();

  drawDisk(true, deltaTime, radius, gravity);
  drawRings(radius);

  for (const particle of particles) {
    context.lineWidth = 2 * scale;
    context.lineCap = 'round';
    const trailLength = particle.trail.length / 2;

    for (let index = 1; index < trailLength; index++) {
      context.strokeStyle = `hsla(${particle.hue},100%,70%,${
        (index / trailLength) * 0.8
      })`;
      context.beginPath();
      context.moveTo(
        particle.trail[index * 2 - 2],
        particle.trail[index * 2 - 1],
      );
      context.lineTo(
        particle.trail[index * 2],
        particle.trail[index * 2 + 1],
      );
      context.stroke();
    }

    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(particle.x, particle.y, 2.4 * scale + 0.6, 0, 6.283);
    context.fill();
  }

  if (drag) {
    context.strokeStyle = 'rgba(255,255,255,.7)';
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(drag.startX, drag.startY);
    context.lineTo(drag.endX, drag.endY);
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(drag.startX, drag.startY, 4, 0, 6.283);
    context.fill();
  }

  updateReadout(radius);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
