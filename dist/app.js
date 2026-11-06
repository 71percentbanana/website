const projectNotes = {
  bouncepay: {
    title: 'BouncePay',
    intro: 'A store-and-forward payment prototype built for the fintech track of iQOO City Battles 2026.',
    challenge: 'A buyer and merchant can both be offline. The transaction still needs a path to a connected device, while keeping the payment message verifiable across every relay.',
    build: 'I built an Android BLE mesh that forwards signed transactions through nearby devices to an online bridge and a mock settlement service. Custom framing and chunking handle cryptographic payloads over 800 bytes across Android GATT limits.',
    detail: 'ECDSA P-256 signing, SHA-256 identities, replay protection, packet deduplication, loop avoidance, and offline settlement verification support the transport layer.',
    stack: ['Kotlin', 'Android', 'BLE / GATT', 'Node.js', 'ECDSA'],
    url: 'https://github.com/71percentbanana/bouncepay'
  },
  decision: {
    title: 'Expert Decision Replay',
    intro: 'A decision history platform developed during Infosys Springboard 7.0.',
    challenge: 'Teams need to remember more than the final decision. Alternatives, risks, approvals, and outcomes provide the context needed to understand why a choice was made.',
    build: 'I developed backend workflows with Python, FastAPI, and PostgreSQL to preserve decision records and support review. The platform includes role-based access, approval workflows, version history, document management, and audit logs.',
    detail: 'Decision tracking connects the original reasoning to later outcomes, giving teams a record they can revisit as circumstances change.',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'React'],
    url: 'https://github.com/71percentbanana/Expert-Decision-Relay-Platform'
  },

  "cloud": {
    "title": "Stability-Aware Cloud Scheduling",
    "intro": "Co-authored research and a Python discrete-time simulator for cloud-orchestrated volunteer computing, with Mishti Parikshit Gandhi and Abhyuday Thapliyal.",
    "challenge": "Volunteer desktops and laptops can disconnect or lose power mid-task. A scheduler needs to decide when to keep running, start a backup, or move the work to the cloud.",
    "build": "Our simulator re-estimates interruption risk as a task runs. It can start a backup from a checkpoint on a device with a different availability pattern, then use the cloud when volunteer devices are too risky.",
    "detail": "In the repository’s high-interruption simulation, the proposed scheduler met 99.79% of deadlines versus 93.37% for capability-only scheduling. The proposed scheduler used cloud fallback, so this comparison illustrates the reliability tradeoff.",
    "stack": [
      "Python",
      "Discrete-time simulation",
      "Checkpointing",
      "Scheduling"
    ],
    "url": "https://github.com/71percentbanana/Cloud-project"
  },
  "mql": {
    "title": "SQL2Mongo",
    "intro": "A C compiler and local dashboard that let you trace how a SQL query becomes a MongoDB aggregation pipeline.",
    "challenge": "Translating a query requires parsing the syntax, checking it against a schema, and preserving its meaning through code generation.",
    "build": "The compiler exposes seven stages, from tokenization and AST construction through intermediate code, optimization, MongoDB code generation, and execution. The Node.js dashboard runs the compiled executable and presents the pipeline, phase trace, and results.",
    "detail": "The local C engine runs queries against JSON documents. Tests exercise filtering, projection, sorting, limits, error handling, and the HTTP API.",
    "stack": [
      "C",
      "Node.js",
      "AST",
      "MongoDB aggregation"
    ],
    "url": "https://github.com/71percentbanana/MQL"
  },
  "microbit": {
    "title": "micro:bit Motion Lab",
    "intro": "Two machine-learning projects share one dashboard for live activity recognition and custom gesture training.",
    "challenge": "A three-axis accelerometer produces a stream of readings. The system needs to turn those signals into recognizable activities and gestures.",
    "build": "The activity model uses sliding windows and 107 extracted features to classify six activities. A separate gesture classifier lets users record examples, train a Random Forest, and see predictions in the dashboard.",
    "detail": "The gesture workflow can export a compact model to run on the micro:bit itself and display predictions on its LED matrix.",
    "stack": [
      "BBC micro:bit",
      "Python",
      "Random Forest",
      "MakeCode"
    ],
    "url": "https://github.com/71percentbanana/microbit-activity-tracker"
  },
  "shotmatch": {
    "title": "ShotMatch",
    "intro": "An interactive photography concept demo by Alan James, Anuroop Phukan, and Ishaan Sridharan.",
    "challenge": "Recreating a reference composition takes several adjustments to framing, lighting, and color. The demo puts those controls in one workspace.",
    "build": "The browser tool includes manual pan and zoom, a composition grid, reference palette extraction, image adjustments, and before-and-after comparison. Visitors can try built-in scenes or work with a local photo.",
    "detail": "Framing feedback uses preset guides for the built-in scenes. The demo supports JPEG export and optional camera capture.",
    "stack": [
      "JavaScript",
      "Canvas",
      "Web camera API",
      "Capacitor"
    ],
    "url": "https://github.com/71percentbanana/ShotMatch",
    "extra": "https://shot-match-iota.vercel.app",
    "extraLabel": "Try the live demo"
  }
};

