// 🔹 Replace this with your deployed backend URL
const API_URL = "https://smart-expense-tracker-ai.onrender.com/api/expenses";

// Check authentication on page load
if (!window.authManager.isAuthenticated()) {
  window.location.href = '/login.html';
}

// Get DOM elements
const form = document.getElementById("add-form");
const list = document.getElementById("expense-list");
const exportBtn = document.getElementById("export-csv");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const filterCategory = document.getElementById("filter-category");
const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");
const applyFilters = document.getElementById("apply-filters");
const darkToggle = document.getElementById("dark-toggle");
const logoutBtn = document.getElementById("logout-btn");
const userAvatar = document.getElementById("user-avatar");
const userName = document.getElementById("user-name");
// Modal/FAB
const fabAdd = document.getElementById("fab-add");
const modal = document.getElementById("modal-add");
const modalBackdrop = document.getElementById("modal-backdrop");
const modalClose = document.getElementById("modal-close");
// Metrics & filters
const cardTotalMonth = document.getElementById('card-total-month');
const cardAvgDay = document.getElementById('card-avg-day');
const cardTopCategory = document.getElementById('card-top-category');
const cardBudgetUsed = document.getElementById('card-budget-used');
const budgetProgress = document.getElementById('budget-progress');
const budgetInput = document.getElementById('budget-input');
const budgetSave = document.getElementById('budget-save');
const chipMonth = document.getElementById('chip-month');
const chip30 = document.getElementById('chip-30');
const chipWeek = document.getElementById('chip-week');
const chipClear = document.getElementById('chip-clear');
const sortSelect = document.getElementById('sort-select');

let allExpenses = [];
let currentFilter = 'month';

// Load user info and setup UI
function setupUserInfo() {
  const user = window.authManager.getCurrentUser();
  if (user) {
    userAvatar.textContent = user.firstName.charAt(0).toUpperCase();
    userName.textContent = `${user.firstName} ${user.lastName}`;
  }
}

// Load expenses and display them
async function loadExpenses() {
  try {
    const res = await window.authManager.apiRequest(API_URL);
    const data = await res.json();
    allExpenses = Array.isArray(data) ? data : [];
    displayExpenses(data);
    updateStatsBar(data);
    updateCategoryFilter(data);
    loadCharts(); // Refresh charts
    loadAIInsights(); // Refresh AI insights
    updateMetrics();
  } catch (error) {
    console.error("Error loading expenses:", error);
  }
}

// Display expenses in the list
function displayExpenses(expenses) {
  list.innerHTML = "";
  expenses.forEach(exp => {
    const li = document.createElement("li");
    const date = new Date(exp.date).toLocaleDateString();
    const merchantInfo = exp.merchant ? `<span class="merchant">${exp.merchant}</span>` : '';
    li.innerHTML = `
      <div class="expense-info">
        <span class="description">${exp.description}</span>
        <span class="amount">₹${exp.amount}</span>
        <span class="category">${exp.category}</span>
        <span class="date">${date}</span>
        ${merchantInfo}
      </div>
      <button onclick="deleteExpense('${exp._id || exp.id}')" class="delete-btn">❌</button>
    `;
    list.appendChild(li);
  });
}

// Update category filter dropdown
function updateCategoryFilter(expenses) {
  const categories = [...new Set(expenses.map(exp => exp.category))];
  filterCategory.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });
}

// Add expense form handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const description = document.getElementById("input-description").value;
  const amount = document.getElementById("input-amount").value;
  const date = document.getElementById("input-date").value;

  if (!description.trim()) {
    alert("Please enter a description");
    return;
  }

  try {
    const response = await window.authManager.apiRequest(API_URL, {
      method: "POST",
      body: JSON.stringify({ 
        description: description.trim(),
        amount: amount || null,
        date: date || null
      })
    });

    if (response.ok) {
      form.reset();
      loadExpenses();
    } else {
      alert("Error adding expense");
    }
  } catch (error) {
    console.error("Error adding expense:", error);
    alert("Error adding expense");
  }
});

// Delete expense
async function deleteExpense(id) {
  if (!confirm("Are you sure you want to delete this expense?")) {
    return;
  }

  try {
    const response = await window.authManager.apiRequest(`${API_URL}/${id}`, { method: "DELETE" });
    if (response.ok) {
      loadExpenses();
    } else {
      alert("Error deleting expense");
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    alert("Error deleting expense");
  }
}

// Export CSV
exportBtn.addEventListener("click", () => {
  window.location.href = `${API_URL}/export/csv`;
});

// Import CSV
importBtn.addEventListener("click", () => {
  if (!importFile.files[0]) {
    alert("Please select a CSV file");
    return;
  }

  const formData = new FormData();
  formData.append("file", importFile.files[0]);

  fetch(`${API_URL}/import/csv`, {
    method: "POST",
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.imported) {
      alert(`Successfully imported ${data.imported} expenses`);
      loadExpenses();
      importFile.value = "";
    } else {
      alert("Error importing CSV");
    }
  })
  .catch(error => {
    console.error("Error importing CSV:", error);
    alert("Error importing CSV");
  });
});

