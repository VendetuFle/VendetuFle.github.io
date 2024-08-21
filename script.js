const colors = {
    primary: ['#0097D3', '#00224B', '#FFFFFF'],
    secondary: ['#67B4E0', '#A9D0EB', '#E4EFF9', '#345078', '#7584A5', '#CDD0DE', '#5F6062'],
    spot: '#F9B200'
};

let activeSection = null;
let isDragging = false;
let clickTime = 0;
const presentation = document.getElementById('presentation');
const container = document.getElementById('presentation-container');
let scale = 1;
let translateX = 0;
let translateY = 0;
let startX, startY;


const slideFiles = [
    'slide1.json',
    'slide2.json',
    'slide3.json',
    'slide4.json',
    'slide5.json',
    'slide6.json',
    'slide7.json',
    'slide8.json',
    'slide9.json',
    /*'slide10.json',
    'slide11.json',
    'slide12.json'*/
];

function createSection(section, index) {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'section';
    sectionEl.style.backgroundColor = colors.secondary[index % colors.secondary.length];

    const content = document.createElement('div');
    content.className = 'section-content';

    const title = document.createElement('h2');
    title.textContent = section.title;
    content.appendChild(title);

    switch (section.type) {
        case 'text':
            const p = document.createElement('p');
            p.textContent = section.content;
            content.appendChild(p);
            break;
        case 'chart':
            const canvas = document.createElement('canvas');
            canvas.className = 'chart';
            content.appendChild(canvas);
            new Chart(canvas, {
                type: section.data.length > 4 ? 'line' : 'pie',
                data: {
                    labels: Array.from({ length: section.data.length }, (_, i) => `Label ${i + 1}`),
                    datasets: [{
                        data: section.data,
                        backgroundColor: colors.primary
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
            break;
        case 'image':
            const img = document.createElement('img');
            img.src = section.src;
            img.style.width = '100%';
            content.appendChild(img);
            break;
        case 'table':
            const table = document.createElement('table');
            section.data.forEach((row, i) => {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const td = document.createElement(i === 0 ? 'th' : 'td');
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });
            content.appendChild(table);
            break;
        case 'xy-plot':
            const canvasXY = document.createElement('canvas');
            canvasXY.className = 'xy-plot';
            content.appendChild(canvasXY);

            new Chart(canvasXY, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'XY Data',
                        data: section.data,
                        backgroundColor: colors.primary[0],
                        borderColor: colors.primary[1],
                        showLine: true, // Optional: shows lines connecting the points
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            beginAtZero: false,
                            grid: {
                                drawBorder: true,
                                color: '#ccc',
                                zeroLineColor: '#000',
                            }
                        },
                        y: {
                            type: 'linear',
                            beginAtZero: false,
                            grid: {
                                drawBorder: true,
                                color: '#ccc',
                                zeroLineColor: '#000',
                            }
                        }
                    }
                }
            });
            break;

            case 'google-sheets-chart':
                const chartCanvas = document.createElement('canvas'); // Renamed variable to chartCanvas
                chartCanvas.className = 'chart';
                content.appendChild(chartCanvas);
    
                fetchGoogleSheetData(section.sheetUrl).then(sheetData => {
                    const labels = ['Cost', 'Speed', 'Quality', 'Customer'];
                    const priorities = [0, 0, 0, 0];
    
                    sheetData.forEach(row => {
                        if (row.costPriority === 'Highest priority') priorities[0]++;
                        if (row.speedPriority === 'Highest priority') priorities[1]++;
                        if (row.qualityPriority === 'Highest priority') priorities[2]++;
                        if (row.customerPriority === 'Highest priority') priorities[3]++;
                    });
    
                    new Chart(chartCanvas, {  // Using the renamed variable here
                        type: 'bar', // Using a bar chart to show priorities
                        data: {
                            labels: labels,
                            datasets: [{
                                label: '# of Highest Priority Votes',
                                data: priorities,
                                backgroundColor: colors.primary
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true
                        }
                    });
                });
    
                break;
        
    }

    sectionEl.appendChild(content);

    sectionEl.addEventListener('mousedown', () => {
        clickTime = new Date().getTime();
        isDragging = false; // Reset the dragging state on mouse down
    });


    sectionEl.addEventListener('mousemove', () => {
        isDragging = true; // Set dragging to true if there's any movement
    });


    sectionEl.addEventListener('click', (event) => {
        if (!isDragging) { // Only handle the click event if not dragging
            const isActive = sectionEl.classList.contains('active');
    
            if (!isActive) {
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                sectionEl.classList.add('active');
    
                // Center the active section in the view
                translateToCenter(sectionEl);
            } else {
                // Optionally, you can add logic to deactivate the slide if clicked again.
                // For example, remove the 'active' class and reset transformations.
                // sectionEl.classList.remove('active');
            }
    
            event.stopPropagation(); // Prevent closing when clicking the active slide
        }
    });

    document.body.addEventListener('click', (event) => {
        const activeSection = document.querySelector('.section.active');
        if (activeSection && !activeSection.contains(event.target)) {
            // Close the slide only if clicking outside of the active slide
            activeSection.classList.remove('active');
        }
    });

    return sectionEl;
}


/*
function translateToSection(sectionEl) {
    const rect = sectionEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    translateX = containerRect.width / 2 - (rect.left + rect.width / 2);
    translateY = containerRect.height / 2 - (rect.top + rect.height / 2);
    
    scale = 1;
    applyTransform();
}
*/
//Function to select define the current center position of active section for transform function -- WORKING!
function translateToCenter(sectionEl) {

    const containerRect = container.getBoundingClientRect();
    const sectionRect = sectionEl.getBoundingClientRect();
    const presentationRect = presentation.getBoundingClientRect();

    const currentTranslateX = translateX;
    const currentTranslateY = translateY;

    const centerX = sectionRect.left + sectionRect.width / 2;
    const centerY = sectionRect.top + sectionRect.height / 2;

    const offsetX = containerRect.width / 2 - centerX + currentTranslateX;
    const offsetY = containerRect.height / 2 - centerY + currentTranslateY;

    // Check if the new transform will actually move the section
    if (Math.abs(offsetX - translateX) > 1 || Math.abs(offsetY - translateY) > 1) {
        translateX = offsetX;
        translateY = offsetY;
        applyTransform();
    }
}

// Function to pan the screen -- Working!
function applyTransform() {
    presentation.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}


container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    zoomToPoint(x, y, e.deltaY);
});


function zoomToPoint(x, y, delta) {
    const zoomFactor = Math.pow(0.999, delta);
    const oldScale = scale;
    scale *= zoomFactor;
    scale = Math.min(Math.max(scale, 0.5), 1); // Limit scale between 0.5 and 2

    const activeSection = document.querySelector('.section.active');

    /*
    if (activeSection) {
        // Center the active slide during zoom
        //reCenterActiveSlide(activeSection, oldScale, scale);
        //translateToCenter();
        //applyTransform();

    } else {
        // Default behavior: zoom to the mouse pointer
        
        const rect = presentation.getBoundingClientRect();
        const offsetX = (x - rect.left) / oldScale;
        const offsetY = (y - rect.top) / oldScale;

        translateX -= offsetX * (scale - oldScale);
        translateY -= offsetY * (scale - oldScale);
        
        applyTransform();

        translateToCenter();
        applyTransform();
    }
    */
    const rect = presentation.getBoundingClientRect();
    const offsetX = (x - rect.left) / oldScale;
    const offsetY = (y - rect.top) / oldScale;

    translateX -= offsetX * (scale - oldScale);
    translateY -= offsetY * (scale - oldScale);
    
    applyTransform();

    translateToCenter();
    applyTransform();
    
}


container.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    container.style.cursor = 'grabbing';
    isDragging = false;

    const onMouseMove = (e) => {
        const moveX = e.clientX - startX;
        const moveY = e.clientY - startY;

        if (Math.abs(moveX) > 5 || Math.abs(moveY) > 5) {
            isDragging = true;
        }

        translateX = moveX;
        translateY = moveY;
        applyTransform();
    };

    const onMouseUp = () => {
        container.style.cursor = 'grab';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
});


