document.addEventListener('DOMContentLoaded', () => { 
  const startCallBtn = document.querySelector('#start-call')
  const endCallBtn = document.querySelector('#end-call')
  const remoteVideoSelector = "#remote-video"
  const remoteVideoElm = document.querySelector(remoteVideoSelector)
  const localVideoElm = document.querySelector("#local-video")
  const menuElm = document.querySelector("#menu")
  const liveElm = document.querySelector("#live")

  const peer = new Peer();
  let currentCall;
  peer.on("open", (id) => {
    document.getElementById("userId").textContent = id;
  });

  peer.on("call", (call) => {
    if (confirm(`Accept call from ${call.peer}?`)) {
      // grab the camera and mic
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true
        })
        .then((stream) => {
          // play the local preview
          localVideoElm.srcObject = stream;
          localVideoElm.play();
          // answer the call
          call.answer(stream);
          // save the close function
          currentCall = call;
          // change to the video view
          menuElm.style.display = "none";
          liveElm.style.display = "block";
          call.on("stream", (remoteStream) => {
            console.log("receive the remote stream and play it");
            remoteVideoElm.srcObject = remoteStream;
            remoteVideoElm.play();
          });
        })
        .catch((err) => {
          console.error("Failed to get local stream:", err);
        });
    } else {
      console.log("user rejected the call, close it");
      call.close();
    }
  });

  async function callUser() {
    // get user id
    const peerId = document.querySelector("input").value;
    // get the camera and mic permission
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // switch to the video call and play the camera preview
    menuElm.style.display = "none";
    liveElm.style.display = "block";
    localVideoElm.srcObject = localStream;
    localVideoElm.play();
    // make the call
    const call = peer.call(peerId, localStream);

    call.on("stream", (stream) => {
      remoteVideoElm.srcObject = stream;
      remoteVideoElm.play();
    });

    call.on("data", (stream) => {
      remoteVideoElm.srcObject = stream;
    });

    call.on("error", (err) => {
      console.error(err);
      endCall()
    });

    call.on('close', endCall)

    // save the close function
    currentCall = call;
  }

  function endCall() {
    menuElm.style.display = "block";
    liveElm.style.display = "none";
    if (!currentCall) return;
    try {
      currentCall.localStream.getTracks().forEach(t => t.stop())
      currentCall.close();
    } catch {}
    currentCall = undefined;
  }

  startCallBtn.addEventListener('click', callUser)
  endCallBtn.addEventListener('click', endCall)
})
