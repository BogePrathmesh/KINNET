import React, { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";


import styles from '../styles/VideoComponent.module.css';

import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import IconButton from "@mui/material/IconButton";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import Badge from "@mui/material/Badge";
import ChatIcon from '@mui/icons-material/Chat'






const server_url = "http://localhost:8000"; //this is server url

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" } //stun server are lightweight servers running on the public internet which return IP address of the requester's device

    ]
}

export default function VideoMeet() {

    var socektRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailble, setVideoAvailable] = useState(true);

    let [audioAvaiable, setautdioAvaible] = useState(true);

    let [video, setvideo] = useState();

    let [audio, setaudio] = useState();

    let [screen, setscreen] = useState();
    let [showmodal, setmodal] = useState(true);

    let [screenAvaiable, setscreenAvaiable] = useState();

    let [messages, setMessages] = useState([]);

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForusername, setAskForusername] = useState(true);

    let [username, setusername] = useState("");

    const videoref = useRef([]);

    let [videos, setvideos] = useState([]);

    // TODO
    // if(isChrome() === false){

    // }

    const getPermission = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });

            if (videoPermission) {
                setVideoAvailable(true);
            }
            else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });

            if (audioPermission) {
                setautdioAvaible(true);
            }
            else {
                setautdioAvaible(false);
            }

            //this for screen sharing
            if (navigator.mediaDevices.getDisplayMedia) {
                setscreenAvaiable(true);
            }
            else {
                setscreenAvaiable(false);
            }

            if (videoAvailble || audioAvaiable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailble, audio: audioAvaiable });


                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        getPermission();

    }, [])

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) {
            console.log(e);
        }

        window.localStream = stream;

        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socektRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))

                    })
                    .catch(e => console.log(e))
            })
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setvideo(false)
            setaudio(false)

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackslience = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackslience();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream)
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socektRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
                        }).catch(e => console.log(e));
                })
            }
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator();

        let dct = oscillator.connect(ctx.createMediaStreamDestination);
        oscillator.start();
        ctx.resume();
        return Object.assign(DOMStringList.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });

        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })

    }
    let getUserMedia = () => {
        if ((video && videoAvailble) || (audio && audioAvaiable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((err) => console.log(err))
        }
        else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch (err) {

            }
        }
    }
    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    })

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)
        if (fromId !== socektRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === "offer") {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketIdRef.current.emit("signal", JSON.stringify({ "sdp": connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    }

    let addmessage = (data,sender,socketIdSender) => {
        setMessages((prevMessages)=>[
            ...prevMessages,
            {sender:sender,data:data}
        ]);

        if(socketIdSender !== socketIdRef.current)
        {
            setNewMessages((prevMessages)=>prevMessages+1);
        }
    }

    let connectToSocketServer = () => {
        socektRef.current = io.connect(server_url, { secure: false });

        socektRef.current.on('signal', gotMessageFromServer)

        socektRef.current.on("connect", () => {
            socektRef.current.emit("join-call", window.location.href)

            socketIdRef.current = socektRef.current.id

            socektRef.current.on("chat-message", addmessage)

            socektRef.current.on("user-left", (id) => {
                setvideo((videos) => videos.filter((video) => video.socketId !== id))
            })

            socektRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate !== null) {
                            socektRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {

                        let videoExits = videoref.current.find(video => video.socketId === socketListId);

                        if (videoExits) {
                            setvideo(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                            })
                            videoref.current = updatedVideos;
                            return updatedVideos;
                        }
                        else {
                            let newvideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playsinline: true,
                            }
                            setvideo(video => {
                                const updatedVideos = [...video, newvideo];
                                videoref.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        let blackslience = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackslience();
                        connections[socketListId].addStream(window.localStream);
                    }
                })

                if (id === socektRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) {

                        }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socektRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })

    }
    let getMedia = () => {
        setvideo(videoAvailble);
        setaudio(audioAvaiable);
        connectToSocketServer();

    }

    let routeTo = useNavigate();

    let connect = () => {
        setAskForusername(false);
        getMedia();
    }

    let handleVideo = () => {
        setvideo(!video);
    }

    let handleAudio = () => {
        setaudio(!audio);
    }

    let sendMessage = () =>{
        socektRef.current.emit("chat-message",message,username);
        setMessage("");
    }

    let handleEndCall = () =>{
        try{
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop())
        }catch(e){}

        routeTo("/home")
    }

    let getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch {
            (e) => { console.log(e) }
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socektRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
                    })
                    .catch(e => console.log(e));
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setscreen(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackslience = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackslience();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();
        })
    }
    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e));
            }
        }
    }
    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setscreen(!screen);
    }
    return (
        <div>
            {askForusername === true ?
                <div>
                    <h2>Enter Into Lobby</h2>
                    <TextField id="outlined-basic" label="Username" value={username} onChange={(e) => setusername(e.target.value)} variant="outlined" />
                    <Button variant="contained" onClick={connect}>Connect</Button>

                    <div>
                        <video ref={localVideoRef} autoPlay muted></video>
                    </div>

                </div> :
                <div className={styles.meetVideoContainer}>

                    {showmodal ? <div className={styles.chatRoom}>
                        <div className={styles.chatContainer}>
                            <h1>Chat</h1>
                            <div className={styles.chattingdisplay}>

                                {messages.length > 0 ? messages.map((item,index)=>{
                                    return(
                                        <div style={{marginBlockStart:"20px"}}key={index}>
                                            <p style={{fontWeight:"bold"}}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )   
                                }):<p>No Messages Yet</p>}

                            </div>
                            <div className={styles.chattingArea}>
                                <TextField value={message} onChange={(e)=> setMessage(e.target.value)} id="outlined-basic" label="Ente Your Chat" variant="outlined" />
                                <Button variant="contained" onClick={sendMessage}>Send</Button>
                            </div>
                        </div>

                    </div> : <></>}


                    <div className={styles.buttoncontainer}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {video
                                ? <VideocamIcon sx={{ fontSize: "3.5rem" }} />
                                : <VideocamOffIcon sx={{ fontSize: "3.5rem" }} />
                            }
                        </IconButton>

                        <IconButton onClick={handleEndCall}style={{ color: "white" }}>
                            <CallEndIcon sx={{ fontSize: "3.5rem", color: "red" }} />
                        </IconButton>

                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio
                                ? <MicIcon sx={{ fontSize: "3.5rem" }} />
                                : <MicOffIcon sx={{ fontSize: "3.5rem" }} />
                            }
                        </IconButton>

                        {screenAvaiable === true ? <IconButton onClick={handleScreen} style={{ color: "white" }}>
                            {screen === true ? <ScreenShareIcon sx={{ fontSize: "3.5rem" }} /> : <StopScreenShareIcon sx={{ fontSize: "3.5rem" }} />}
                        </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color="secondary">
                            <IconButton onClick={() => setmodal(!showmodal)} style={{ color: "white" }}>
                                <ChatIcon sx={{ fontSize: "3.5rem" }} />
                            </IconButton>
                        </Badge>
                    </div>


                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video
                                    data-socket={video.socketId} ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }} autoPlay></video>
                            </div>
                        ))}
                    </div>
                </div>}
        </div>
    );
}
