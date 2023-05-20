const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('video')

// Promise.all([
//   faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
//   faceapi.nets.faceLandmark68Net.loadFromUri('/static/models'),
//   faceapi.nets.faceRecognitionNet.loadFromUri('/static/models'),
//   faceapi.nets.faceExpressionNet.loadFromUri('/static/models'),
// ]).then(startVideo)

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => video.srcObject = stream)
  .catch( err => console.error(err))
}

startVideo()

video.addEventListener("play", () => {
  setInterval(async () =>{
    ctx.drawImage(video,0,0, canvas.width,canvas.height);
  },1000)
});

// video.addEventListener('play', () => {
//   const videoCanvas = document.getElementById("videoCanvas");
//   var ctx = videoCanvas.getContext('2d')
//   videoCanvas.width = video.width
//   videoCanvas.height = video.height
//   console.log(videoCanvas.width)
//   setInterval(async () => {
//       ctx.drawImage(video, 0, 0, canvas.width,canvas.height)
//     // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
//     // canvas.getContext('2d').rect(0,0,100,120)
//   }, 100)
// })





