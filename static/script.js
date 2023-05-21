const video = document.getElementById('video');
const canvas = document.getElementById('videoCanvas');
var ctx = canvas.getContext('2d');

var boxes = [
  {x:10,y:10,w:25,h:25,p:'loading...'}
]; //placeholder to make sure canvas didn't die

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/static/'),
]).then(startVideo).then(addListeners)

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

function addListeners(){
  //Fast draw video 
  video.addEventListener("play", () => {
    setInterval(async () =>{
      drawVideo();    
    },100)
  });

  //Process face
  video.addEventListener("play",() => {
    const canvas2 = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas2)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas2, displaySize)

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(
        video, new faceapi.TinyFaceDetectorOptions()
      );
      if(detections[0]!=null){
        let bboxes = getBboxes(detections);
        uploadData(bboxes)
      }else{
        boxes = []
      }
    },2000)
  });
}

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
      rectX+Math.floor(rectWidth*0.2),
      rectY+Math.floor(rectHeight*0.2)
    );
  })
}

function getBboxes(detections){
  let bboxes = detections.map(det_result => {
    var bbox = det_result._box
    return {
      x: bbox._x,
      y: bbox._y,
      w: bbox._width,
      h: bbox._height
    };
  })
  return bboxes
}

async function uploadData(bboxes){ //every 2 sec
  const dataURL = canvas.toDataURL('image/png');
  fetch('/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image: dataURL, boxes: bboxes})
  })
  .then(response => response.json())
  .then(data => {
    boxes = data.boxes
  })
  .catch(error => {
    console.error(error);
  });
}