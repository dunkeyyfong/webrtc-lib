import { useEffect, useRef, useState } from 'react'

function App() {
  
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localPeerConnection = useRef<RTCPeerConnection | null>(null);
  const remotePeerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    async function setupRTC() {
      localPeerConnection.current = new RTCPeerConnection();
      remotePeerConnection.current = new RTCPeerConnection();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach(track => {
          localPeerConnection.current?.addTrack(track, stream);
        });

        localPeerConnection.current.onicecandidate = event => {
          if (event.candidate) {
            remotePeerConnection.current?.addIceCandidate(event.candidate);
          }
        }

        remotePeerConnection.current.onicecandidate = event => {
          if (event.candidate) {
            localPeerConnection.current?.addIceCandidate(event.candidate);
          }
        }

        remotePeerConnection.current.ontrack = event => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }

        const offer = await localPeerConnection.current.createOffer();
        await localPeerConnection.current.setLocalDescription(offer);
        await remotePeerConnection.current.setRemoteDescription(offer);

        const answer = await remotePeerConnection.current.createAnswer();
        await remotePeerConnection.current.setLocalDescription(answer);
        await localPeerConnection.current.setRemoteDescription(answer);
      } catch (error) {
        console.error(error);
      }
    }
    setupRTC();
  },[]);

  return (
    <>
      <h1>WebRTC Video Chat</h1>
      <video ref={localVideoRef} autoPlay playsInline style={{ width: '45%', marginRight: '5%' }} />
      <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '45%' }} />
    
    </>
  )
}

export default App
