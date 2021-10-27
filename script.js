(function() {
  const canvasWidth = 600
  const canvasHeight = 600
  const canvasAspectRatio = canvasWidth / canvasHeight
  const boundingBoxLabelHeight = 22

  let isSharingScreen = false

  let video = null
  let canvas = null
  let context = null
  let boundingBoxesDiv = null
  let noVideoIconDiv = null
  let startButtonDiv = null
  let stopButtonDiv = null

  function removeAllChildNodes(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild)
    }
  }

  function getBoundingBoxes(imgData) {
    // TODO: Insert model code here to convert imgData into bounding boxes.

    // Some dummy data.
    return [
      {label: 'Label 1', x: 200, y: 200, width: 50, height: 50},
      {label: 'Label 2', x: 300, y: 300, width: 100, height: 100},
    ]
  }

  function drawBoundingBoxes(boundingBoxes, videoToCanvasScale, offsetX, offsetY) {
    removeAllChildNodes(boundingBoxesDiv)

    const canvasToVideoDivScale = 1 / videoToCanvasScale * video.offsetWidth / video.videoWidth

    for (const boundingBox of boundingBoxes) {
      const left = video.offsetLeft + (boundingBox.x - offsetX) * canvasToVideoDivScale
      const top = video.offsetTop  + (boundingBox.y - offsetY) * canvasToVideoDivScale
      const width = boundingBox.width * canvasToVideoDivScale
      const height = boundingBox.height * canvasToVideoDivScale

      const boundingBoxDiv = document.createElement('div')
      boundingBoxDiv.classList.add('bounding-box')
      if (top < boundingBoxLabelHeight) {
        boundingBoxDiv.classList.add('bounding-box-bottom-label')
      }
      boundingBoxDiv.style.top = top + 'px'
      boundingBoxDiv.style.left = left + 'px'
      boundingBoxDiv.style.width = width + 'px'
      boundingBoxDiv.style.height = height + 'px'

      const boundingBoxLabelDiv = document.createElement('div')
      boundingBoxLabelDiv.classList.add('bounding-box-label')
      boundingBoxLabelDiv.innerText = boundingBox.label
      boundingBoxDiv.appendChild(boundingBoxLabelDiv)

      boundingBoxesDiv.appendChild(boundingBoxDiv)
    }
  }

  async function processFrame() {
    if (!isSharingScreen) return

    let videoAspectRatio = video.videoWidth / video.videoHeight
    let videoToCanvasScale = videoAspectRatio >= canvasAspectRatio ?
      canvasWidth / video.videoWidth :
      canvasHeight / video.videoHeight

    const scaledWidth = video.videoWidth * videoToCanvasScale
    const scaledHeight = video.videoHeight * videoToCanvasScale
    const offsetX = (canvasWidth - scaledWidth) / 2
    const offsetY = (canvasHeight - scaledHeight) / 2

    context.clearRect(0, 0, canvasWidth, canvasHeight)
    context.drawImage(video, offsetX, offsetY, scaledWidth, scaledHeight)
    const imgData = context.getImageData(0, 0, canvasWidth, canvasHeight)

    const boundingBoxes = getBoundingBoxes(imgData)
    drawBoundingBoxes(boundingBoxes, videoToCanvasScale, offsetX, offsetY)

     window.setTimeout(processFrame, 1000)
  }

  function setIsSharingScreenState(newState) {
    isSharingScreen = newState
    if (!isSharingScreen) {
      video.srcObject = null
      removeAllChildNodes(boundingBoxesDiv)
    }

    noVideoIconDiv.style.display = isSharingScreen ? 'none' : 'block'
    video.style.display = isSharingScreen ? 'block' : 'none'
    startButtonDiv.style.display = isSharingScreen ? 'none' : 'flex'
    stopButtonDiv.style.display = isSharingScreen ? 'flex' : 'none'
  }

  async function onStartButtonClick() {
    try {
      video.srcObject = await navigator.mediaDevices.getDisplayMedia({video: true})
      video.srcObject.getVideoTracks()[0].onended = () => setIsSharingScreenState(false)
      setIsSharingScreenState(true)
    } catch(error) {
      console.log('An error occurred while trying to start the screen share:', error)
    }
  }

  function onStopButtonClick() {
    video.srcObject.getVideoTracks()[0].stop()
    setIsSharingScreenState(false)
  }

  function onLoad() {
    video = document.getElementById('video')
    canvas = document.getElementById('canvas')
    context = canvas.getContext('2d')
    boundingBoxesDiv = document.getElementById('bounding-boxes')
    noVideoIconDiv = document.getElementById('no-video-icon')
    startButtonDiv = document.getElementById('start-button')
    stopButtonDiv = document.getElementById('stop-button')

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    video.addEventListener('canplay', processFrame)
    startButtonDiv.addEventListener('click', onStartButtonClick)
    stopButtonDiv.addEventListener('click', onStopButtonClick)
  }

  window.addEventListener('load', onLoad)
})()