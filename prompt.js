function buildPrompts(userData) {
  const system = `You are a certified nutritionist and meal planning expert specializing in practical, affordable diets for students and working youth in India. You give structured, specific, actionable plans — not generic advice. Always factor in the user's health conditions, deficiencies, allergies, and goals with scientific reasoning. Keep meals realistic for someone with limited time and budget.`;

  const step1 = `A user has provided the following health profile:
- Age: ${userData.age}
- Gender: ${userData.gender}
- Lifestyle: ${userData.lifestyle}
- Health conditions / deficiencies: ${userData.conditions || 'None mentioned'}
- Allergies: ${userData.allergies || 'None'}
- Dietary preference: ${userData.dietType}
- Goals: ${userData.goals.join(', ')}
- Weekly budget: ₹${userData.budget}
- Daily cooking time: ${userData.cookTime}

Step 1 — Analyze their nutritional priorities. List:
1. Key nutrients they need to focus on and why (based on conditions + goals)
2. Foods they must avoid (allergies + conditions)
3. Any red flags or things to watch out for
Be specific and brief.`;

  const step2 = (step1Result) => `Based on this nutritional analysis:
${step1Result}

Step 2 — Create a 7-day meal plan (Monday to Sunday) in this exact format for each day:
Day X:
  Breakfast: [meal] — [1 line why it helps their goals]
  Lunch: [meal] — [1 line why]
  Dinner: [meal] — [1 line why]
  Snacks: [1-2 snacks] — [brief reason]

Keep meals simple, affordable, and cookable within their time limit. Rotate variety across days. Respect all allergies and dietary preferences.`;

  const step3 = (step2Result) => `Based on this 7-day meal plan:
${step2Result}

Step 3 — Generate two things:

A) DAILY RECIPES
Pick 3 meals from the week (breakfast, lunch, dinner — one each) and give a recipe for each:
Recipe name:
Ingredients (with approx quantities):
Steps (max 5):
Prep tip for meal prepping:

B) SHOPPING LIST
Group all ingredients from the 7-day plan into:
- Produce (vegetables & fruits)
- Protein sources
- Grains & carbs
- Dairy / alternatives
- Pantry staples
- Estimated total cost (₹)

Keep it concise and practical.`;

  return { system, step1, step2, step3 };
}