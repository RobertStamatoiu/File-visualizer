
const layout = document.querySelector('.layout');
const RowSeparator = document.getElementById("horizontal-separator");
const ColSeparator = document.getElementById("vertical-separator");


const Panel = Object.freeze({
    FILE: "file",
    TERMINAL: "terminal",
    TREE: "tree"
});

let row_dragging = false;
let col_dragging = false;
let min_height = 200;
let min_width = 230;
let focused = Panel.TERMINAL;
let command = "";
let current_dir = "";

RowSeparator.addEventListener('mousedown', () => { row_dragging = true; });
ColSeparator.addEventListener('mousedown', () => { col_dragging = true; });
document.addEventListener('mouseup', () => { row_dragging = false; col_dragging = false; });

document.addEventListener('mousemove', (event) => {
    if(!(row_dragging || col_dragging)){
        return;
    }
    if(col_dragging){
        const x = event.clientX;
        layout.style.gridTemplateColumns = `${Math.max(min_width, Math.min(x, window.innerWidth - min_width))}px 5px 1fr`;
    } else {
        const y = event.clientY;
        layout.style.gridTemplateRows = `${Math.max(min_height, Math.min(y, window.innerHeight - min_height))}px 5px 1fr`;
    }
})

document.addEventListener('keydown', (event) => {
    let key = event.key;
    if (key.length === 1) {
        command += key;
    } else if (key === "Backspace"){
        command = command.slice(0, -1);
    }
    document.getElementById("command").textContent = current_dir + "> " + command;
})