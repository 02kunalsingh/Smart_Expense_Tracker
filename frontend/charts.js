let expenseChart = null;

async function loadCharts() {
  try {
    const res = await window.authManager.apiRequest("http://localhost:5000/api/expenses/summary");
    const data = await res.json();
    
    const ctx = document.getElementById("expenseChart");
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (expenseChart) {
      expenseChart.destroy();
    }
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    // Only create chart if we have data
    if (labels.length > 0 && values.some(v => v > 0)) {
      expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#FF6384'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ₹${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    } else {
      // No data: clear any existing chart
      if (expenseChart) {
        expenseChart.destroy();
        expenseChart = null;
      }
    }
  } catch (error) {
    console.error("Error loading charts:", error);
  }
}
  