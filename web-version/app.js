const img_placeholder = document.querySelector('.img-section')
const imageInput = document.getElementById('imageInput');
const preImage = document.querySelectorAll('.pre-state');
const postImage = document.querySelector('.post-state');
const preCanvas = document.querySelector('#previewCanvas');

img_placeholder.addEventListener('click', ()=>{
    imageInput.click();
})

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    // img_placeholder.style.background = `url(${url}) center/cover no-repeat`;
    preImage.forEach(x => x.classList.add('hidden'));
    preCanvas.classList.remove('hidden');

    const imgEl = new Image();
    imgEl.src = url;

    imgEl.onload = async () => {
        // postImage.style.display = 'block';
        const tryShowOnCanvas = () => {
            if (typeof cv === 'undefined') {
                console.log('OpenCV not ready');
                setTimeout(tryShowOnCanvas, 100);
                return;
            }

            try {
                const srcMat = cv.imread(imgEl);
                const TARGET = 400;
                const dsize = new cv.Size(TARGET, TARGET);

                const dstMat = new cv.Mat();
                cv.resize(srcMat, dstMat, dsize, 0, 0, cv.INTER_AREA);

                previewCanvas.width  = TARGET;
                previewCanvas.height = TARGET;
                cv.imshow('previewCanvas', dstMat);

                srcMat.delete();
                dstMat.delete();
            } catch (err) {
                console.error('Error processing image with OpenCV:', err);
            }
        };

        tryShowOnCanvas();
    };
});


//TODO: jumbling has issue on first click, tiles are out of box, issue with grid, 3rd onwards works
//TODO: clearing previous state

function splitImageIntoTiles() {
    const src = cv.imread(previewCanvas);

    const TILE = 3;
    const tileW = 133;
    const tileH = 133;

    const tileCanvases = document.querySelectorAll(".post-state canvas");
    console.log(tileCanvases);

    let canvas_arr = [0,1,2,3,4,5,6,7,8];

    for (let r = 0; r < TILE; r++) {
        for (let c = 0; c < TILE; c++) {
            let idx = (Math.random()*(canvas_arr.length) | 0)
            const tile = tileCanvases[idx];
            canvas_arr.splice(idx,1);
            console.log(idx);
            console.log(canvas_arr);
            tile.width  = tileW;
            tile.height = tileH;


            let tmp = new cv.Mat();
            let rect = new cv.Rect(c * tileW, r * tileH, tileW, tileH);
            tmp = src.roi(rect);

            cv.imshow(tile, tmp);
            tmp.delete();
        }
    }

    src.delete();
}


document.getElementById("jumble").addEventListener("click", () => {
    previewCanvas.classList.add("hidden");
    postImage.classList.remove("hidden");
    postImage.classList.add("grid");

    void postImage.offsetHeight;

    splitImageIntoTiles();
});

function onOpenCvReady() {
    console.log('cv loaded');
}