// For mobile:
container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        startX = touch.clientX - translateX;
        startY = touch.clientY - translateY;
        isDragging = false;
    }
});

container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const moveX = touch.clientX - startX;
        const moveY = touch.clientY - startY;

        if (Math.abs(moveX) > 5 || Math.abs(moveY) > 5) {
            isDragging = true;
        }

        translateX = moveX;
        translateY = moveY;
        applyTransform();
    }
});

container.addEventListener('touchend', () => {
    if (!isDragging) {
    }
});


/*
function reCenterActiveSlide(sectionEl, oldScale, newScale) {
    const containerRect = container.getBoundingClientRect();
    const sectionRect = sectionEl.getBoundingClientRect();

    // Calculate the center of the container
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;

    // Calculate the center of the section relative to the container
    const sectionCenterX = sectionRect.left + sectionRect.width / 2;
    const sectionCenterY = sectionRect.top + sectionRect.height / 2;

    // Calculate the difference in center points
    const deltaX = (sectionCenterX - containerCenterX) / oldScale;
    const deltaY = (sectionCenterY - containerCenterY) / oldScale;

    // Adjust the translation to keep the section centered
    translateX -= deltaX * (newScale - oldScale);
    translateY -= deltaY * (newScale - oldScale);

    applyTransform();
}
*/




async function loadSlide(file, index) {
    try {
        const response = await fetch(file);
        const slide = await response.json();
        const sectionEl = createSection(slide, index);
        return sectionEl;
    } catch (error) {
        console.error('Error loading slide:', error);
    }
}

async function initializeSections() {
    const rows = Math.ceil(Math.sqrt(slideFiles.length));
    const cols = Math.ceil(slideFiles.length / rows);
    const sectionWidth = 600;
    const sectionHeight = 400;
    const spacingFactor = 2;

    for (let i = 0; i < slideFiles.length; i++) {
        const sectionEl = await loadSlide(slideFiles[i], i);
        const row = Math.floor(i / cols);
        const col = i % cols;
        sectionEl.style.left = `${col * sectionWidth * spacingFactor}px`;
        sectionEl.style.top = `${row * sectionHeight * spacingFactor}px`;
        presentation.appendChild(sectionEl);
    }

    presentation.style.width = `${cols * sectionWidth * spacingFactor}px`;
    presentation.style.height = `${rows * sectionHeight * spacingFactor}px`;

    /*
    applyTransform();
    */
}

// Function to fetch data from Google Sheets
async function fetchGoogleSheetData(sheetUrl) {
    const response = await fetch(sheetUrl);
    const data = await response.text();
    const rows = data.split("\n").slice(1); // Skip header row

    const parsedData = rows.map(row => {
        const columns = row.split(",");

        return {
            timestamp: columns[0],
            score: columns[1],
            costPriority: columns[2],
            speedPriority: columns[3],
            qualityPriority: columns[4],
            customerPriority: columns[5]
        };
    });

    return parsedData;
}

/*
initChart();
*/

initializeSections();
