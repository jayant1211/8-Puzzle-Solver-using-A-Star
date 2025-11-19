function printState(state) {
    let out = "";
    for (let i = 0; i < 9; i++) {
        out += (state[i] === 0 ? " " : state[i]) + " ";
        if ((i + 1) % 3 === 0) out += "\n";
    }
    console.log(out);
}

function arraysEqual(a, b) {
    for (let i = 0; i < 9; i++) if (a[i] !== b[i]) return false;
    return true;
}

function clone(arr) {
    return arr.slice();
}

//heuristic: Misplaced tiles 

function hMisplaced(state, goal) {
    let h = 0;
    for (let i = 0; i < 9; i++) {
        if (state[i] !== 0 && state[i] !== goal[i]) h++;
    }
    return h;
}

// manhattan heuristic - better
function hManhattan(state, goal) {
    let dist = 0;

    for (let i = 0; i < 9; i++) {
        const val = state[i];
        if (val === 0) continue; // skip blank

        // current row/col
        const r1 = Math.floor(i / 3);
        const c1 = i % 3;

        // goal index
        const goalIndex = goal.indexOf(val);
        const r2 = Math.floor(goalIndex / 3);
        const c2 = goalIndex % 3;

        dist += Math.abs(r1 - r2) + Math.abs(c1 - c2);
    }

    return dist;
}


// Generate neighbours
function getNeighbours(state) {
    const moves = [];
    const blank = state.indexOf(0);

    const row = Math.floor(blank / 3);
    const col = blank % 3;

    const dirs = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1]
    ];

    for (const [r, c] of dirs) {
        if (r < 0 || r > 2 || c < 0 || c > 2) continue;

        const idx = r * 3 + c;

        const newState = clone(state);
        newState[blank] = newState[idx];
        newState[idx] = 0;

        moves.push(newState);
    }

    return moves;
}

// A* Search
function solve(initial, goal, log_states) {
    const pq = [];
    const visited = new Set();

    function push(node) {
        pq.push(node);
        pq.sort((a, b) => a.f - b.f);
    }

    push({
        state: initial,
        g: 0,
        h: hManhattan(initial, goal),
        f: hManhattan(initial, goal),
        parent: null
    });

    while (pq.length > 0) {
        const current = pq.shift();
        const key = current.state.join(",");

        if (visited.has(key)) continue;
        visited.add(key);

        // Print every expanded state
        if(log_states){
            console.log("f =", current.f, " g =", current.g, " h =", current.h);
            printState(current.state);
        }

        if (arraysEqual(current.state, goal)) {
            return current;
        }

        for (const nbr of getNeighbours(current.state)) {
            const nkey = nbr.join(",");
            if (visited.has(nkey)) continue;

            const g = current.g + 1;
            const h = hManhattan(nbr, goal);
            const f = g + h;

            push({
                state: nbr,
                g,
                h,
                f,
                parent: current
            });
        }
    }

    return null;
}

// Reconstruct path 
function reconstructPath(node) {
    const path = [];
    while (node) {
        path.push(node.state);
        node = node.parent;
    }
    return path.reverse();
}

export { solve, reconstructPath };