const dialog = document.querySelector('#project-dialog');
const dialogContent = document.querySelector('#dialog-content');
let dialogTrigger;
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const project = projectNotes[button.dataset.project];
    dialogTrigger = button;
    // Only these authored project records are rendered here.
    dialogContent.innerHTML = `<h2 id="dialog-title">${project.title}</h2>
      <p>${project.intro}</p><div class="tags">${project.stack.map(tool => `<span>${tool}</span>`).join('')}</div>
      <h3>The challenge</h3><p>${project.challenge}</p>
      <h3>What I built</h3><p>${project.build}</p>
      <h3>A closer look</h3><p>${project.detail}</p>
      <a class="button primary" href="${project.url}" target="_blank" rel="noopener noreferrer">Explore the repository ↗</a>
      ${project.extra ? `<a class="text-link demo-link" href="${project.extra}" target="_blank" rel="noopener noreferrer">${project.extraLabel} ↗</a>` : '<span hidden></span>'}<p class="visual-disclosure">Project card artwork is an illustrative concept preview.</p>`;
    dialog.showModal();
    dialog.scrollTop = 0;
  });
});
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
dialog.addEventListener('close', () => dialogTrigger?.focus({ preventScroll: true }));

const cards = [...document.querySelectorAll('.project-card')];
const filters = [...document.querySelectorAll('[data-filter]')];
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  cards.forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
  });
  const visibleCount = cards.filter(card => !card.hidden).length;
  document.querySelector('#filter-status').textContent = `Showing ${visibleCount} project${visibleCount === 1 ? '' : 's'}`;
  document.querySelector('.projects').classList.toggle('filtered', button.dataset.filter !== 'all');
}));

const copyButton = document.querySelector('#copy-email');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('alanvjames1@gmail.com');
    copyButton.textContent = 'Copied ✓';
    document.querySelector('#copy-status').textContent = 'Email address copied.';
  } catch {
    copyButton.textContent = 'Select email to copy';
    document.querySelector('#copy-status').textContent = 'Clipboard unavailable. Select the displayed email address to copy it.';
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
const sculptureTraits = [
  [
    "Systems thinking",
    "BouncePay",
    "I designed a store-and-forward Bluetooth mesh so signed payments could travel through nearby phones until one reached the internet."
  ],
  [
    "Human curiosity",
    "micro:bit Motion Lab",
    "I explored how a small accelerometer could recognize everyday activity and gestures, then built a dashboard for recording examples and testing predictions."
  ],
  [
    "Research rigor",
    "Cloud Scheduling",
    "My co-authors and I tested adaptive scheduling in simulation, comparing deadline completion and cloud usage across different interruption conditions."
  ],
  [
    "Security mindset",
    "BouncePay",
    "I used ECDSA signatures, replay protection, and packet deduplication to keep transactions verifiable as they passed through the mesh."
  ],
  [
    "Practical automation",
    "Formial Labs",
    "I built n8n workflows for ad campaign operations and developed dashboards and CRM workflows to support day-to-day work."
  ],
  [
    "End-to-end building",
    "SQL2Mongo",
    "The SQL2Mongo project connects a C compiler to a Node.js dashboard that shows each stage from parsing a query to generating a MongoDB pipeline."
  ]
];
const dialogEyebrow = dialog.querySelector('.dialog-top .eyebrow');
document.querySelectorAll('[data-trait]').forEach(button => {
  button.addEventListener('click', () => {
    const [quality, example, evidence] = sculptureTraits[Number(button.dataset.trait)];
    dialogTrigger = button;
    dialogEyebrow.textContent = 'HOW I WORK';
    dialogContent.innerHTML = `<h2 id="dialog-title">${quality}</h2><h3>${example}</h3><p>${evidence}</p>`;
    dialog.showModal();
    dialog.scrollTop = 0;
  });
});
dialog.addEventListener('close', () => { dialogEyebrow.textContent = 'PROJECT NOTES'; });

// Reveal content once, retaining ordinary page scrolling and keyboard navigation.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('waiting');
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold:.08 });
  document.querySelectorAll('.project-card,.section-heading,.about-grid,.experience,.contact-heading').forEach(element => {
    element.classList.add('reveal', 'waiting');
    revealObserver.observe(element);
    element.addEventListener('focusin', () => {
      element.classList.remove('waiting');
      revealObserver.unobserve(element);
    }, { once:true });
  });
  motionPreference.addEventListener('change', event => {
    if (event.matches) {
      document.querySelectorAll('.reveal.waiting').forEach(element => element.classList.remove('waiting'));
      revealObserver.disconnect();
    }
  });
}
document.querySelectorAll('.project-visual').forEach(visual => {
  visual.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || motionPreference.matches) return;
    const box = visual.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    visual.style.setProperty('--tilt-x', `${(y - .5) * -5}deg`);
    visual.style.setProperty('--tilt-y', `${(x - .5) * 5}deg`);
    visual.style.setProperty('--glow-x', `${x * 100}%`);
    visual.style.setProperty('--glow-y', `${y * 100}%`);
  });
  visual.addEventListener('pointerleave', () => {
    visual.style.removeProperty('--tilt-x');
    visual.style.removeProperty('--tilt-y');
  });
});
