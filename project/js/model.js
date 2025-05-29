const model = {
    parseCSV(content) {
        const lines = content.split('\n').filter(line => line.trim() !== '');
        const data = lines.slice(1).map((line, index) => {
            const [name, ...scores] = line.split(',').map(item => item.trim());
            const numericScores = scores.map(Number).filter(score => !isNaN(score));
            if (numericScores.length === 0) return null;
            const averageScore = numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length;
            return { name, averageScore, index: index + 1 };
        }).filter(item => item !== null);
        return data;
    },

    performRegression(data) {
        const x = data.map(d => d.index); // Порядковий номер студента
        const y = data.map(d => d.averageScore); // Середня оцінка
        const regression = new ML.SimpleLinearRegression(x, y);
        return {
            slope: regression.slope.toFixed(2),
            intercept: regression.intercept.toFixed(2),
            r2: regression.score(x, y).r2.toFixed(4),
            predict: x => regression.predict(x),
            data
        };
    }
};

// Зробити model глобально доступним
window.model = model;