const socket = io('/') // Create our socket
const videoGrid = document.getElementById('video-grid') // Find the Video-Grid element

let myPeerId = null // The ID of the current user
const myPeer = new Peer() // Creating a peer element which represents the current user
const myVideo = document.createElement('video') // Create a new video tag to show our video
myVideo.muted = true // Mute ourselves on our end so there is no feedback loop

// When we first open the app, have us join a room
myPeer.on('open', peerId => {
    console.log(`myPeer.on.open -> peerId:${peerId}; ROOM_ID:${ROOM_ID};`)
    myPeerId = peerId
    myVideo.id = peerId
    myVideo.classList.add('my-video')
})

// Access the user's video and audio
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    console.log('navigator.mediaDevices.getUserMedia')
    addVideoStream(myVideo, stream) // Display our video to ourselves

    // When we join someone's room we will receive a call from them
    myPeer.on('call', call => {
        console.log(`myPeer.on.call -> call.peer: ${call.peer};`)
        console.dir(call)

        call.answer(stream) // Stream them our video/audio
        const video = document.createElement('video') // Create a video tag for them
        video.id = call.peer // Give the video tag the id of the person who is calling us

        call.on('stream', userVideoStream => { // When we recieve their stream
            console.log('call.on.stream')
            addVideoStream(video, userVideoStream) // Display their video to ourselves
        })
    })

    // If a new user connected
    socket.on('user-connected', peerId => {
        console.log(`socket.on.user-connected -> peerId: ${peerId};`)
        if (peerId) {
            connectToNewUser(peerId, stream)
        }
    })

    // Lister for when a user disconnects
    socket.on('user-disconnected', peerId => {
        console.log(`socket.on.user-disconnected -> peerId: ${peerId};`)
        let videoToRemove = document.getElementById(peerId)
        if (videoToRemove) {
            videoToRemove.remove()
        }
    })

    // Notify the server that I have joined the room
    socket.emit('join-room', ROOM_ID, myPeerId)
}).catch(err => {
    console.log('navigator.mediaDevices.getUserMedia.catch -> err: ', err)
})

function connectToNewUser(peerId, stream) { // This runs when someone joins our room
    console.log(`connectToNewUser -> peerId: ${peerId}; stream: ${stream};`)

    // Call the user who just joined
    const call = myPeer.call(peerId, stream)
    // Add their video
    const video = document.createElement('video')
    video.id = peerId

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


// Messaging functionality
const messagesForm = document.getElementById('messages-form');
const messagesInput = document.getElementById('messages-input');
const messagesOutput = document.getElementById('messages-output');

messagesForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messagesInput.value
    if (!message) return
    // socket.emit('message', message)
    const messageEl = document.createElement('p')
    messageEl.textContent = message
    messagesOutput.append(messageEl)
    messagesInput.value = ''
});

// messagesInput.addEventListener('keypress', (e) => {
//     // if press enter key
//     if (e.which === 13) {
//         messagesForm.dispatchEvent(new Event('submit', {cancelable: true}))
//     }
// });
