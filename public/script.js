const socket = io('/') // Create our socket
const videoGrid = document.getElementById('video-grid') // Find the Video-Grid element

const myPeer = new Peer() // Creating a peer element which represents the current user
let myPeerId = null // The ID of the current user
const myVideo = document.createElement('video') // Create a new video tag to show our video
myVideo.muted = true // Mute ourselves on our end so there is no feedback loop

// When we first open the app, have us join a room
myPeer.on('open', id => {
    console.log(`myPeer.on.open -> id:${id}; ROOM_ID:${ROOM_ID};`) // 1
    myPeerId = id
    // socket.emit('join-room', ROOM_ID, id)
})

// Access the user's video and audio
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    console.log('navigator.mediaDevices.getUserMedia') // 2
    addVideoStream(myVideo, stream) // Display our video to ourselves

    // When we join someone's room we will receive a call from them
    myPeer.on('call', call => {
        console.log('myPeer.on.call')
        call.answer(stream) // Stream them our video/audio
        const video = document.createElement('video') // Create a video tag for them

        call.on('stream', userVideoStream => { // When we recieve their stream
            console.log('call.on.stream')
            addVideoStream(video, userVideoStream) // Display their video to ourselves
        })
    })

    // If a new user connect
    socket.on('user-connected', userId => {
        console.log(`socket.on.user-connected -> userId: ${userId};`) // 4
        connectToNewUser(userId, stream)
    })

    // Notify the server that I have joined the room
    socket.emit('join-room', ROOM_ID, myPeerId)
}).catch(err => {
    console.log('navigator.mediaDevices.getUserMedia.catch -> err: ', err)
})

function connectToNewUser(userId, stream) { // This runs when someone joins our room
    console.log(`connectToNewUser -> userId: ${userId}; stream: ${stream};`)

    // Call the user who just joined
    const call = myPeer.call(userId, stream)
    // Add their video
    const video = document.createElement('video')

    call.on('stream', userVideoStream => {
        console.log('call.on.stream')
        addVideoStream(video, userVideoStream)
    })

    // If they leave, remove their video
    call.on('close', () => {
        console.log('call.on.close')
        video.remove()
    })
}


function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => { // Play the video as it loads
        console.log('video.on.loadedmetadata') // 3
        video.play()
    })
    videoGrid.append(video) // Append video element to videoGrid
}
