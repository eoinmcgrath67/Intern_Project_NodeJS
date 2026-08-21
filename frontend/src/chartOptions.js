export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      labels: {
        color: '#f8fafc',
        font: {
          size: 14
        }
      }
    }
  },

  scales: {
    x: {
      ticks: {
        color: '#cbd5e1'
      },
      grid: {
        color: '#334155'
      }
    },
    y: {
      ticks: {
        color: '#cbd5e1'
      },
      grid: {
        color: '#334155'
      }
    }
  }
};