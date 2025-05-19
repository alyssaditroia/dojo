window.addEventListener('DOMContentLoaded', () => {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    :root {
      --brand-black: #000000;
      --brand-white: #ffffff;
      --brand-light-gray: #747474;
      --brand-dark-gray: #484848;
      --brand-green: #78be20;
      --brand-gold: #ffc627;
      --brand-blue: #00a3e0;
      --danger: #ff3333;
      --neutral: #888888;

      --accent: var(--brand-green);
      --accent-dim: rgba(120, 190, 32, 0.6);
      --accent-dimmer: rgba(120, 190, 32, 0.2);
      --dark: var(--brand-black);
      --darker:rgb(10, 10, 10);
      --text: var(--brand-white);
      --subtle-text: var(--brand-light-gray);
      --border: var(--brand-dark-gray);
    }

    body {
      color: white;
      font-family: 'Space Mono', monospace;
      margin: 2px;
      padding: 8px;
      font-size: 12px;
      line-height: 1.2;
    }

    .dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 4px;
      max-width: 900px;
      margin: 2 auto;
    }

    .stat-card {
      background: #000000;
background: linear-gradient(110deg, rgba(0, 0, 0, 1) 0%, rgb(8, 8, 8) 60%, rgb(17, 17, 17) 100%);
      border: 1px solid var(--darker);
      padding: 5px;
      border-radius: 7px;
      height: 140px;
      width: 100%;
      box-shadow: 0 0 4px rgb(0, 0, 0);
    }

    .stat-card-header {
      font-size: 13px;
      color: var(--brand-green);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
      padding-left: 2px;
      padding-bottom: 3px;
      padding-top: 3px;
    }

    .stat-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 4px;
    }

    .stat-box {
      padding: 2px;
      border-left: 2px solid var(--accent-dim);
    }

    .stat-label {
      font-size: 11px;
      color: var(--subtle-text);
      margin-bottom: 2px;
    }

    .stat-value {
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
    }

    .stat-trend {
      margin-left: 4px;
      font-size: 12px;
    }

    .trend-up { color: var(--brand-green); }
    .trend-down { color: var(--danger); }
    .trend-neutral { color: var(--subtle-text); }

    .chart-container {
      height: 100px;
      margin-top: 1px;
      padding: 1px;
      border: none;
    }

    .recent-item {
      padding: 3px 0;
      border-bottom: 1px solid var(--border);
      font-size: 11px;
    }

    .recent-time {
      color: var(--subtle-text);
      font-size: 10px;
      margin-top: 1px;
    }
  `;
  document.head.appendChild(styleEl);

  const w = document.getElementById('stats-wrapper');
  if (!w) return;
  
  // Load stats from the data attribute
  const s = JSON.parse(w.dataset.stats || '{}');
  const trends = s.trends || {};
  console.log('Stats:', s);
  if (!Object.keys(s).length) return;

  w.innerHTML = `
    <div class="dashboard">
      <div class="stat-card">
        <div class="stat-card-header">DOJO METRICS</div>
        <div class="stat-container">
          ${["solves", "users", "active", "challenges" ].map(k => {
            const trendValue = trends[k] || 0;
            let trendClass = 'trend-neutral';
            let trendArrow = '-';
            
            if (trendValue > 0) {
              trendClass = 'trend-up';
              trendArrow = '▲';
            } else if (trendValue < 0) {
              trendClass = 'trend-down';
              trendArrow = '▼';
            }
            
            return `
              <div class="stat-box">
                <div class="stat-label">${k.toUpperCase()}</div>
                <div class="stat-value">
                  ${s[k] || (k==='challenges' ? s.visible_challenges : 0)}
                  <span class="stat-trend ${trendClass}">
                    ${trendArrow}${Math.abs(trendValue)}%
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">ACTIVITY TIMELINE</div>
        <div class="chart-container">
          <canvas id="activity-chart"></canvas>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">LATEST A</div>
        <div class="top-users">
          ${(s.top_users || []).slice(0, 3).map((u, i) => `
            <div class="recent-item">
              #${i+1} User_${u.user_id} — ${u.solves} solves
            </div>
          `).join('') || '<div class="recent-item">No data available</div>'}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">RECENT ACTIVITY</div>
        <div class="recent-activity">
          ${
            Array.isArray(s.recent_solves) && s.recent_solves.length
              ? s.recent_solves.map(entry => `
                  <div class="recent-item">
                    ${entry.challenge_name}
                    <div class="recent-time">
                      ${new Date(entry.date).toLocaleDateString()} ${new Date(entry.date).toLocaleTimeString()}
                    </div>
                  </div>
                `).join('')
              : '<div class="recent-item">No recent activity</div>'
          }
        </div>
      </div>
    </div>
  `;

  Chart.defaults.color = 'white';
  Chart.defaults.font.family = "'JetBrains Mono','Consolas',monospace";
  Chart.defaults.font.size = 9;

  const labels = ['0d', '7d', '30d', '60d'];
  const periods = ['daily', 'weekly', 'monthly', 'ninety'];
  
  // Calculate incremental data for the solves chart
  const solvesData = periods.map(p => s[p]?.solves || 0);
  
  // Get users data
  const usersData = periods.map(p => s[p]?.users || 0);

  // Create activity chart
  const chartElement = document.getElementById('activity-chart');
  if (chartElement) {
    new Chart(
      chartElement.getContext('2d'),
      {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Solves',
              data: solvesData,
              borderColor: 'rgb(119, 190, 32)',
              tension: 0.3,
              pointBackgroundColor: 'rgb(119, 190, 32)'
            },
            {
              label: 'Users',
              data: usersData,
              borderColor: 'rgb(0, 164, 224)',
              tension: 0.3,
              pointBackgroundColor: 'rgb(0, 164, 224)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { display: true } },
            y: {
              beginAtZero: true,
              grid: { color: 'black' },
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'black',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'black', 
              cornerRadius: 2,
              padding: 4,
              displayColors: true
            }
          }
        }
      }
   );
  }
 });