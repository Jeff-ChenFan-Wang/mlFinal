const video = document.getElementById('video')
const canvas = document.getElementById('videoCanvas');
var ctx = canvas.getContext('2d');


function startVideo() {
  navigator.mediaDevices.getUserMedia({ 
    video: {
      mandatory: {
        maxHeight: 240,
        maxWidth: 427
      }
    }, audio: false 
  })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch( err => console.error(err))
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
]).then(startVideo)

async function drawVideo(results){ //every 150 ms
  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(video,0,0, width,height);
  results.forEach(result =>{
    var bbox = result._box
    var rectX = bbox._x;
    var rectY = bbox._y; 
    var rectWidth = bbox._width;
    var rectHeight = bbox._height;
    ctx.beginPath();
    ctx.lineWidth = '2';
    ctx.strokeStyle = 'red';
    ctx.rect(rectX, rectY, rectWidth, rectHeight);
    ctx.stroke();

    // ctx.font = "bold 18px serif";
    // ctx.fillStyle = "#ff0000";
    // ctx.fillText(
    //   bbox.p-2, 
    //   rectX+Math.floor(rectWidth*0.2),
    //   rectY+Math.floor(rectHeight*0.2)
    // );
  })
}

video.addEventListener('play', () => {
  const canvas2 = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas2)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas2, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    // const resizedDetections = faceapi.resizeResults(detections, displaySize)
    // canvas2.getContext('2d').clearRect(0, 0, canvas2.width, canvas2.height)
    if(detections[0]!=null){
      drawVideo(detections);
      console.log(detections)
      // console.log(tstBox._x,tstBox._y,tstBox._height,tstBox._width)
    }
  }, 1000)
})

