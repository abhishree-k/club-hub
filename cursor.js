const DOT_COUNT = 10;
const container = document.getElementById('cursor-container');
const dots = [];

for (let i = 0; i < DOT_COUNT; i++) {
    const span = document.createElement('span');
    span.className = 'cursor-dot';

    span.style.opacity = 1 - (i * 0.1); 
    span.style.transform = `translate(-50%, -50%) scale(${1 - (i * 0.05)})`;

    container.appendChild(span);
    dots.push(span);
}

let mouseX = 0;
let mouseY = 0;

const history = Array.from({ length: DOT_COUNT }, () => ({ x: 0, y: 0 }));
const positions = Array.from({ length: DOT_COUNT }, () => ({ x: 0, y: 0 }));

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// --- Animation Loop ---
function animate() {
    history.unshift({ x: mouseX, y: mouseY });
    history.pop();

    // Update dot positions
    dots.forEach((dot, index) => {
        const target = history[index];
        const current = positions[index];

        current.x += (target.x - current.x) * 0.18;
        current.y += (target.y - current.y) * 0.18;

        dot.style.left = `${current.x}px`;
        dot.style.top = `${current.y}px`;
    });

    requestAnimationFrame(animate);
}

animate();

document.addEventListener("DOMContentLoaded", () => {
    const cursorToggle = document.getElementById('cursor-toggle');
    
    if (localStorage.getItem('cursorTrail') === 'disabled') {
        document.body.classList.add('cursor-disabled');
    }

    const updateCursorIcon = () => {
        const icon = cursorToggle.querySelector('i');
        if (document.body.classList.contains('cursor-disabled')) {
            icon.classList.remove('fa-arrow-pointer');
            icon.classList.add('fa-computer-mouse');
        } else {
            icon.classList.remove('fa-computer-mouse');
            icon.classList.add('fa-arrow-pointer');
        }
    };

    if (cursorToggle) {
        updateCursorIcon();
        cursorToggle.addEventListener('click', () => {
            document.body.classList.toggle('cursor-disabled');
            localStorage.setItem('cursorTrail', document.body.classList.contains('cursor-disabled') ? 'disabled' : 'enabled');
            updateCursorIcon();
        });
    }
});

const cursorDot = document.querySelector(".cursor-dot");

document.addEventListener("mousedown", () => {
  cursorDot.classList.add("click");
});

document.addEventListener("mouseup", () => {
  cursorDot.classList.remove("click");
});
