const STORAGE_KEY = "fitpilot_state_v1";

const MUSCLE_META = [
  { id: "chest", label: "胸" },
  { id: "back", label: "背" },
  { id: "shoulders", label: "肩" },
  { id: "biceps", label: "肱二头" },
  { id: "triceps", label: "肱三头" },
  { id: "core", label: "核心" },
  { id: "glutes", label: "臀" },
  { id: "quads", label: "股四头" },
  { id: "hamstrings", label: "腘绳肌" },
  { id: "calves", label: "小腿" },
];

const ACTIVITY_FACTOR = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  athlete: 1.9,
};

const GOAL_ADJUSTMENT = {
  fat_loss: -350,
  maintain: 0,
  muscle_gain: 250,
};

let state = loadState();

const refs = {
  todayLabel: document.getElementById("todayLabel"),
  profileForm: document.getElementById("profileForm"),
  dailyForm: document.getElementById("dailyForm"),
  mealForm: document.getElementById("mealForm"),
  workoutForm: document.getElementById("workoutForm"),
  recommendation: document.getElementById("recommendation"),
  mealTableBody: document.getElementById("mealTableBody"),
  workoutTableBody: document.getElementById("workoutTableBody"),
  historyTableBody: document.getElementById("historyTableBody"),
  muscleLegend: document.getElementById("muscleLegend"),
  addMealBtn: document.getElementById("addMealBtn"),
  addWorkoutBtn: document.getElementById("addWorkoutBtn"),
  generateBtn: document.getElementById("generateBtn"),
  muscleCheckboxes: document.getElementById("muscleCheckboxes"),
};

init();

function init() {
  const today = todayISO();
  refs.todayLabel.textContent = `今天：${today}`;
  document.getElementById("logDate").value = state.currentDate || today;
  state.currentDate = document.getElementById("logDate").value;

  renderMuscleCheckboxes();
  bindEvents();
  hydrateForms();
  renderAll();
}

function bindEvents() {
  refs.profileForm.addEventListener("submit", onSaveProfile);
  refs.dailyForm.addEventListener("submit", onSaveDaily);
  refs.mealForm.addEventListener("submit", onAddMeal);
  refs.workoutForm.addEventListener("submit", onAddWorkout);
  refs.addMealBtn.addEventListener("click", () => refs.mealForm.classList.toggle("hidden"));
  refs.addWorkoutBtn.addEventListener("click", () => refs.workoutForm.classList.toggle("hidden"));
  refs.generateBtn.addEventListener("click", onGeneratePlan);
  document.getElementById("logDate").addEventListener("change", onDateChange);
}

function hydrateForms() {
  const p = state.profile;
  setValue("name", p.name);
  setValue("gender", p.gender || "male");
  setValue("age", p.age);
  setValue("height", p.height);
  setValue("weight", p.weight);
  setValue("bodyFat", p.bodyFat);
  setValue("goal", p.goal || "fat_loss");
  setValue("activityLevel", p.activityLevel || "moderate");
  hydrateDailyForm();
}

function hydrateDailyForm() {
  const log = getLogByDate(state.currentDate);
  setValue("dailyWeight", log.dailyWeight);
  setValue("sleepHours", log.sleepHours);
  setValue("steps", log.steps);
  setValue("waterMl", log.waterMl);
  setValue("fatigue", log.fatigue || 3);
  setValue("dailyNote", log.note || "");
}

function onDateChange(event) {
  state.currentDate = event.target.value;
  ensureLog(state.currentDate);
  hydrateDailyForm();
  renderAll();
  saveState();
}

function onSaveProfile(event) {
  event.preventDefault();
  state.profile = {
    name: getValue("name"),
    gender: getValue("gender"),
    age: toNumber(getValue("age")),
    height: toNumber(getValue("height")),
    weight: toNumber(getValue("weight")),
    bodyFat: toNumber(getValue("bodyFat")),
    goal: getValue("goal"),
    activityLevel: getValue("activityLevel"),
  };
  saveState();
  alert("基础信息已保存");
}

function onSaveDaily(event) {
  event.preventDefault();
  const log = ensureLog(state.currentDate);
  log.dailyWeight = toNumber(getValue("dailyWeight"));
  log.sleepHours = toNumber(getValue("sleepHours"));
  log.steps = toNumber(getValue("steps"));
  log.waterMl = toNumber(getValue("waterMl"));
  log.fatigue = toNumber(getValue("fatigue")) || 3;
  log.note = getValue("dailyNote");
  saveState();
  renderAll();
  alert("今日状态已保存");
}

