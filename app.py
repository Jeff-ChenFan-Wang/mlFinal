from flask import Flask,render_template, request, jsonify
import PIL, io
import cv2
from base64 import b64decode, b64encode
import numpy as np
import sys
from keras_vggface.vggface import VGGFace

app = Flask(__name__)

face_cascade = cv2.CascadeClassifier('static/haarcascade_frontalface_default.xml')
vggFeatures = VGGFace(
    model='resnet50', include_top=False, 
    input_shape=(224, 224, 3), 
    pooling='avg')

@app.route("/")
def hellow_world():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def requestPredictions():
    # Get the data URL from the request body
    data = request.json
    img = js_to_image(data['image'])
    faces = face_cascade.detectMultiScale(img, minNeighbors=2)
    outLs = []
    for (x,y,w,h) in faces:
        outLs.append(
            {'x':int(x),'y':int(y),'w':int(w),'h':int(h)}
        )
    print(outLs,file=sys.stderr)
    return jsonify({'boxes':outLs})
    


def js_to_image(js_reply):
  """
  Params:
          js_reply: JavaScript object containing image from webcam
  Returns:
          img: OpenCV BGR image
  """
  image_bytes = b64decode(js_reply.split(',')[1])
  jpg_as_np = np.frombuffer(image_bytes, dtype=np.uint8)
  img = cv2.imdecode(jpg_as_np, flags=1)

  return img

if __name__ == '__main__':
    app.run()