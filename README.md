# Diet AI 🥗

A free, browser-based AI diet planner for students and working youth. Generates personalized weekly meal plans, recipes, and shopping lists based on your health conditions, goals, and budget.

## Features
- Health condition & allergy awareness
- Goals: weight loss, muscle gain, skin, hair, energy, gut health
- 3-step agentic pipeline (analysis → meal plan → recipes + shopping list)
- Meal prep friendly
- Budget-conscious (₹-based)
- No backend, no data stored — runs entirely in your browser

## Stack
- Vanilla HTML/CSS/JS
- Anthropic Claude API (claude-sonnet-4-20250514)

## Setup
1. Clone the repo
2. Open `index.html` in a browser (or use Live Server in VS Code)
3. Get a free Anthropic API key at [console.anthropic.com](https://console.anthropic.com)
4. Paste your key into the app and generate your plan

## How it works
Three chained Claude API calls:
1. **Health analysis** — identifies nutrient priorities and red flags
2. **Meal plan generation** — builds a 7-day plan around the analysis
3. **Recipes + shopping list** — extracts practical recipes and a grouped shopping list

## Notes
- Your API key is never stored or sent anywhere except Anthropic's servers
- Works best on desktop