function onAddMeal(event) {
  event.preventDefault();
  const log = ensureLog(state.currentDate);
  const mealName = getValue("mealName").trim();
  const calories = toNumber(getValue("mealCalories"));

  if (!mealName || calories <= 0) {
    alert("请填写食物名称和热量");
    return;
  }

  log.meals.push({
    id: crypto.randomUUID(),
    type: getValue("mealType"),
    name: mealName,
    calories,
    protein: toNumber(getValue("mealProtein")),
    carbs: toNumber(getValue("mealCarbs")),
    fat: toNumber(getValue("mealFat")),
  });

  refs.mealForm.reset();
  refs.mealForm.classList.add("hidden");
  saveState();
  renderAll();
}

function onAddWorkout(event) {
  event.preventDefault();
  const log = ensureLog(state.currentDate);
  const workoutName = getValue("workoutName").trim();
  const duration = toNumber(getValue("workoutDuration"));
  const intensity = clamp(toNumber(getValue("workoutIntensity")) || 3, 1, 5);

  if (!workoutName || duration <= 0) {
    alert("请填写训练项目和时长");
    return;
  }

  const selectedMuscles = Array.from(document.querySelectorAll("input[name='muscles']:checked")).map((it) => it.value);

  log.workouts.push({
    id: crypto.randomUUID(),
    type: getValue("workoutType"),
    name: workoutName,
    duration,
    intensity,
    calories: toNumber(getValue("workoutCalories")),
    muscles: selectedMuscles,
  });

  refs.workoutForm.reset();
  refs.workoutForm.classList.add("hidden");
  saveState();
  renderAll();
}

function onGeneratePlan() {
  const profile = state.profile;
  const log = ensureLog(state.currentDate);

  if (!profile.age || !profile.height || !(profile.weight || log.dailyWeight)) {
    refs.recommendation.innerHTML = "<p>请先完善基础信息（年龄、身高、体重）再生成建议。</p>";
    return;
  }

  const bodyWeight = log.dailyWeight || profile.weight;
  const bmr = calcBMR(profile.gender, bodyWeight, profile.height, profile.age);
  const tdee = bmr * (ACTIVITY_FACTOR[profile.activityLevel] || 1.55);
  const trainingLoad = calcTrainingLoad(log.workouts);
  const intake = sumNutrition(log.meals);
  const weekly = weeklyStats();

  let targetCalories = Math.round(tdee + GOAL_ADJUSTMENT[profile.goal]);
  if (trainingLoad > 240) targetCalories += 120;
  if ((log.sleepHours || 0) < 6) targetCalories -= 80;

  const proteinPerKg = profile.goal === "muscle_gain" ? 2 : profile.goal === "fat_loss" ? 1.8 : 1.6;
  const protein = Math.round(bodyWeight * proteinPerKg);
  const carbs = Math.round(bodyWeight * (trainingLoad > 220 ? 4 : 3));
  const fat = Math.max(Math.round((targetCalories - (protein + carbs) * 4) / 9), Math.round(bodyWeight * 0.8));

  const trainedMusclesToday = distinctMuscles(log.workouts);
  const yesterday = getYesterdayLog(state.currentDate);
  const overlap = intersect(trainedMusclesToday, distinctMuscles((yesterday && yesterday.workouts) || []));

  const trainingTips = [];
  if ((log.sleepHours || 0) < 6 || (log.fatigue || 3) >= 4) {
    trainingTips.push("今天睡眠或疲劳偏差，明天建议降低强度：主训练 RPE 控制在 6-7，并增加 10 分钟拉伸。");
  }
  if (overlap.length >= 2) {
    trainingTips.push(`今天和昨天重复训练了 ${overlap.join("、")}，明天建议换肌群或做主动恢复。`);
  } else {
    trainingTips.push("明天可安排 1 个主力肌群 + 1 个辅助肌群，避免每次全身高强度堆叠。");
  }

  if (weekly.aerobicMin < 150) {
    trainingTips.push(`你近7天有氧 ${weekly.aerobicMin} 分钟，建议明天补 30-40 分钟 Zone2 有氧。`);
  }
  if (weekly.strengthSessions < 3) {
    trainingTips.push(`你近7天力量训练 ${weekly.strengthSessions} 次，建议明天安排 45-60 分钟基础力量训练。`);
  }

  const nutritionTips = [];
  nutritionTips.push(`明日热量建议约 ${targetCalories} kcal。`);
  nutritionTips.push(`宏量目标：蛋白 ${protein}g / 碳水 ${carbs}g / 脂肪 ${fat}g。`);
  if (intake.calories > 0) {
    const delta = Math.round(intake.calories - targetCalories);
    if (Math.abs(delta) > 200) {
      nutritionTips.push(
        delta > 0
          ? `你今天比目标高约 ${delta} kcal，明天建议减少高油零食并提高蔬菜比例。`
          : `你今天比目标低约 ${Math.abs(delta)} kcal，明天建议增加主食和优质蛋白，避免恢复不足。`
      );
    }
  }
  if ((log.waterMl || 0) < 2000) {
    nutritionTips.push("今日饮水偏少，明天目标建议 >= 2000ml。");
  }

  refs.recommendation.innerHTML = [
    `<p><strong>基础代谢(BMR)</strong>：${Math.round(bmr)} kcal，<strong>估算维持消耗(TDEE)</strong>：${Math.round(tdee)} kcal</p>`,
    `<p><strong>饮食建议</strong></p><p>${nutritionTips.join("<br>")}</p>`,
    `<p><strong>训练建议</strong></p><p>${trainingTips.join("<br>")}</p>`,
    `<p class='muted'>提示：这是规则引擎版建议，后续可接 Garmin 数据后升级成更精细的 AI 推荐。</p>`,
  ].join("\n");
}

