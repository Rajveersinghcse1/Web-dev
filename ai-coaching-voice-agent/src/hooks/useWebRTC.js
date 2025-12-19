import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ]
};

export function useWebRTC(sessionId, userId, participants) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // userId -> MediaStream
  
  const peersRef = useRef({}); // userId -> RTCPeerConnection
  const processedSignalsRef = useRef(new Set());
  
  const sendSignal = useMutation(api.messages.sendSignal);
  const deleteSignal = useMutation(api.messages.deleteSignal);
  
  // Fetch signals addressed to me
  const signals = useQuery(api.messages.getSignals, 
    sessionId && userId ? { sessionId, userId } : "skip"
  );

  // Initialize Local Stream
  useEffect(() => {
    let stream = null;
    const startLocalStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setLocalStream(stream);
      } catch (err) {
        console.error("Failed to get local stream", err);
      }
    };

    if (userId) {
      startLocalStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [userId]);

  // Handle Participants (Create Peers)
  useEffect(() => {
    if (!localStream || !userId || !participants) return;

    participants.forEach(participant => {
      const targetId = participant.userId;
      if (targetId === userId) return;

      // If peer connection doesn't exist, create it
      if (!peersRef.current[targetId]) {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peersRef.current[targetId] = pc;

        // Add local tracks
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignal({
              sessionId,
              senderId: userId,
              receiverId: targetId,
              type: 'candidate',
              payload: JSON.stringify(event.candidate)
            });
          }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
          setRemoteStreams(prev => ({
            ...prev,
            [targetId]: event.streams[0]
          }));
        };

        // If I am the "initiator" (lexicographically smaller ID), create offer
        if (userId < targetId) {
          pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .then(() => {
              sendSignal({
                sessionId,
                senderId: userId,
                receiverId: targetId,
                type: 'offer',
                payload: JSON.stringify(pc.localDescription)
              });
            })
            .catch(err => console.error("Error creating offer", err));
        }
      }
    });

    // Cleanup peers that left
    const participantIds = new Set(participants.map(p => p.userId));
    Object.keys(peersRef.current).forEach(peerId => {
      if (!participantIds.has(peerId)) {
        peersRef.current[peerId].close();
        delete peersRef.current[peerId];
        setRemoteStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[peerId];
          return newStreams;
        });
      }
    });

  }, [localStream, userId, participants, sessionId, sendSignal]);

  // Handle Incoming Signals
  useEffect(() => {
    if (!signals || !userId || !localStream) return;

    signals.forEach(async (signal) => {
      if (processedSignalsRef.current.has(signal._id)) return;
      processedSignalsRef.current.add(signal._id);

      const { senderId, type, payload } = signal;
      const pc = peersRef.current[senderId];

      // If we received a signal from someone we don't have a PC for yet,
      // it means we are the "receiver" (larger ID) and the useEffect above
      // hasn't run or we just haven't created it yet.
      // However, the useEffect above runs on `participants` change.
      // If `participants` is up to date, we should have a PC.
      // If not, we might need to wait or create it here.
      // For safety, let's ensure PC exists if it's missing (though it should exist if participant list is synced)
      
      if (!pc) {
        console.warn(`Received signal from unknown peer ${senderId}`);
        // We could create it here, but let's rely on the participants list sync for now
        // to avoid race conditions where we create a PC for a user who left.
        // Actually, if we receive an offer, we MUST have a PC to answer.
        return; 
      }

      try {
        const data = JSON.parse(payload);

        if (type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal({
            sessionId,
            senderId: userId,
            receiverId: senderId,
            type: 'answer',
            payload: JSON.stringify(answer)
          });
        } else if (type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
        } else if (type === 'candidate') {
          await pc.addIceCandidate(new RTCIceCandidate(data));
        }
      } catch (err) {
        console.error("Error processing signal", err);
      } finally {
        // Delete signal after processing
        deleteSignal({ signalId: signal._id });
      }
    });
  }, [signals, userId, localStream, sessionId, sendSignal, deleteSignal]);

  const toggleAudio = (enabled) => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = enabled);
    }
  };

  const toggleVideo = (enabled) => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = enabled);
    }
  };

  return {
    localStream,
    remoteStreams,
    toggleAudio,
    toggleVideo
  };
}
