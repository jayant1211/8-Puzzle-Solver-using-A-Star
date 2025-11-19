const img_placeholder = document.querySelector('.img-section');
const imageInput = document.getElementById('imageInput');
const preImage = document.querySelectorAll('.pre-state');
const postImage = document.querySelector('.post-state');
const preCanvas = document.querySelector('#previewCanvas');
const jumble = document.querySelector('#jumble');

let originalTiles = null;  
let intial_state = null;
const goal_state = [["1","2","3"],
                    ["4","5","6"],
                    ["7","8","_"]];

img_placeholder.addEventListener('click', () => {
    imageInput.click();
});

import { solveAStar } from "./a_star.js";

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    preImage.forEach(x => x.classList.add('hidden'));
    preCanvas.classList.remove('hidden');

    const imgEl = new Image();
    imgEl.src = url;

    imgEl.onload = async () => {
        const tryShowOnCanvas = () => {
            if (typeof cv === 'undefined') {
                setTimeout(tryShowOnCanvas, 100);
                return;
            }

            try {
                const srcMat = cv.imread(imgEl);
                const TARGET = 399;
                const dsize = new cv.Size(TARGET, TARGET);

                const dstMat = new cv.Mat();
                cv.resize(srcMat, dstMat, dsize, 0, 0, cv.INTER_AREA);

                preCanvas.width = TARGET;
                preCanvas.height = TARGET;
                cv.imshow('previewCanvas', dstMat);

                srcMat.delete();
                dstMat.delete();
            } catch (err) {
                console.error('Error processing image with OpenCV:', err);
            }
        };

        jumble.classList.remove('disabled');
        tryShowOnCanvas();
        originalTiles = null; // reset for new image load
    };
});

function splitImageIntoTiles() {
    const src = cv.imread(preCanvas);

    const TILE = 3;
    const tileW = preCanvas.width / TILE;
    const tileH = preCanvas.height / TILE;

    const tileCanvases = Array.from(document.querySelectorAll(".post-state canvas"));

    if (!originalTiles) {
        originalTiles = [];
        for (let r = 0; r < TILE; r++) {
            for (let c = 0; c < TILE; c++) {
                const rect = new cv.Rect(c * tileW, r * tileH, tileW, tileH);
                let roi = src.roi(rect);

                // draw text on tile
                cv.putText(
                    roi,
                    `${r * TILE + c + 1}`,               
                    new cv.Point(20, 40),            
                    cv.FONT_HERSHEY_SIMPLEX,
                    1,
                    new cv.Scalar(0, 255, 0, 255),     
                    2
                );
                const tile = src.roi(rect).clone();
                originalTiles.push(tile);
            }
        }
    }

    //remove last tile; push blank
    originalTiles.splice(8,1);
    let blank = new cv.Mat(tileH, tileW, cv.CV_8UC3, new cv.Scalar(255,255,255,255));
    originalTiles.push(blank);

    let shuffle = [0,1,2,3,4,5,6,7,8].sort(() => Math.random() - 0.5);
    const temp_tiles = originalTiles.slice();

    let temp_intial_state = []

    tileCanvases.forEach((canvas, i) => {
        canvas.width = tileW;
        canvas.height = tileH;
        cv.imshow(canvas, temp_tiles[shuffle[i]]);
        temp_intial_state.push(shuffle[i]);
    });

    intial_state = [];
    for(let i=0;i<3;i++){
        let temp = [];
        for(let j=0;j<3;j++){
            let s = String(temp_intial_state[`${3*i + j}`] + 1);
            s = s=="9"?"_":s;
            temp.push(s);
        }
        intial_state.push(temp);
    }

    console.log(intial_state);
    
    src.delete();
}

jumble.addEventListener("click", () => {
    if (jumble.classList.contains('disabled')) return;

    preCanvas.classList.add("hidden");
    postImage.classList.remove("hidden");
    postImage.classList.add("grid");

    void postImage.offsetHeight;

    splitImageIntoTiles();
    solveAStar(intial_state,goal_state);
});

function onOpenCvReady() {
    console.log('cv loaded');
}
