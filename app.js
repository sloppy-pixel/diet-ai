const loadingMessages = [
  "Analyzing your health profile...",
  "Building your 7-day meal plan...",
  "Writing recipes and shopping list..."
];

function getGoals() {
  return [...document.querySelectorAll('.checkboxes input:checked')].map(el => el.value);
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

function validate(userData) {
  if (!document.getElementById('api-key').value.trim()) return 'Please enter your Anthropic API key.';
  if (!userData.age) return 'Please enter your age.';
  if (!userData.gender) return 'Please select your gender.';
  if (!userData.lifestyle) return 'Please select your lifestyle.';
  if (!userData.dietType) return 'Please select a dietary preference.';
  if (userData.goals.length === 0) return 'Please select at least one goal.';
  if (!userData.budget) return 'Please enter your weekly budget.';
  if (!userData.cookTime) return 'Please select your cooking time.';
  return null;
}

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

function setLoading(msg) {
  document.getElementById('loading-text').textContent = msg;
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
  document.getElementById(`tab-${tab}`).classList.remove('hidden');
}

async function generatePlan() {
  const userData = getUserData();
  const error = validate(userData);
  if (error) { alert(error); return; }

  const apiKey = document.getElementById('api-key').value.trim();
  const btn = document.getElementById('generate-btn');
  btn.disabled = true;
  btn.textContent = 'Generating...';

  const outputSection = document.getElementById('output-section');
  const loadingEl = document.getElementById('loading');
  const resultsEl = document.getElementById('results');

  outputSection.classList.remove('hidden');
  loadingEl.classList.remove('hidden');
  resultsEl.classList.add('hidden');
  outputSection.scrollIntoView({ behavior: 'smooth' });

  try {
    const { system, step1, step2, step3 } = buildPrompts(userData);

    setLoading(loadingMessages[0]);
    const analysis = await callClaude(apiKey, system, step1);

    setLoading(loadingMessages[1]);
    const weeklyPlan = await callClaude(apiKey, system, step2(analysis));

    setLoading(loadingMessages[2]);
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
    outputSection.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate My Plan ↗';
  }
}