function renderAll() {
  const log = ensureLog(state.currentDate);
  renderMealTable(log.meals);
  renderWorkoutTable(log.workouts);
  renderMuscleMap(log.workouts);
  renderHistory();
}

function renderMealTable(meals) {
  if (!meals.length) {
    refs.mealTableBody.innerHTML = "<tr><td colspan='5' class='muted'>暂无记录</td></tr>";
    return;
  }

  refs.mealTableBody.innerHTML = meals
    .map(
      (meal) => `
      <tr>
        <td>${mealTypeLabel(meal.type)}</td>
        <td>${escapeHtml(meal.name)}</td>
        <td>${meal.calories || 0}</td>
        <td>${meal.protein || 0} / ${meal.carbs || 0} / ${meal.fat || 0}</td>
        <td><button class="delete-btn" data-kind="meal" data-id="${meal.id}">删除</button></td>
      </tr>`
    )
    .join("");

  refs.mealTableBody.querySelectorAll("button[data-kind='meal']").forEach((btn) => {
    btn.addEventListener("click", () => removeItem("meal", btn.dataset.id));
  });
}

function renderWorkoutTable(workouts) {
  if (!workouts.length) {
    refs.workoutTableBody.innerHTML = "<tr><td colspan='6' class='muted'>暂无记录</td></tr>";
    return;
  }

  refs.workoutTableBody.innerHTML = workouts
    .map(
      (workout) => `
      <tr>
        <td>${workoutTypeLabel(workout.type)}</td>
        <td>${escapeHtml(workout.name)}</td>
        <td>${workout.duration || 0}</td>
        <td>${workout.intensity || 3}</td>
        <td>${(workout.muscles || []).map(muscleLabel).join("、") || "-"}</td>
        <td><button class="delete-btn" data-kind="workout" data-id="${workout.id}">删除</button></td>
      </tr>`
    )
    .join("");

  refs.workoutTableBody.querySelectorAll("button[data-kind='workout']").forEach((btn) => {
    btn.addEventListener("click", () => removeItem("workout", btn.dataset.id));
  });
}

function renderHistory() {
  const logs = [...state.logs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 7);
  if (!logs.length) {
    refs.historyTableBody.innerHTML = "<tr><td colspan='6' class='muted'>暂无记录</td></tr>";
    return;
  }

  refs.historyTableBody.innerHTML = logs
    .map((log) => {
      const nutrition = sumNutrition(log.meals || []);
      const workout = sumWorkout(log.workouts || []);
      return `
      <tr>
        <td>${log.date}</td>
        <td>${nutrition.calories}</td>
        <td>${nutrition.protein}</td>
        <td>${workout.totalMin}</td>
        <td>${workout.aerobicMin}</td>
        <td>${workout.strengthMin}</td>
      </tr>`;
    })
    .join("");
}

