// Get the canvas element and context
const canvas = document.getElementById('xyPlot');
const ctx = canvas.getContext('2d');

// Canvas dimensions
const width = canvas.width;
const height = canvas.height;

// Move the origin to the center of the canvas
ctx.translate(width / 2, height / 2);

// Draw X-axis
ctx.beginPath();
ctx.moveTo(-width / 2, 0);
ctx.lineTo(width / 2, 0);
ctx.strokeStyle = 'black';
ctx.stroke();

// Draw Y-axis
ctx.beginPath();
ctx.moveTo(0, -height / 2);
ctx.lineTo(0, height / 2);
ctx.strokeStyle = 'black';
ctx.stroke();

// Draw grid lines (optional)
const gridSize = 50;
ctx.strokeStyle = '#ddd';

for (let i = -width / 2; i <= width / 2; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, -height / 2);
    ctx.lineTo(i, height / 2);
    ctx.stroke();
}

for (let i = -height / 2; i <= height / 2; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(-width / 2, i);
    ctx.lineTo(width / 2, i);
    ctx.stroke();
}

// Draw some points (example points)
const points = [
    { x: 50, y: 50 },
    { x: -100, y: 75 },
    { x: 80, y: -120 },
    { x: -60, y: -60 }
];

ctx.fillStyle = 'red';
points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, -point.y, 5, 0, 2 * Math.PI);
    ctx.fill();
});