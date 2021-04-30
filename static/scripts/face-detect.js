const video = document.getElementById('video');

var socket = io.connect('https://face-avatar.herokuapp.com');
socket.on( 'connect', function() {
  console.log("SOCKET CONNECTED")
})

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('https://face-avatar.herokuapp.com/static/models/'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://face-avatar.herokuapp.com/static/models/'),
    faceapi.nets.faceRecognitionNet.loadFromUri('https://face-avatar.herokuapp.com/static/models/'),
    faceapi.nets.faceExpressionNet.loadFromUri('https://face-avatar.herokuapp.com/static/models/')
])
  .then(startVideo)
  .catch(err => console.error(err));

function startVideo() {
  console.log("access");
  navigator.getUserMedia(
    {
      video: {}
    },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  // const imgUrl1 = 'https://face-avatar.herokuapp.com/static/images/Asude/1.jpg'
  // const img1 = await faceapi.fetchImage(imgUrl1)
  
  // const imgUrl2 = 'https://face-avatar.herokuapp.com/static/images/Asude/1.jpg'
  // const img2 = await faceapi.fetchImage(imgUrl2)

  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    let detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }))
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptors();
    // console.log(detections)
    socket.emit( 'my event', {
      data: detections
    })
    
    // fullFaceDescriptions
    detections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, detections);
    faceapi.draw.drawFaceLandmarks(canvas, detections);
    faceapi.draw.drawFaceExpressions(canvas, detections);
    
    // const labels = ['Asude']

    // const labeledFaceDescriptors = await Promise.all(
    //   labels.map(async label => {
    //       // fetch image data from urls and convert blob to HTMLImage element
    //       const imgUrl = `https://face-avatar.herokuapp.com/static/images/${label}/1.jpg`
    //       const img = await faceapi.fetchImage(imgUrl)
  
    //       // detect the face with the highest score in the image and compute it's landmarks and face descriptor
    //       const fullFaceDescription = await faceapi.
    //       detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }))
    //       .withFaceLandmarks()
    //       .withFaceDescriptor()
  
    //       if (!fullFaceDescription) {
    //       throw new Error(`no faces detected for ${label}`)
    //       }
  
    //       const faceDescriptors = [fullFaceDescription.descriptor]
    //       return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
    //   })
    // );
      
    // const maxDescriptorDistance = 0.6
    // const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)

    // const results = detections.map(fd => faceMatcher.findBestMatch(fd.descriptor))

    // results.forEach((bestMatch, i) => {
    //     const box = detections[i].detection.box
    //     const text = bestMatch.toString()
    //     const drawBox = new faceapi.draw.DrawBox(box, { label: text })
    //     drawBox.draw(canvas)
    // })

    // console.log(detections);
  }, 100)
})