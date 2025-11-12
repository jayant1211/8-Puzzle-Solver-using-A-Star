const img_placeholder = document.querySelector('.imgholder')
const imageInput = document.getElementById('imageInput');
const preImage = document.querySelectorAll('.pre-img');

img_placeholder.addEventListener('click', ()=>{
    imageInput.click();
})

imageInput.addEventListener('change',(e)=>{
    // console.log(e.target.files);
    const img = e.target.files[0];

    if(img){
        const img_url = URL.createObjectURL(img);
        img_placeholder.style.background = `url(${img_url})`;
        img_placeholder.style.backgroundSize = 'cover';
        img_placeholder.style.backgroundPosition = 'center';
        preImage.forEach(e => {
            e.classList.add('hidden');
        });
    }
})