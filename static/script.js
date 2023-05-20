const video = document.getElementById('video');
const canvas = document.getElementById('videoCanvas');
var ctx = canvas.getContext('2d');

// Promise.all([
//   faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
//   faceapi.nets.faceLandmark68Net.loadFromUri('/static/models'),
//   faceapi.nets.faceRecognitionNet.loadFromUri('/static/models'),
//   faceapi.nets.faceExpressionNet.loadFromUri('/static/models'),
// ]).then(startVideo)

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
  },250)
});

async function drawVideo(){
  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(video,0,0, width,height);

  const rectX = width / 4; // X-coordinate of the top-left corner of the rectangle
  const rectY = height / 4; // Y-coordinate of the top-left corner of the rectangle
  const rectWidth = width / 2; // Width of the rectangle
  const rectHeight = height / 2; // Height of the rectangle

  ctx.beginPath();
  ctx.lineWidth = '2';
  ctx.strokeStyle = 'red';
  ctx.rect(rectX, rectY, rectWidth, rectHeight);
  ctx.stroke();
}






