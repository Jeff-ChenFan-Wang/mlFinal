const video = document.getElementById('video');
const canvas = document.getElementById('videoCanvas');
var ctx = canvas.getContext('2d');

var boxes = [
  {x:10,y:10,w:50,h:50}
];

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch( err => console.error(err))
}

startVideo()

video.addEventListener("play", () => {
  setInterval(async () =>{
    drawVideo();    
  },100)
});

video.addEventListener("play",() => {
setInterval(async () => {
    requestBbox();
  },1000)
});

async function drawVideo(){
  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(video,0,0, width,height);
  boxes.forEach(bbox =>{
    var rectX = bbox.x;
    var rectY = bbox.y; 
    var rectWidth = bbox.w;
    var rectHeight = bbox.h;
    ctx.beginPath();
    ctx.lineWidth = '2';
    ctx.strokeStyle = 'red';
    ctx.rect(rectX, rectY, rectWidth, rectHeight);
    ctx.stroke();
  })
}

async function requestBbox(){
  const dataURL = canvas.toDataURL('image/png');
  var requestedData;
  fetch('/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image: dataURL })
  })
  .then(response => response.json())
  .then(data => {
    boxes = data.boxes
  })
  .catch(error => {
    console.error(error);
  });
}






