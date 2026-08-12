import * as fs from "./filesystem.js"


// HTML elements go below

const layout = document.querySelector('.layout');
const RowSeparator = document.getElementById("horizontal-separator");
const ColSeparator = document.getElementById("vertical-separator");
const terminal = document.getElementById("terminal");
const commandElement = document.getElementById("command");
const treeContainer = document.getElementById("tree-container");
const treeTopBar = document.getElementById("tree-top-bar");
const addFileBtn = document.getElementById("add-file-button");
const addFolderBtn = document.getElementById("add-folder-button");
// the panel type (later used for focusing / colapsing)

const Panel = Object.freeze({
    FILE: "file",
    TERMINAL: "terminal",
    TREE: "tree"
});

const tokenType = Object.freeze({
    command: 1,
    filepath: 2,
    argument: 3,
    verbflag: 4,
    flag: 5
});

const addFile = Object.freeze({
    False: 0,
    File: 1,
    Folder: 2
});

// various variables used thourghout

let row_dragging = false;
let col_dragging = false;
let min_height = 200;
let min_width = 230;
let focused = Panel.TERMINAL;
let command = "";
let current_dir = "";
let folder_focused = null;
let add_file_mode = addFile.False;
let currentInput = null;

function tokenise(input) {
    let tokens = [];
    let words = input.trim().split(/\s+/);
    for (let word of words) {
        if (word[0] === "@") {
            tokens.push({
                type: tokenType.command,
                value: word.slice(1)
            });
        } else if (word.includes("/")) {
            tokens.push({
                type: tokenType.filepath,
                value: word
            });
        } else if (word.startsWith("--")) {
            tokens.push({
                type: tokenType.verbflag,
                value: word.slice(2)
            });
        } else if (word.startsWith("-")) {
            tokens.push({
                type: tokenType.flag,
                value: word.slice(1)
            });
        } else {
            tokens.push({
                type: tokenType.argument,
                value: word
            });
        }
    }
    return tokens;
}
function renderToken(token) {
    const span = document.createElement("span");
    switch (token.type) {
        case tokenType.command:
            span.className = "command";
            span.textContent = "@" + token.value;
            break;
        case tokenType.filepath:
            span.className = "filepath";
            span.textContent = token.value;
            break;
        case tokenType.argument:
            span.className = "";
            span.textContent = token.value;
            break;
        case tokenType.verbflag:
            span.className = "flag";
            span.textContent = "--" + token.value;
            break;
        case tokenType.flag:
            span.className = "flag";
            span.textContent = "-" + token.value;
            break;
        default:
            span.className = "";
            span.textContent = token.value;
            break;
    }
    span.textContent += " ";
    return span;
}
function indent(folder) {
    let indent = 0;
    let parent = folder.parentElement;
    while (parent && parent.classList.contains("folder")) {
        indent += 20;
        parent = parent.parentElement;
    }
    return indent;
}

function renderTree() {
    const openPaths = new Set(
        [...treeContainer.querySelectorAll(".folder.open")].map(folder => folder.dataset.path)
    );
    const focusedPath = folder_focused?.dataset.path ?? fs.resolvePath(fs.root);

    treeContainer.replaceChildren(treeTopBar, fs.resolveTree());

    treeContainer.querySelectorAll(".folder").forEach((folder) => {
        if (openPaths.has(folder.dataset.path) || folder.dataset.path === focusedPath) {
            folder.classList.add("open");
        }

        folder.querySelector(':scope > .folder-header').addEventListener('click', (event) => {
            event.stopPropagation();
            folder.classList.toggle("open");
            folder_focused = folder;
        });
    });

    folder_focused = [...treeContainer.querySelectorAll(".folder")].find(
        folder => folder.dataset.path === focusedPath
    ) ?? treeContainer.querySelector(".folder");
}

function cancelAddItem() {
    currentInput?.closest(".add-item")?.remove();
    currentInput = null;
    add_file_mode = addFile.False;
}

function startAddItem(mode) {
    if (!folder_focused || currentInput) {
        return;
    }

    const folderBody = folder_focused.querySelector(':scope > .folder-body');
    folder_focused.classList.add("open");

    const inputHolder = document.createElement("div");
    inputHolder.className = "add-item";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = mode === addFile.File ? "Enter file name" : "Enter folder name";
    input.className = "add-item-input";

    inputHolder.appendChild(input);
    folderBody.prepend(inputHolder);
    input.focus();

    add_file_mode = mode;
    currentInput = input;

    input.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            cancelAddItem();
            return;
        }

        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        const name = input.value.trim();
        if (!name) {
            cancelAddItem();
            return;
        }

        try {
            const parent = fs.resolvePath(folder_focused.dataset.path);
            if (mode === addFile.File) {
                new fs.TextFile(parent, name);
            } else {
                new fs.Directory(parent, name);
            }
        } catch (error) {
            input.select();
            return;
        }

        cancelAddItem();
        renderTree();
    });

    input.addEventListener("blur", () => {
        if (currentInput === input) {
            cancelAddItem();
        }
    });
}

renderTree();

RowSeparator.addEventListener('mousedown', () => { row_dragging = true; });
ColSeparator.addEventListener('mousedown', () => { col_dragging = true; });
document.addEventListener('mouseup', () => { row_dragging = false; col_dragging = false; });

document.addEventListener('mousemove', (event) => {
    if (!(row_dragging || col_dragging)) {
        return;
    }
    if (col_dragging) {
        const x = event.clientX;
        const width = Math.max(min_width, Math.min(x, window.innerWidth - min_width));
        layout.style.gridTemplateColumns = `${width}px 5px 1fr`;
        treeContainer.querySelectorAll(".folder").forEach((folder) => {
            folder.querySelector('.folder-header').style.width = `${width - indent(folder)}px`;
            folder.querySelector('.folder-body').style.width = `${width - indent(folder)}px`;
        });
        treeContainer.querySelectorAll(".file").forEach((file) => {
            file.style.width = `${width - indent(file)}px`;
            file.querySelector('.file-header').style.width = `${width - indent(file)}px`;
        });
        treeTopBar.style.width = `${width}px`;
    } else {
        const y = event.clientY;
        layout.style.gridTemplateRows = `${Math.max(min_height, Math.min(y, window.innerHeight - min_height))}px 5px 1fr`;
    }
})
document.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement) {
        return;
    }

    let key = event.key;
    if (key.length === 1) {
        command += key;
        if (focused === Panel.TERMINAL && key === "/") {
            event.preventDefault();
        }
    } else if (key === "Backspace") {
        command = command.slice(0, -1);
    } else {
        return;
    }
    commandElement.replaceChildren();
    let tokens = tokenise(command);
    for (const token of tokens) {
        commandElement.appendChild(renderToken(token));
    }
})

addFileBtn.addEventListener('click', () => {
    startAddItem(addFile.File);
});

addFolderBtn.addEventListener('click', () => {
    startAddItem(addFile.Folder);
});
