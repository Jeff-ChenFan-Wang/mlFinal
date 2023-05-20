from flask import Flask,render_template, request, jsonify
import pickle, cv2
from base64 import b64decode
import numpy as np
from keras_vggface.vggface import VGGFace 
from tensorflow import image as tfImage

app = Flask(__name__)

face_cascade = cv2.CascadeClassifier('static/haarcascade_frontalface_default.xml')
vggFeatures = VGGFace(
    model='resnet50', include_top=False, 
    input_shape=(224, 224, 3), 
    pooling='avg')
ridgeReg = pickle.load(open('static/ridgeReg.pkl', 'rb'))

@app.route("/")
@app.route("/about")
def visitHome():
    return render_template('index.html')

@app.route("/live")
def liveDemo():
    return render_template('liveDemo.html')

@app.route('/upload', methods=['POST'])
def requestPredictions():
    # Get the data URL from the request body
    data = request.json
    img = js2Img(data['image'])
    
    faces = face_cascade.detectMultiScale(img, minNeighbors=2)
    if len(faces)>0:
        faceCutouts = extractFaces(faces,img)
        bmiPreds = ridgeReg.predict(
            vggFeatures.predict(
                np.vstack(faceCutouts)
            )  
        ).tolist()      
        
        bboxOutLs = packageBbox(faces,bmiPreds)
        return jsonify({'boxes':bboxOutLs})
    else:
        return jsonify({'boxes':[]})
    

def js2Img(js_reply):
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

def packageBbox(cascadeResults, bmiPreds):
    bboxOutLs = []
    for i in range(len(cascadeResults)):
        x,y,w,h = cascadeResults[i]
        pred = bmiPreds[i]
        
        bboxOutLs.append({
            'x':int(x),
            'y':int(y),
            'w':int(w),
            'h':int(h),
            'p':round(pred,2)
        })
    return bboxOutLs

def extractFaces(results,origImg):
    """create cutouts using bboxes, expanding bbox
    slightly to get more of the face. Also pads and reshapes
    to 224x224x3 for vggface.

    Parameters
    ----------
    results : list
        list of bounding boxes
    origImg : whatever tf cv2 returns
        original PIL image read by cv2

    Returns
    -------
    List(np.ndarray)
        list of extracted faces in the form of np arrays
        ready for VGGface to grab features on
        
    """
    outLs = []
    for res in results:
        x1,y1,width,height = res
        xDelta = int(width*0.15)
        yDelta = int(height*0.25)
        x1 = max(1,x1-xDelta)
        y1 = max(1,y1-yDelta)
        
        width = min(origImg.shape[1],width+2*xDelta)
        height = min(origImg.shape[0],height+2*yDelta)

        outLs.append(
            np.expand_dims(np.array(
                tfImage.resize_with_pad(
                    origImg[
                        y1:y1+height,
                        x1:x1+width,
                        :
                    ],
                    224,224,method='nearest'
                )
            ),axis=0)
        )
    return outLs

if __name__ == '__main__':
    app.run(debug=False)