// Apply filters
applyFilters.addEventListener("click", () => {
  const category = filterCategory.value;
  const start = startDate.value;
  const end = endDate.value;

  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (start) params.append("startDate", start);
  if (end) params.append("endDate", end);

  const url = `${API_URL}?${params.toString()}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      displayExpenses(data);
      updateStatsBar(data);
    })
    .catch(error => {
      console.error("Error filtering expenses:", error);
    });
});

// Dark mode toggle
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

// --- AI FEATURES (same as your code) ---


// AI Features
const aiQueryInput = document.getElementById("ai-query-input");
const aiQueryBtn = document.getElementById("ai-query-btn");
const aiQueryResponse = document.getElementById("ai-query-response");
const suggestionsList = document.getElementById("suggestions-list");
const trendsInfo = document.getElementById("trends-info");
const searchInput = document.getElementById("search-input");
const navDashboard = document.getElementById("nav-dashboard");
const navInsights = document.getElementById("nav-insights");
const sectionDashboard = document.getElementById("section-dashboard");
const sectionInsights = document.getElementById("section-insights");

// Load AI insights
async function loadAIInsights() {
  try {
    // Load suggestions
    const suggestionsRes = await window.authManager.apiRequest(`${API_URL}/ai/suggestions`);
    const suggestionsData = await suggestionsRes.json();
    displaySuggestions(suggestionsData.suggestions);

    // Load trends
    const trendsRes = await window.authManager.apiRequest(`${API_URL}/ai/trends`);
    const trendsData = await trendsRes.json();
    displayTrends(trendsData.trends);
  } catch (error) {
    console.error("Error loading AI insights:", error);
  }
}

// Display AI suggestions
function displaySuggestions(suggestions) {
  suggestionsList.innerHTML = "";
  if (suggestions.length === 0) {
    suggestionsList.innerHTML = '<div class="ai-loading">No suggestions available yet. Add more expenses to get personalized insights!</div>';
    return;
  }

  suggestions.forEach(suggestion => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerHTML = `
      <div class="suggestion-message">${suggestion.message}</div>
      <div class="suggestion-recommendation">💡 ${suggestion.recommendation}</div>
    `;
    suggestionsList.appendChild(div);
  });
}

// Display spending trends
function displayTrends(trends) {
  trendsInfo.innerHTML = "";
  if (!trends) {
    trendsInfo.innerHTML = '<div class="ai-loading">Not enough data to analyze trends yet. Add more expenses!</div>';
    return;
  }

  const div = document.createElement("div");
  div.className = `trend-info trend-${trends.trend}`;
  div.innerHTML = `
    <div class="trend-message">📊 ${trends.message}</div>
    <div class="trend-amount">Amount: ₹${trends.amount.toFixed(2)}</div>
  `;
  trendsInfo.appendChild(div);
}

// Handle AI query
aiQueryBtn.addEventListener("click", async () => {
  const query = aiQueryInput.value.trim();
  if (!query) {
    alert("Please enter a question about your expenses");
    return;
  }

  try {
    aiQueryBtn.disabled = true;
    aiQueryBtn.textContent = "Thinking...";
    aiQueryResponse.innerHTML = '<div class="ai-loading">🤔 Analyzing your spending patterns...</div>';

    const response = await window.authManager.apiRequest(`${API_URL}/ai/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    
    aiQueryResponse.innerHTML = `
      <div class="ai-response">
        <div class="response-answer">🤖 ${data.answer}</div>
        ${data.data ? `<div class="response-data">Data: ${JSON.stringify(data.data, null, 2)}</div>` : ''}
      </div>
    `;

    aiQueryInput.value = "";
  } catch (error) {
    console.error("Error processing AI query:", error);
    aiQueryResponse.innerHTML = '<div class="ai-response">❌ Sorry, I couldn\'t process your query. Please try again.</div>';
  } finally {
    aiQueryBtn.disabled = false;
    aiQueryBtn.textContent = "Ask";
  }
});

// Handle Enter key in AI query input
aiQueryInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    aiQueryBtn.click();
  }
});

// Logout functionality
logoutBtn.addEventListener("click", () => {
  window.authManager.logout();
});

// Load expenses and AI insights on page load
setupUserInfo();
loadExpenses();
loadAIInsights();

// Search filter
searchInput && searchInput.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const items = Array.from(list.querySelectorAll('li'));
  items.forEach(li => {
    const text = li.textContent.toLowerCase();
    li.style.display = text.includes(term) ? '' : 'none';
  });
});

// Metrics helpers
function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function startOfWeek(d){ const n=new Date(d); const day = n.getDay(); const diff = n.getDate() - day + (day === 0 ? -6 : 1); return new Date(n.getFullYear(), n.getMonth(), diff); }
function lastNDays(n){ const now=new Date(); return new Date(now.getTime() - (n*24*3600*1000)); }

