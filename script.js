class Node {
    constructor(x, y, walkable = true) {
        this.x = x;
        this.y = y;
        this.walkable = walkable;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.parent = null;
    }
}

class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.nodes = this.createGrid(width, height);
    }

    createGrid(width, height) {
        const nodes = [];
        for (let x = 0; x < width; x++) {
            nodes[x] = [];
            for (let y = 0; y < height; y++) {
                nodes[x][y] = new Node(x, y);
            }
        }
        return nodes;
    }

    getNode(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.nodes[x][y];
        }
        return null;
    }

    getNeighbors(node) {
        const neighbors = [];
        const { x, y } = node;
        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, 
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];
        for (const direction of directions) {
            const neighbor = this.getNode(x + direction.dx, y + direction.dy);
            if (neighbor && neighbor.walkable) {
                neighbors.push(neighbor);
            }
        }
        return neighbors;
    }
}

function aStar(grid, startNode, endNode) {
    const openList = [];
    const closedList = new Set();
    openList.push(startNode);

    while (openList.length > 0) {
        openList.sort((a, b) => a.f - b.f);
        const currentNode = openList.shift();
        if (currentNode === endNode) {
            const path = [];
            let temp = currentNode;
            while (temp) {
                path.push(temp);
                temp = temp.parent;
            }
            return path.reverse();
        }
        closedList.add(currentNode);

        for (const neighbor of grid.getNeighbors(currentNode)) {
            if (closedList.has(neighbor)) continue;
            const tentativeG = currentNode.g + 1;
            if (!openList.includes(neighbor) || tentativeG < neighbor.g) {
                neighbor.g = tentativeG;
                neighbor.h = heuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = currentNode;
                if (!openList.includes(neighbor)) {
                    openList.push(neighbor);
                }
            }
        }
    }
    return [];
}

function heuristic(nodeA, nodeB) {
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
}

document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('grid');
    const grid = new Grid(10, 10);
    let startNode = grid.getNode(0, 0);
    let endNode = grid.getNode(9, 9);
    startNode.walkable = true;
    endNode.walkable = true;

    const createGridElement = () => {
        gridElement.innerHTML = '';
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                const node = grid.getNode(x, y);
                if (node === startNode) cell.classList.add('start');
                if (node === endNode) cell.classList.add('end');
                cell.addEventListener('click', () => {
                    node.walkable = !node.walkable;
                    cell.classList.toggle('wall');
                });
                gridElement.appendChild(cell);
            }
        }
    };

    createGridElement();

    document.getElementById('startButton').addEventListener('click', () => {
        const path = aStar(grid, startNode, endNode);
        for (const node of path) {
            const cell = gridElement.children[node.y * 10 + node.x];
            if (node !== startNode && node !== endNode) {
                cell.classList.add('path');
            }
        }
    });
});
