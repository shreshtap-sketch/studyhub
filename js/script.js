const STORE_KEY = "studyhub_v2";

const defaults = {
  name:"Learner",
  bio:"Curious mind. Always learning.",
  streak:0,
  lastVisit:"",
  words:0,
  challenges:[],
  languages:[],
  skills:[],
  projects:[],
  awardEntries:[],
  votes:{},
  weekly:[false,false,false,false,false,false,false]
};

let state = loadState();
let page = "home";
let activeLanguage = "Spanish";
let flashIndex = 0;
let discoverFilter = "All";
let activeHobby = "Guitar";

const $ = s => document.querySelector(s);
const app = $("#app");

function loadState(){
  try {
    return {...defaults,...JSON.parse(localStorage.getItem(STORE_KEY)||"{}")};
  } catch(e) {
    return {...defaults};
  }
}

function save(){
  localStorage.setItem(STORE_KEY,JSON.stringify(state));
}

function toast(msg){
  const t=$("#toast");
  t.textContent=msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2300);
}

function esc(s=""){
  return String(s).replace(/[&<>"']/g,c=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));
}

function initials(n){
  return (n||"L").trim().split(/\s+/).slice(0,2)
    .map(x=>x[0]).join("").toUpperCase();
}

function go(p){
  page=p;
  document.querySelectorAll(".nav-link").forEach(b=>
    b.classList.toggle("active",b.dataset.page===p)
  );
  $("#mobileNav").value=p;
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll("[data-page]").forEach(b=>{
  b.addEventListener("click",e=>{
    e.preventDefault();
    go(b.dataset.page);
  });
});

$("#mobileNav").addEventListener("change",e=>go(e.target.value));

$("#accountBtn").addEventListener("click",()=>{
  $("#accountName").value=state.name==="Learner"?"":state.name;
  $("#accountBio").value=state.bio;
  $("#accountDialog").showModal();
});

$("#accountForm").addEventListener("submit",e=>{
  if(e.submitter?.value==="cancel") return;
  e.preventDefault();

  state.name=$("#accountName").value.trim()||"Learner";
  state.bio=$("#accountBio").value.trim()||"Curious mind. Always learning.";

  save();
  $("#accountDialog").close();
  updateAccountButton();
  render();
  toast("Profile saved on this device");
});

$("#closeDetail").addEventListener("click",()=>{
  $("#detailDialog").close();
});

function updateAccountButton(){
  $("#accountBtn").textContent=state.name==="Learner"?"Sign in":state.name;
}

function pageHead(kicker,title,desc,action=""){
  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">${kicker}</p>
        <h1>${title}</h1>
        <p>${desc}</p>
      </div>
      ${action}
    </div>`;
}

function stat(label,num,foot){
  return `
    <div class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-number">${num}</div>
      <div class="stat-foot">${foot}</div>
    </div>`;
}

function tile(icon,title,desc,target,foot="Explore →"){
  return `
    <article class="tile" data-go="${target}">
      <div class="tile-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${desc}</p>
      <span class="tile-foot">${foot}</span>
    </article>`;
}

function weekStrip(){
  const days=["M","T","W","T","F","S","S"];

  return `
    <div class="streak-row">
      ${days.map((d,i)=>`
        <div class="day ${state.weekly[i]?"done":""}">
          <div class="day-dot">${state.weekly[i]?"✓":d}</div>
          <small>${d}</small>
        </div>
      `).join("")}
    </div>`;
}

/* HOME */

function renderHome(){
  return `
    ${pageHead(
      "YOUR PERSONAL LEARNING SPACE",
      "Make room for something new.",
      "Explore languages, discover creative interests and build skills at your own pace. Choose one path or mix them both.",
      `<button class="btn btn-outline" data-go="profile">Set up profile</button>`
    )}

    <section class="hero">
      <div>
        <p class="eyebrow">WELCOME TO STUDYHUB</p>
        <h1>Learn something. Create something. Share something.</h1>
        <p>A place to practise a language, explore a talent, meet other learners and keep track of every little win.</p>

        <div class="hero-actions">
          <button class="btn btn-gold" data-go="languages">Explore languages</button>
          <button class="btn btn-outline" data-go="hobbies">Explore hobbies</button>
        </div>
      </div>

      <div class="hero-side">
        <div class="big">${state.streak} days</div>
        <strong>Current learning streak</strong>
        <p>Come back regularly and keep your curiosity going.</p>
      </div>
    </section>

    <section class="section">
      <div class="section-title">
        <div>
          <h2>Your overview</h2>
          <p>A quick look at what you have been exploring.</p>
        </div>
        <button class="text-link" data-go="progress">View progress →</button>
      </div>

      <div class="stats-grid">
        ${stat("Challenges completed",state.challenges.length,"Keep trying new things")}
        ${stat("Words learned",state.words,"Vocabulary practice")}
        ${stat("Languages practising",state.languages.length,"Your language list")}
        ${stat("Skills explored",state.skills.length,"Interests added")}
      </div>
    </section>

    <section class="section">
      <div class="section-title">
        <div>
          <h2>What would you like to learn?</h2>
          <p>Pick a path. You can always come back and choose another.</p>
        </div>
      </div>

      <div class="choice-grid">
        ${tile("文","A new language","Build vocabulary, practise with flashcards and try quick quizzes.","languages")}
        ${tile("✦","A talent or hobby","Explore art, music, sport, coding and creative skills.","hobbies")}
        ${tile("↗️","A bit of both","Switch between language learning and hobbies whenever you like.","discover","Explore the whole hub →")}
      </div>
    </section>

    <section class="section two-col">
      <div class="panel">
        <div class="section-title">
          <h2>This week's activity</h2>
          <span class="tag gold">${state.streak} day streak</span>
        </div>

        ${weekStrip()}

        <p class="muted">Mark today complete when you finish a learning activity.</p>
        <button class="btn btn-primary" id="markToday">Mark today complete</button>
      </div>

      <div class="panel">
        <h3>Recommended for you</h3>

        <div class="progress-line">
          <div class="progress-line-head">
            <strong>Learn 5 new words</strong>
            <span>5–10 min</span>
          </div>
          <button class="text-link" data-go="languages">Start vocabulary →</button>
        </div>

        <div class="progress-line">
          <div class="progress-line-head">
            <strong>Try a creative challenge</strong>
            <span>10 min</span>
          </div>
          <button class="text-link" data-go="challenges">See challenges →</button>
        </div>

        <div class="progress-line">
          <div class="progress-line-head">
            <strong>Share a project</strong>
            <span>Anytime</span>
          </div>
          <button class="text-link" data-go="projects">Open projects →</button>
        </div>
      </div>
    </section>`;
}

/* LANGUAGES */

const languages=[
  ["🇪🇸","Spanish"],
  ["🇫🇷","French"],
  ["🇯🇵","Japanese"],
  ["🇩🇪","German"],
  ["🇮🇹","Italian"],
  ["🇰🇷","Korean"],
  ["🇮🇳","Hindi"],
  ["🇨🇳","Mandarin Chinese"],
  ["🇵🇹","Portuguese"],
  ["🇸🇦","Arabic"],
  ["🇷🇺","Russian"],
  ["🇬🇧","English"]
];

const vocab={
  Spanish:[
    ["Hola","Hello"],
    ["Gracias","Thank you"],
    ["Por favor","Please"],
    ["Agua","Water"],
    ["Amigo / Amiga","Friend"],
    ["Buenos días","Good morning"],
    ["Libro","Book"],
    ["Casa","House"]
  ],
  French:[
    ["Bonjour","Hello / Good morning"],
    ["Merci","Thank you"],
    ["S'il vous plaît","Please"],
    ["Eau","Water"],
    ["Ami / Amie","Friend"],
    ["Livre","Book"]
  ],
  Japanese:[
    ["こんにちは (Konnichiwa)","Hello"],
    ["ありがとう (Arigatou)","Thank you"],
    ["水 (Mizu)","Water"],
    ["友だち (Tomodachi)","Friend"],
    ["本 (Hon)","Book"]
  ],
  German:[
    ["Hallo","Hello"],
    ["Danke","Thank you"],
    ["Bitte","Please"],
    ["Wasser","Water"],
    ["Freund / Freundin","Friend"]
  ],
  Italian:[
    ["Ciao","Hello / Bye"],
    ["Grazie","Thank you"],
    ["Per favore","Please"],
    ["Acqua","Water"],
    ["Amico / Amica","Friend"]
  ],
  Hindi:[
    ["नमस्ते (Namaste)","Hello"],
    ["धन्यवाद (Dhanyavaad)","Thank you"],
    ["पानी (Paani)","Water"],
    ["दोस्त (Dost)","Friend"]
  ],
  Korean:[
    ["안녕하세요 (Annyeonghaseyo)","Hello"],
    ["감사합니다 (Gamsahamnida)","Thank you"],
    ["물 (Mul)","Water"],
    ["친구 (Chingu)","Friend"]
  ]
};

function renderLanguages(){
  const words=vocab[activeLanguage]||[
    ["Hello","A greeting"],
    ["Thank you","An expression of gratitude"],
    ["Please","A polite expression"],
    ["Friend","Someone you know and like"]
  ];

  const item=words[flashIndex%words.length];

  return `
    ${pageHead(
      "LANGUAGE STUDIO",
      "Find your next language.",
      "Choose a language and build your vocabulary one small session at a time."
    )}

    <div class="filter-row">
      ${languages.map(l=>`
        <button class="chip ${activeLanguage===l[1]?"active":""}" data-lang="${l[1]}">
          ${l[0]} ${l[1]}
        </button>
      `).join("")}
    </div>

    <div class="two-col">
      <div class="panel">
        <p class="eyebrow">YOUR DAILY VOCABULARY</p>
        <h2 style="font:800 23px Manrope;margin:0">${activeLanguage}</h2>
        <p class="muted">Flip through useful starter words. Select “I learned this” to add it to your progress.</p>

        <div class="word-card">
          <div class="word">${item[0]}</div>
          <div class="meaning">${item[1]}</div>
        </div>

        <div class="action-row">
          <button class="btn btn-outline" id="prevWord">← Previous</button>
          <button class="btn btn-outline" id="nextWord">Next word →</button>
          <button class="btn btn-gold" id="learnWord">I learned this ✓</button>
        </div>

        <p class="muted" id="wordCount">${flashIndex%words.length+1} of ${words.length} starter words</p>
      </div>

      <div class="panel">
        <p class="eyebrow">QUICK QUIZ</p>
        <h3>What does “${item[0]}” mean?</h3>

        <div class="quiz-options">
          ${[item[1],words[(flashIndex+1)%words.length][1],"Goodbye","Good luck"]
            .sort(()=>0.5-Math.random())
            .map(opt=>`
              <button class="quiz-option" data-answer="${esc(opt)}">${esc(opt)}</button>
            `).join("")}
        </div>

        <p class="muted" id="quizFeedback">Choose the correct meaning to practise.</p>
        <button class="btn btn-outline" id="newQuiz">New question</button>
      </div>
    </div>

    <section class="section">
      <div class="section-title">
        <div>
          <h2>Learning resources</h2>
          <p>Useful reference sites to continue practising.</p>
        </div>
      </div>

      <div class="resource-grid">
        <div class="resource-card">
          <h3>Wiktionary</h3>
          <p>Look up word meanings, translations and pronunciation.</p>
          <a href="https://www.wiktionary.org/" target="_blank" rel="noopener">Open Wiktionary ↗️</a>
        </div>

        <div class="resource-card">
          <h3>Wikipedia language portal</h3>
          <p>Read background information about languages and writing systems.</p>
          <a href="https://en.wikipedia.org/wiki/Language" target="_blank" rel="noopener">Explore languages ↗️</a>
        </div>

        <div class="resource-card">
          <h3>Duolingo</h3>
          <p>Try short guided lessons and vocabulary practice.</p>
          <a href="https://www.duolingo.com/" target="_blank" rel="noopener">Open Duolingo ↗️</a>
        </div>

        <div class="resource-card">
          <h3>Forvo</h3>
          <p>Listen to native-speaker pronunciation examples.</p>
          <a href="https://forvo.com/" target="_blank" rel="noopener">Open Forvo ↗️</a>
        </div>
      </div>
    </section>

    <div class="section panel">
      <h3>Practise together</h3>
      <p class="muted">For a real group session, ask a teacher or trusted adult to create and share a supervised meeting link.</p>
      <a class="btn btn-primary" href="https://meet.google.com/" target="_blank" rel="noopener">Open Google Meet ↗️</a>
    </div>`;
}

/* HOBBIES AND INTERESTS */

const hobbies=[
  ["📚","Reading","Build a reading habit, explore genres and share book recommendations."],
  ["🎮","Gaming","Explore game design, strategy, storytelling and teamwork."],
  ["🎨","Painting","Try colour, sketching, watercolour and digital art."],
  ["💻","Coding","Learn web design, programming basics and creative technology."],
  ["📷","Photography","Explore composition, lighting and visual storytelling."],
  ["🎸","Guitar","Start with chords, rhythm and simple practice routines."],
  ["🎹","Piano","Learn notes, scales, rhythm and beginner melodies."],
  ["🎻","Violin","Explore posture, bow basics and beginner practice."],
  ["🎹","Keyboard","Learn keys, chords and simple accompaniment."],
  ["🥁","Drums","Practise rhythm, timing and basic drum patterns."],
  ["🎤","Singing","Explore breathing, pitch and vocal warm-ups."],
  ["💃","Dance","Try movement, rhythm and different dance styles."],
  ["🏀","Sports","Build skills through practice, teamwork and movement."],
  ["✍️","Writing","Try poetry, short stories, journaling and creative writing."],
  ["🧶","Crafts","Make things with paper, fabric and recycled materials."]
];

const resources={
  "Reading":[
    ["Project Gutenberg","Free public-domain books and reading material.","https://www.gutenberg.org/"],
    ["Open Library","Discover books and reading lists.","https://openlibrary.org/"]
  ],
  "Gaming":[
    ["Scratch","Create simple interactive stories and games.","https://scratch.mit.edu/"],
    ["Unity Learn","Beginner-friendly game development learning.","https://learn.unity.com/"]
  ],
  "Painting":[
    ["Drawspace","Drawing and art lessons for different levels.","https://www.drawspace.com/"],
    ["YouTube: beginner painting","Find beginner painting tutorials.","https://www.youtube.com/results?search_query=beginner+painting+tutorial"]
  ],
  "Coding":[
    ["freeCodeCamp","Learn web development with guided lessons.","https://www.freecodecamp.org/"],
    ["MDN Web Docs","Reference guides for HTML, CSS and JavaScript.","https://developer.mozilla.org/"]
  ],
  "Photography":[
    ["Unsplash","Explore photography for inspiration.","https://unsplash.com/"],
    ["YouTube: photography basics","Learn composition and camera basics.","https://www.youtube.com/results?search_query=photography+basics+for+beginners"]
  ],
  "Guitar":[
    ["JustinGuitar","Beginner guitar lessons and practice guidance.","https://www.justinguitar.com/"],
    ["YouTube: first guitar chords","Find beginner chord tutorials.","https://www.youtube.com/results?search_query=first+guitar+chords+beginner"]
  ],
  "Piano":[
    ["PianoNanny","Beginner piano lessons and music theory.","https://www.pianonanny.com/"],
    ["YouTube: piano basics","Find beginner piano tutorials.","https://www.youtube.com/results?search_query=beginner+piano+lesson"]
  ],
  "Violin":[
    ["Violinspiration","Beginner violin learning resources.","https://violinspiration.com/"],
    ["YouTube: violin basics","Find beginner violin tutorials.","https://www.youtube.com/results?search_query=beginner+violin+tutorial"]
  ],
  "Keyboard":[
    ["PianoNanny","Learn notes, chords and keyboard basics.","https://www.pianonanny.com/"],
    ["YouTube: keyboard basics","Find beginner keyboard tutorials.","https://www.youtube.com/results?search_query=keyboard+basics+for+beginners"]
  ],
  "Drums":[
    ["Drumeo","Explore drum lessons and rhythm practice.","https://www.drumeo.com/"],
    ["YouTube: drum basics","Find beginner drum tutorials.","https://www.youtube.com/results?search_query=beginner+drum+lessons"]
  ],
  "Singing":[
    ["Berklee Online","Explore music and singing learning resources.","https://online.berklee.edu/"],
    ["YouTube: vocal warmups","Find gentle beginner vocal warm-ups.","https://www.youtube.com/results?search_query=beginner+vocal+warm+ups"]
  ],
  "Dance":[
    ["YouTube: dance basics","Find beginner dance tutorials in different styles.","https://www.youtube.com/results?search_query=beginner+dance+tutorial"]
  ],
  "Sports":[
    ["Olympics: sports","Explore sports, athletes and sporting events.","https://olympics.com/"],
    ["YouTube: skills tutorials","Find beginner drills for your chosen sport.","https://www.youtube.com/results?search_query=beginner+sports+skills+tutorial"]
  ],
  "Writing":[
    ["NaNoWriMo Young Writers","Creative writing inspiration and activities.","https://ywp.nanowrimo.org/"],
    ["Poetry Foundation","Read poems and explore poetry.","https://www.poetryfoundation.org/"]
  ],
  "Crafts":[
    ["Red Ted Art","Creative craft ideas and tutorials.","https://www.redtedart.com/"],
    ["YouTube: easy crafts","Find beginner craft tutorials.","https://www.youtube.com/results?search_query=easy+crafts+for+beginners"]
  ]
};

function renderHobbies(){
  const res=resources[activeHobby]||[];

  return `
    ${pageHead(
      "HOBBIES & INTERESTS",
      "Follow your curiosity.",
      "Explore creative skills, discover tutorials and save the interests you want to practise."
    )}

    <div class="tile-grid">
      ${hobbies.map(h=>`
        <article class="tile" data-hobby="${h[1]}">
          <div class="tile-icon">${h[0]}</div>
          <h3>${h[1]}</h3>
          <p>${h[2]}</p>
          <span class="tile-foot">${activeHobby===h[1]?"Selected · ":""}Explore resources →</span>
        </article>
      `).join("")}
    </div>

    <section class="section">
      <div class="section-title">
        <div>
          <h2>${activeHobby} starter resources</h2>
          <p>External learning links open in a new tab.</p>
        </div>
        <button class="btn btn-gold" id="saveSkill">Add to my interests</button>
      </div>

      <div class="resource-grid">
        ${res.map(r=>`
          <div class="resource-card">
            <h3>${r[0]}</h3>
            <p>${r[1]}</p>
            <a href="${r[2]}" target="_blank" rel="noopener">Open resource ↗️</a>
          </div>
        `).join("")}
      </div>
    </section>`;
}

/* DISCOVER */

const students=[
  {
    name:"Creative learner",
    grade:"MYP 4",
    talent:"Digital Art",
    interests:["Art","Coding"],
    speaks:["English","Hindi"],
    learning:["Spanish"],
    bio:"Exploring illustration and creative technology."
  },
  {
    name:"Music enthusiast",
    grade:"MYP 5",
    talent:"Music",
    interests:["Music","Writing"],
    speaks:["English","French"],
    learning:["Japanese"],
    bio:"Learning instruments and sharing practice tips."
  },
  {
    name:"Curious coder",
    grade:"MYP 3",
    talent:"Web Design",
    interests:["Coding","Photography"],
    speaks:["English"],
    learning:["German"],
    bio:"Building small websites and creative projects."
  },
  {
    name:"Sporty creator",
    grade:"MYP 4",
    talent:"Team Sports",
    interests:["Sports","Dance"],
    speaks:["English","Telugu"],
    learning:["Spanish"],
    bio:"Interested in teamwork, movement and creativity."
  },
  {
    name:"Story maker",
    grade:"MYP 5",
    talent:"Creative Writing",
    interests:["Writing","Art"],
    speaks:["English","Hindi"],
    learning:["French"],
    bio:"Writing stories and experimenting with art."
  }
];

function renderDiscover(){
  const filters=[
    "All","Art","Music","Coding","Sports",
    "Writing","Dance","Languages","Photography"
  ];

  let filtered=students.filter(s=>
    discoverFilter==="All"||
    (discoverFilter==="Languages"?s.learning.length:s.interests.includes(discoverFilter))
  );

  return `
    ${pageHead(
      "DISCOVER",
      "Find learners who share your interests.",
      "Explore example student profiles, browse talents and get inspiration for your own learning."
    )}

    <div class="filter-row">
      ${filters.map(f=>`
        <button class="chip ${discoverFilter===f?"active":""}" data-filter="${f}">
          ${f}
        </button>
      `).join("")}
    </div>

    <div class="search-row">
      <input class="field" id="discoverSearch" placeholder="Search talents or interests…">

      <select class="select" id="talentSelect">
        <option value="">Any talent</option>
        ${hobbies.map(h=>`<option>${h[1]}</option>`).join("")}
      </select>

      <select class="select" id="languageSelect">
        <option value="">Any language</option>
        ${languages.map(l=>`<option>${l[1]}</option>`).join("")}
      </select>
    </div>

    <p class="muted" id="resultCount">${filtered.length} example profiles</p>

    <div class="student-grid" id="studentGrid">
      ${studentCards(filtered)}
    </div>

    <div class="notice">
      These are sample profiles to demonstrate the layout. This offline version does not connect real students or publish personal information.
    </div>`;
}

function studentCards(list){
  if(!list.length){
    return `<div class="empty">No matching profiles. Try another filter.</div>`;
  }

  return list.map((s,i)=>`
    <article class="student-card">
      <div class="student-top">
        <div class="avatar">${initials(s.name)}</div>
        <div>
          <div class="student-name">${s.name}</div>
          <div class="student-meta">${s.grade} · Example profile</div>
        </div>
      </div>

      <span class="tag gold">★ ${s.talent}</span>

      <p>Interests</p>
      ${s.interests.map(x=>`<span class="tag">${x}</span>`).join("")}

      <p>Speaks</p>
      ${s.speaks.map(x=>`
        <span class="tag" style="background:#e8f4ed;color:#42795b">${x}</span>
      `).join("")}

      <p>Learning</p>
      ${s.learning.map(x=>`<span class="tag">${x}</span>`).join("")}

      <p>${s.bio}</p>
      <button class="btn btn-outline btn-small" data-student="${students.indexOf(s)}">View interests</button>
    </article>
  `).join("");
}

/* CHALLENGES */

const challenges=[
  ["✏️","Draw something in 10 minutes","Make a quick sketch of an object near you.","Creative"],
  ["🇪🇸","Learn 5 new Spanish words","Practise five new words and test yourself.","Language"],
  ["📷","Take a creative photograph","Try a new angle, pattern or composition.","Creative"],
  ["📝","Write a short story","Create a beginning, middle and ending.","Writing"],
  ["🌱","Try a new hobby","Spend 15 minutes exploring something unfamiliar.","Explore"],
  ["🗣️","Teach 5 words to someone","Share five words from a language you are learning.","Language"],
  ["🎵","Learn a simple rhythm","Clap or tap a short rhythm and repeat it.","Music"],
  ["💡","Make something useful","Create a small object from reusable materials.","Creative"]
];

function renderChallenges(){
  return `
    ${pageHead(
      "DAILY ACTIVITIES & GAMES",
      "A little challenge goes a long way.",
      "Choose a mini challenge, complete it and add it to your progress."
    )}

    <div class="tile-grid">
      ${challenges.map((c,i)=>`
        <article class="challenge-card">
          <div class="tile-icon">${c[0]}</div>
          <span class="tag gold">${c[3]}</span>
          <h3>${c[1]}</h3>
          <p>${c[2]}</p>

          ${state.challenges.includes(i)
            ? `<span class="tag" style="background:#e5f4ec;color:#28734c">✓ Completed</span>`
            : `<button class="btn btn-primary btn-small" data-challenge="${i}">Mark complete</button>`
          }
        </article>
      `).join("")}
    </div>

    <section class="section panel">
      <h3>Quick language check</h3>
      <p class="muted">Choose the correct meaning of “Gracias”.</p>

      <div class="quiz-options">
        <button class="quiz-option" data-mini="wrong">Hello</button>
        <button class="quiz-option" data-mini="correct">Thank you</button>
        <button class="quiz-option" data-mini="wrong">Please</button>
        <button class="quiz-option" data-mini="wrong">Goodbye</button>
      </div>

      <p class="muted" id="miniFeedback">Your answer will be checked instantly.</p>
    </section>`;
}

/* PROGRESS */

function renderProgress(){
  const total=challenges.length;
  const done=state.challenges.length;
  const pct=Math.round(done/total*100);

  return `
    ${pageHead(
      "YOUR LEARNING JOURNEY",
      "Progress that you can see.",
      "Every word, challenge and new interest is a step forward."
    )}

    <div class="stats-grid">
      ${stat("Current streak",state.streak+" days","Days marked active")}
      ${stat("Challenges completed",done,`${total} available challenges`)}
      ${stat("Words learned",state.words,"Vocabulary words marked learned")}
      ${stat("Skills explored",state.skills.length,"Interests saved to your profile")}
    </div>

    <section class="section two-col">
      <div class="panel">
        <h3>Challenge progress</h3>
        <div class="progress-line-head">
          <strong>${done} of ${total} completed</strong>
          <span>${pct}%</span>
        </div>

        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>

        <p class="muted">Complete challenges to build your activity record.</p>
      </div>

      <div class="panel">
        <h3>Your learning areas</h3>
        <p class="muted">Languages added: ${state.languages.length?state.languages.join(", "):"None yet"}</p>
        <p class="muted">Interests added: ${state.skills.length?state.skills.join(", "):"None yet"}</p>
        <button class="btn btn-outline" data-go="profile">Update profile</button>
      </div>
    </section>

    <section class="section panel">
      <h3>This week's activity</h3>
      ${weekStrip()}
      <p class="muted">Use the Home page to mark a day complete.</p>
    </section>

    <section class="section">
      <h2 style="font:750 18px Manrope">Achievements</h2>

      <div class="tile-grid">
        ${tile("✦","First steps","Complete your first challenge.","challenges",done>0?"Unlocked":"Locked")}
        ${tile("📖","Word collector","Learn 10 vocabulary words.","languages",state.words>=10?"Unlocked":`${state.words}/10 words`)}
        ${tile("🌟","Curious explorer","Save 3 interests.","hobbies",state.skills.length>=3?"Unlocked":`${state.skills.length}/3 interests`)}
      </div>
    </section>`;
}

/* PROJECTS */

function renderProjects(){
  return `
    ${pageHead(
      "CREATE & COLLABORATE",
      "Your project space.",
      "Keep a record of things you make, practise or want to share."
    )}

    <div class="panel">
      <h3>Add a project</h3>

      <form id="projectForm" class="form-grid">
        <label>Project title
          <input name="title" required maxlength="60" placeholder="e.g. My first website">
        </label>

        <label>Category
          <select name="category">
            <option>Art</option>
            <option>Music</option>
            <option>Coding</option>
            <option>Writing</option>
            <option>Photography</option>
            <option>Other</option>
          </select>
        </label>

        <label class="span-2">Description
          <textarea name="description" maxlength="300" placeholder="What did you make or learn?"></textarea>
        </label>

        <label class="span-2">Project link (optional)
          <input name="url" type="url" placeholder="https://…">
        </label>

        <div class="span-2">
          <button class="btn btn-primary">Save project</button>
        </div>
      </form>
    </div>

    <section class="section">
      <div class="section-title">
        <h2>My projects</h2>
        <span class="tag">${state.projects.length} saved</span>
      </div>

      ${state.projects.length
        ? `<div class="resource-grid">
          ${state.projects.map((p,i)=>`
            <div class="resource-card">
              <span class="tag gold">${esc(p.category)}</span>
              <h3>${esc(p.title)}</h3>
              <p>${esc(p.description||"No description added.")}</p>
              ${p.url?`<a href="${esc(p.url)}" target="_blank" rel="noopener">Open project ↗️</a>`:""}
              <p><button class="text-link" data-delete-project="${i}">Remove</button></p>
            </div>
          `).join("")}
        </div>`
        : `<div class="empty">Your project space is ready. Add your first project above.</div>`
      }
    </section>`;
}

/* ANNUAL SPOTLIGHT AWARDS */

function renderAwards(){
  const year=new Date().getFullYear();
  const entry=state.awardEntries.find(e=>e.year===year);

  return `
    ${pageHead(
      "ANNUAL STUDENT SHOWCASE",
      "Spotlight Awards",
      "A yearly celebration of creativity, practice and progress. Share one project when the annual showcase is open."
    )}

    <div class="award-banner">
      <p class="eyebrow">THE STUDYHUB SHOWCASE · ${year}</p>
      <h2>One year. One spotlight. Your moment.</h2>
      <p>Upload a project description and a link to your work. In a real school community, entries and voting should be reviewed and managed by a teacher or organiser.</p>
      <span class="tag gold">Annual event · ${year}</span>
    </div>

    <div class="notice">
      Demo mode: submissions are saved only in this browser. The voting section below is a local demonstration, not a public voting system. A real annual competition needs a shared database, sign-in and moderation.
    </div>

    <section class="section panel">
      <h3>${entry?"Your entry for "+year:"Submit your yearly entry"}</h3>

      ${entry
        ? `<p class="muted">You have already submitted an entry this year: <strong>${esc(entry.title)}</strong>.</p>
           <span class="tag gold">1 entry used for ${year}</span>`
        : `<form id="awardForm" class="form-grid">
            <label>Project title
              <input name="title" required maxlength="70" placeholder="Give your work a title">
            </label>

            <label>Talent category
              <select name="category">
                ${["Art","Music","Dance","Coding","Sports","Writing","Photography","Crafts","Other"].map(x=>`<option>${x}</option>`).join("")}
              </select>
            </label>

            <label class="span-2">Tell us about your talent
              <textarea name="description" required maxlength="500" placeholder="What did you create or learn?"></textarea>
            </label>

            <label class="span-2">Link to your work
              <input name="url" type="url" placeholder="https://… (optional)">
            </label>

            <div class="span-2">
              <button class="btn btn-primary">Submit this year's entry</button>
            </div>
          </form>`
      }
    </section>

    <section class="section">
      <div class="section-title">
        <h2>Showcase entries</h2>
        <span class="tag">${state.awardEntries.length} on this device</span>
      </div>

      ${state.awardEntries.length
        ? `<div class="resource-grid">
          ${state.awardEntries.map((e,i)=>`
            <div class="resource-card">
              <span class="tag gold">${esc(e.category)} · ${e.year}</span>
              <h3>${esc(e.title)}</h3>
              <p>${esc(e.description)}</p>
              ${e.url?`<a href="${esc(e.url)}" target="_blank" rel="noopener">View work ↗️</a>`:""}
              <p><strong>${state.votes[i]||0} local votes</strong></p>
              <button class="btn btn-outline btn-small" data-vote="${i}">Vote for this entry</button>
            </div>
          `).join("")}
        </div>`
        : `<div class="empty">No showcase entries yet. Be the first to add one.</div>`
      }
    </section>`;
}

/* MY PROFILE */

function renderProfile(){
  return `
    ${pageHead(
      "YOUR SKILLS & PORTFOLIO",
      "My profile",
      "A simple space to collect your interests, languages and projects."
    )}

    <div class="profile-banner">
      <div class="avatar">${initials(state.name)}</div>
      <div>
        <h2>${esc(state.name)}</h2>
        <p>${esc(state.bio)}</p>
      </div>
      <button class="btn btn-gold" style="margin-left:auto" id="editProfile">Edit profile</button>
    </div>

    <section class="section two-col">
      <div class="panel">
        <h3>Languages I'm learning</h3>

        <div class="filter-row">
          ${state.languages.length
            ? state.languages.map(l=>`<span class="tag">${esc(l)}</span>`).join("")
            : `<span class="muted">No languages added yet.</span>`
          }
        </div>

        <select class="select" id="profileLanguage">
          ${languages.map(l=>`<option>${l[1]}</option>`).join("")}
        </select>

        <button class="btn btn-outline btn-small" id="addLanguage">Add language</button>
      </div>

      <div class="panel">
        <h3>My interests & skills</h3>

        <div class="filter-row">
          ${state.skills.length
            ? state.skills.map(l=>`<span class="tag">${esc(l)}</span>`).join("")
            : `<span class="muted">No interests added yet.</span>`
          }
        </div>

        <select class="select" id="profileSkill">
          ${hobbies.map(h=>`<option>${h[1]}</option>`).join("")}
        </select>

        <button class="btn btn-outline btn-small" id="addSkill">Add interest</button>
      </div>
    </section>

    <section class="section panel">
      <h3>My achievements</h3>
      <p class="muted">${state.challenges.length} challenges completed · ${state.words} words learned · ${state.projects.length} projects saved</p>
      <button class="btn btn-outline" data-go="progress">View my progress</button>
    </section>`;
}

/* PAGE RENDERING */

function render(){
  const views={
    home:renderHome,
    discover:renderDiscover,
    languages:renderLanguages,
    hobbies:renderHobbies,
    challenges:renderChallenges,
    progress:renderProgress,
    projects:renderProjects,
    awards:renderAwards,
    profile:renderProfile
  };

  app.innerHTML=(views[page]||renderHome)();
  bindPage();
  updateAccountButton();
}

/* BUTTONS AND INTERACTIONS */

function bindPage(){

  app.querySelectorAll("[data-go]").forEach(b=>
    b.addEventListener("click",()=>go(b.dataset.go))
  );

  app.querySelectorAll("[data-lang]").forEach(b=>
    b.addEventListener("click",()=>{
      activeLanguage=b.dataset.lang;
      flashIndex=0;
      render();
    })
  );

  app.querySelectorAll("[data-hobby]").forEach(b=>
    b.addEventListener("click",()=>{
      activeHobby=b.dataset.hobby;
      render();
    })
  );

  app.querySelectorAll("[data-filter]").forEach(b=>
    b.addEventListener("click",()=>{
      discoverFilter=b.dataset.filter;
      render();
    })
  );

  const mark=$("#markToday");

  if(mark){
    mark.addEventListener("click",()=>{
      const i=(new Date().getDay()+6)%7;

      if(!state.weekly[i]){
        state.weekly[i]=true;
        state.streak++;
        save();
        render();
        toast("Today's activity has been recorded");
      } else {
        toast("Today is already marked complete");
      }
    });
  }

  const prev=$("#prevWord");
  const next=$("#nextWord");

  if(prev){
    prev.onclick=()=>{
      const words=vocab[activeLanguage]||[];
      flashIndex=Math.max(0,flashIndex-1);
      render();
    };
  }

  if(next){
    next.onclick=()=>{
      flashIndex++;
      render();
    };
  }

  const learn=$("#learnWord");

  if(learn){
    learn.onclick=()=>{
      state.words++;

      if(!state.languages.includes(activeLanguage)){
        state.languages.push(activeLanguage);
      }

      save();
      toast("Word added to your progress");
      render();
    };
  }

  app.querySelectorAll("[data-answer]").forEach(b=>{
    b.onclick=()=>{
      const wordsNow=vocab[activeLanguage]||[];
      const correct=wordsNow[flashIndex%(wordsNow.length||1)]?.[1]||"A greeting";

      $("#quizFeedback").textContent=
        b.dataset.answer===correct
          ?"Correct! Nice work."
          :"Not quite — the right answer is "+correct+".";

      b.classList.add(b.dataset.answer===correct?"correct":"wrong");
    };
  });

  const nq=$("#newQuiz");

  if(nq){
    nq.onclick=()=>{
      flashIndex++;
      render();
    };
  }

  app.querySelectorAll("[data-challenge]").forEach(b=>{
    b.onclick=()=>{
      const n=Number(b.dataset.challenge);

      if(!state.challenges.includes(n)){
        state.challenges.push(n);
      }

      save();
      render();
      toast("Challenge completed!");
    };
  });

  app.querySelectorAll("[data-mini]").forEach(b=>{
    b.onclick=()=>{
      $("#miniFeedback").textContent=
        b.dataset.mini==="correct"
          ?"Correct! Gracias means thank you."
          :"Try again — think of a polite expression of gratitude.";

      b.classList.add(b.dataset.mini==="correct"?"correct":"wrong");
    };
  });

  const saveSkill=$("#saveSkill");

  if(saveSkill){
    saveSkill.onclick=()=>{
      if(!state.skills.includes(activeHobby)){
        state.skills.push(activeHobby);
      }

      save();
      toast(activeHobby+" added to your profile");
    };
  }

  const pf=$("#projectForm");

  if(pf){
    pf.onsubmit=e=>{
      e.preventDefault();
      const d=Object.fromEntries(new FormData(pf));

      state.projects.push(d);
      save();
      render();
      toast("Project saved");
    };
  }

  app.querySelectorAll("[data-delete-project]").forEach(b=>{
    b.onclick=()=>{
      state.projects.splice(Number(b.dataset.deleteProject),1);
      save();
      render();
      toast("Project removed");
    };
  });

  const af=$("#awardForm");

  if(af){
    af.onsubmit=e=>{
      e.preventDefault();

      const d=Object.fromEntries(new FormData(af));
      const year=new Date().getFullYear();

      if(state.awardEntries.some(x=>x.year===year)){
        toast("You have already submitted this year");
        return;
      }

      state.awardEntries.push({...d,year});
      save();
      render();
      toast("Your demo entry has been saved");
    };
  }

  app.querySelectorAll("[data-vote]").forEach(b=>{
    b.onclick=()=>{
      const i=Number(b.dataset.vote);
      state.votes[i]=(state.votes[i]||0)+1;
      save();
      render();
      toast("Local vote recorded");
    };
  });

  const edit=$("#editProfile");

  if(edit){
    edit.onclick=()=>$("#accountBtn").click();
  }

  const addL=$("#addLanguage");

  if(addL){
    addL.onclick=()=>{
      const v=$("#profileLanguage").value;

      if(!state.languages.includes(v)){
        state.languages.push(v);
      }

      save();
      render();
      toast("Language added");
    };
  }

  const addS=$("#addSkill");

  if(addS){
    addS.onclick=()=>{
      const v=$("#profileSkill").value;

      if(!state.skills.includes(v)){
        state.skills.push(v);
      }

      save();
      render();
      toast("Interest added");
    };
  }

  const search=$("#discoverSearch");
  const talent=$("#talentSelect");
  const lang=$("#languageSelect");

  function filterStudents(){
    let list=students.filter(s=>
      (discoverFilter==="All"||
      (discoverFilter==="Languages"?s.learning.length:s.interests.includes(discoverFilter)))&&
      (!search.value||JSON.stringify(s).toLowerCase().includes(search.value.toLowerCase()))&&
      (!talent.value||
        s.talent.toLowerCase().includes(talent.value.toLowerCase())||
        s.interests.some(x=>x.toLowerCase()===talent.value.toLowerCase())
      )&&
      (!lang.value||s.speaks.includes(lang.value)||s.learning.includes(lang.value))
    );

    $("#studentGrid").innerHTML=studentCards(list);
    $("#resultCount").textContent=list.length+" example profiles";

    $("#studentGrid").querySelectorAll("[data-student]").forEach(b=>{
      b.onclick=()=>openStudent(Number(b.dataset.student));
    });
  }

  if(search){
    search.oninput=filterStudents;
    talent.onchange=filterStudents;
    lang.onchange=filterStudents;
  }

  app.querySelectorAll("[data-student]").forEach(b=>{
    b.onclick=()=>openStudent(Number(b.dataset.student));
  });
}

/* STUDENT PROFILE POPUP */

function openStudent(index){
  const s=students[index];

  $("#detailContent").innerHTML=`
    <button class="modal-close" id="closeDetail2">×</button>
    <p class="eyebrow">EXAMPLE STUDENT PROFILE</p>
    <h2>${esc(s.name)}</h2>
    <p class="muted">${esc(s.grade)} · ${esc(s.bio)}</p>
    <p><strong>Interests:</strong> ${s.interests.join(", ")}</p>
    <p><strong>Languages:</strong> ${s.speaks.join(", ")}</p>
    <p><strong>Learning:</strong> ${s.learning.join(", ")}</p>
    <p class="muted">This is a sample profile. Real student discovery needs school-approved accounts and privacy controls.</p>
  `;

  $("#detailDialog").showModal();

  $("#closeDetail2").onclick=()=>$("#detailDialog").close();
}

/* START WEBSITE */

render();