function computeFiltered(){
  let filtered = [...allExpenses];
  const now = new Date();
  if (currentFilter === 'month') {
    const s = startOfMonth(now);
    filtered = filtered.filter(e => new Date(e.date) >= s);
  } else if (currentFilter === 'week') {
    const s = startOfWeek(now);
    filtered = filtered.filter(e => new Date(e.date) >= s);
  } else if (currentFilter === '30') {
    const s = lastNDays(30);
    filtered = filtered.filter(e => new Date(e.date) >= s);
  }
  // sort
  const v = sortSelect ? sortSelect.value : 'date-desc';
  filtered.sort((a,b)=>{
    if (v === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (v === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (v === 'amount-desc') return (parseFloat(b.amount)||0) - (parseFloat(a.amount)||0);
    if (v === 'amount-asc') return (parseFloat(a.amount)||0) - (parseFloat(b.amount)||0);
    return 0;
  });
  return filtered;
}

function updateMetrics(){
  const filtered = computeFiltered();
  const now = new Date();
  const sMonth = startOfMonth(now);
  const thisMonth = allExpenses.filter(e => new Date(e.date) >= sMonth);
  const totalMonth = thisMonth.reduce((s,e)=> s + (parseFloat(e.amount)||0),0);
  const days = Math.max(1, Math.ceil((now - sMonth)/(24*3600*1000)));
  const avgDay = totalMonth / days;
  const catMap = {};
  thisMonth.forEach(e => { const c=e.category||'Other'; catMap[c]=(catMap[c]||0)+(parseFloat(e.amount)||0); });
  const topCat = Object.entries(catMap).sort(([,A],[,B])=>B-A)[0];
  const budget = parseFloat(localStorage.getItem('monthlyBudget')||'0')||0;
  const usedPct = budget ? Math.min(100, (totalMonth/budget)*100) : 0;
  if (cardTotalMonth) cardTotalMonth.textContent = `₹${totalMonth.toFixed(2)}`;
  if (cardAvgDay) cardAvgDay.textContent = `₹${avgDay.toFixed(2)}`;
  if (cardTopCategory) cardTopCategory.textContent = topCat ? `${topCat[0]} (₹${topCat[1].toFixed(0)})` : '—';
  if (cardBudgetUsed) cardBudgetUsed.textContent = `${usedPct.toFixed(0)}%`;
  if (budgetProgress) budgetProgress.style.width = `${usedPct}%`;
  // re-render list with filtered/sorted
  displayExpenses(filtered);
}

// Budget persistence
if (budgetInput) {
  budgetInput.value = localStorage.getItem('monthlyBudget') || '';
}
budgetSave && budgetSave.addEventListener('click', ()=>{
  const v = parseFloat(budgetInput.value||'0')||0;
  localStorage.setItem('monthlyBudget', String(v));
  updateMetrics();
});

// Chip filters
function setChipActive(el){ document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active')); el.classList.add('active'); }
chipMonth && chipMonth.addEventListener('click', ()=>{ currentFilter='month'; setChipActive(chipMonth); updateMetrics(); });
chip30 && chip30.addEventListener('click', ()=>{ currentFilter='30'; setChipActive(chip30); updateMetrics(); });
chipWeek && chipWeek.addEventListener('click', ()=>{ currentFilter='week'; setChipActive(chipWeek); updateMetrics(); });
chipClear && chipClear.addEventListener('click', ()=>{ currentFilter=''; setChipActive(chipClear); updateMetrics(); });
sortSelect && sortSelect.addEventListener('change', updateMetrics);

// Nav toggle & focus
function setActive(button) {
  document.querySelectorAll('.nav .nav-item').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
}
navDashboard && navDashboard.addEventListener('click', () => {
  setActive(navDashboard);
  sectionDashboard.style.display = '';
  sectionInsights.style.display = 'none';
  sectionDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
navInsights && navInsights.addEventListener('click', () => {
  setActive(navInsights);
  sectionDashboard.style.display = 'none';
  sectionInsights.style.display = '';
  sectionInsights.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Modal handlers
function openModal() {
  if (!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal() {
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}
fabAdd && fabAdd.addEventListener('click', openModal);
modalBackdrop && modalBackdrop.addEventListener('click', closeModal);
modalClose && modalClose.addEventListener('click', closeModal);

// Stats bar updater
function updateStatsBar(expenses) {
  const statsBar = document.getElementById("stats-bar");
  if (!statsBar) return;
  const total = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const count = expenses.length;
  const avg = count ? total / count : 0;
  document.getElementById("stat-total").textContent = `₹${total.toFixed(2)}`;
  document.getElementById("stat-count").textContent = String(count);
  document.getElementById("stat-avg").textContent = `₹${avg.toFixed(2)}`;
  statsBar.style.display = "grid";
}
