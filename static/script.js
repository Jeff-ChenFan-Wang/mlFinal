const video = document.getElementById('video');
const canvas = document.getElementById('videoCanvas');
var ctx = canvas.getContext('2d');

var boxes = [
  {x:10,y:10,w:50,h:50,p:25.6}
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
  },150)
});

video.addEventListener("play",() => {
setInterval(async () => {
    requestBbox();
  },2000)
});

async function drawVideo(){ //every 150 ms
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

    ctx.font = "bold 18px serif";
    ctx.fillStyle = "#ff0000";
    ctx.fillText(
      bbox.p, 
      rectX+Math.floor(rectWidth*0.1),
      rectY+Math.floor(rectHeight*0.1)
    );
  })
}

async function requestBbox(){ //every 2 sec
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