function renderMuscleMap(workouts) {
  const activeMuscles = distinctMuscles(workouts);
  document.querySelectorAll(".muscle-map rect").forEach((rect) => rect.classList.remove("active"));

  activeMuscles.forEach((muscleId) => {
    const el = document.getElementById(muscleId);
    if (el) el.classList.add("active");
  });

  if (!activeMuscles.length) {
    refs.muscleLegend.innerHTML = "<span>今天尚未记录肌群</span>";
  } else {
    refs.muscleLegend.innerHTML = activeMuscles.map((id) => `<span>${muscleLabel(id)}</span>`).join("");
  }
}

function renderMuscleCheckboxes() {
  refs.muscleCheckboxes.innerHTML = MUSCLE_META.map(
    (muscle) => `
    <label>
      <input type="checkbox" name="muscles" value="${muscle.id}" />
      ${muscle.label}
    </label>`
  ).join("");
}

function removeItem(kind, itemId) {
  const log = ensureLog(state.currentDate);
  if (kind === "meal") {
    log.meals = log.meals.filter((item) => item.id !== itemId);
  } else {
    log.workouts = log.workouts.filter((item) => item.id !== itemId);
  }
  saveState();
  renderAll();
}

function weeklyStats() {
  const last7 = recentLogs(7);
  let aerobicMin = 0;
  let strengthSessions = 0;

  last7.forEach((log) => {
    const hasStrength = (log.workouts || []).some((w) => w.type === "strength");
    if (hasStrength) strengthSessions += 1;

    (log.workouts || []).forEach((w) => {
      if (w.type === "aerobic") aerobicMin += w.duration || 0;
    });
  });

  return { aerobicMin, strengthSessions };
}

function sumWorkout(workouts) {
  return (workouts || []).reduce(
    (acc, workout) => {
      const duration = workout.duration || 0;
      acc.totalMin += duration;
      if (workout.type === "aerobic") acc.aerobicMin += duration;
      if (workout.type === "strength") acc.strengthMin += duration;
      return acc;
    },
    { totalMin: 0, aerobicMin: 0, strengthMin: 0 }
  );
}

function sumNutrition(meals) {
  return (meals || []).reduce(
    (acc, meal) => {
      acc.calories += meal.calories || 0;
      acc.protein += meal.protein || 0;
      acc.carbs += meal.carbs || 0;
      acc.fat += meal.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function calcTrainingLoad(workouts) {
  return (workouts || []).reduce((sum, w) => sum + (w.duration || 0) * (w.intensity || 3), 0);
}

function calcBMR(gender, weight, height, age) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "male") return base + 5;
  if (gender === "female") return base - 161;
  return base - 78;
}

function ensureLog(date) {
  let log = state.logs.find((item) => item.date === date);
  if (!log) {
    log = {
      date,
      dailyWeight: null,
      sleepHours: null,
      steps: null,
      waterMl: null,
      fatigue: 3,
      note: "",
      meals: [],
      workouts: [],
    };
    state.logs.push(log);
  }
  return log;
}

function getLogByDate(date) {
  return ensureLog(date);
}

function getYesterdayLog(date) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return state.logs.find((item) => item.date === toISO(d));
}

function recentLogs(days) {
  const sorted = [...state.logs].sort((a, b) => (a.date < b.date ? 1 : -1));
  return sorted.slice(0, days);
}

function distinctMuscles(workouts) {
  const set = new Set();
  (workouts || []).forEach((w) => (w.muscles || []).forEach((m) => set.add(m)));
  return [...set];
}

function intersect(a, b) {
  const bSet = new Set(b);
  return a.filter((item) => bSet.has(item));
}

function loadState() {
  const fallback = {
    currentDate: todayISO(),
    profile: {
      name: "",
      gender: "male",
      age: null,
      height: null,
      weight: null,
      bodyFat: null,
      goal: "fat_loss",
      activityLevel: "moderate",
    },
    logs: [],
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      ...parsed,
      profile: { ...fallback.profile, ...(parsed.profile || {}) },
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = value ?? "";
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function mealTypeLabel(type) {
  return (
    {
      breakfast: "早餐",
      lunch: "午餐",
      dinner: "晚餐",
      snack: "加餐",
    }[type] || "-"
  );
}

function workoutTypeLabel(type) {
  return (
    {
      aerobic: "有氧",
      strength: "无氧",
      mobility: "恢复",
    }[type] || "-"
  );
}

function muscleLabel(id) {
  const target = MUSCLE_META.find((item) => item.id === id);
  return target ? target.label : id;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function todayISO() {
  return toISO(new Date());
}

function toISO(dateObj) {
  const y = dateObj.getFullYear();
  const m = `${dateObj.getMonth() + 1}`.padStart(2, "0");
  const d = `${dateObj.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
