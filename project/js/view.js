const view = {
    chart: null,

    renderResults({ slope, intercept, r2, data }) {
        document.getElementById('results').style.display = 'block';
        document.getElementById('equation').innerText = `Рівняння: y = ${slope}x + ${intercept}`;
        document.getElementById('r2').innerText = `Коефіцієнт детермінації (R²): ${r2}`;

        const ctx = document.getElementById('regressionChart').getContext('2d');
        if (this.chart) this.chart.destroy();
        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Середні оцінки',
                        data: data.map(d => ({ x: d.index, y: d.averageScore })),
                        backgroundColor: 'rgba(0, 123, 255, 0.5)'
                    },
                    {
                        label: 'Лінія регресії',
                        data: [
                            { x: Math.min(...data.map(d => d.index)), y: Math.min(...data.map(d => d.index)) * slope + Number(intercept) },
                            { x: Math.max(...data.map(d => d.index)), y: Math.max(...data.map(d => d.index)) * slope + Number(intercept) }
                        ],
                        type: 'line',
                        borderColor: 'red',
                        fill: false
                    }
                ]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Порядковий номер студента' } },
                    y: { title: { display: true, text: 'Середня оцінка' } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const index = context.dataIndex;
                                const student = data[index];
                                return `${student.name}: ${student.averageScore.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    },

    showError(message) {
        alert(message);
    }
};

// Зробити view глобально доступним
window.view = view;