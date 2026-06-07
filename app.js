let currentStep = 0;
const totalSteps = 10;

function showStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.step[data-step="${n}"]`).classList.add('active');
  const pct = (n / totalSteps) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
}

function next() {
  if (!validateStep(currentStep)) return;
  currentStep++;
  showStep(currentStep);
}

function prev() {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
}

function validateStep(step) {
  const checks = {
    0: () => document.getElementById('api-key').value.trim() || 'Enter your API key.',
    1: () => document.getElementById('age').value || 'Enter your age.',
    2: () => document.getElementById('gender').value || 'Select an option.',
    3: () => document.getElementById('lifestyle').value || 'Select an option.',
    4: () => true,
    5: () => true,
    6: () => document.getElementById('diet-type').value || 'Select an option.',
    7: () => document.querySelectorAll('.option.selected').length > 0 || 'Pick at least one goal.',
    8: () => document.getElementById('budget').value || 'Enter your budget.',
    9: () => document.getElementById('cook-time').value || 'Select an option.',
  };
  const result = checks[step]?.();
  if (result !== true && result) { alert(result); return false; }
  return true;
}

function selectOption(el, fieldId) {
  el.closest('.grid-options').querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById(fieldId).value = el.textContent.trim();
}

function toggleMulti(el) {
  el.classList.toggle('selected');
}

function getGoals() {
  return [...document.querySelectorAll('.multi .option.selected')].map(o => o.textContent.trim());
}

function getUserData() {
  return {
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    lifestyle: document.getElementById('lifestyle').value,
    conditions: document.getElementById('conditions').value,
    allergies: document.getElementById('allergies').value,
    dietType: document.getElementById('diet-type').value,
    goals: getGoals(),
    budget: document.getElementById('budget').value,
    cookTime: document.getElementById('cook-time').value
  };
}

const loadingMessages = [
  "Analyzing your health profile...",
  "Building your 7-day meal plan...",
  "Writing recipes and shopping list..."
];

async function callClaude(apiKey, system, userMessage) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'API error');
  }
  const data = await res.json();
  return data.content[0].text;
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
  document.getElementById(`tab-${tab}`).classList.remove('hidden');
}

function restart() {
  currentStep = 0;
  showStep(0);
  document.getElementById('results').classList.add('hidden');
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('error-msg').classList.add('hidden');
}

async function generatePlan() {
  const userData = getUserData();
  const apiKey = document.getElementById('api-key').value.trim();
  const btn = document.getElementById('generate-btn');

  btn.disabled = true;
  btn.textContent = 'Generating...';

  currentStep = 10;
  showStep(10);

  const loadingEl = document.getElementById('loading');
  const resultsEl = document.getElementById('results');
  const errorEl = document.getElementById('error-msg');

  loadingEl.classList.remove('hidden');
  resultsEl.classList.add('hidden');
  errorEl.classList.add('hidden');

  try {
    const { system, step1, step2, step3 } = buildPrompts(userData);

    document.getElementById('loading-text').textContent = loadingMessages[0];
    const analysis = await callClaude(apiKey, system, step1);

    document.getElementById('loading-text').textContent = loadingMessages[1];
    const weeklyPlan = await callClaude(apiKey, system, step2(analysis));

    document.getElementById('loading-text').textContent = loadingMessages[2];
    const recipesAndShopping = await callClaude(apiKey, system, step3(weeklyPlan));

    const splitIndex = recipesAndShopping.indexOf('B) SHOPPING LIST');
    const recipesText = splitIndex !== -1
      ? recipesAndShopping.slice(0, splitIndex).replace('A) DAILY RECIPES', '').trim()
      : recipesAndShopping;
    const shoppingText = splitIndex !== -1
      ? recipesAndShopping.slice(splitIndex).replace('B) SHOPPING LIST', '').trim()
      : 'Could not parse shopping list.';

    document.getElementById('tab-weekly').textContent = weeklyPlan;
    document.getElementById('tab-daily').textContent = recipesText;
    document.getElementById('tab-shopping').textContent = shoppingText;

    loadingEl.classList.add('hidden');
    resultsEl.classList.remove('hidden');

  } catch (err) {
    loadingEl.classList.add('hidden');
    errorEl.textContent = 'Error: ' + err.message;
    errorEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate my plan →';
  }
}