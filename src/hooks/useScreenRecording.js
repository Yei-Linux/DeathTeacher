import React, { Fragment, useEffect, useRef, useState, useContext } from "react";
import {
  getScreenStream,
  addStreamStopListener
} from "../helpers/recordScreenHelper";
import RecordRTC from "recordrtc";

import { uploadVideo } from "../services/botService";

const useScreenRecording = () => {
  var recorder;
  const mediaElementRef = useRef();
  const canvasElementRef = useRef();
  const [blobVideoState, setBlobVideo] = useState(null);

  useEffect(() => {
    mediaElementRef.current.style.display = "none";
    canvasElementRef.current.style.display = "none";
  }, []);

  const buildingCanvasFrame = (
    screenX,
    screenY,
    screenWidth,
    screenHeigth,
    canvasX,
    canvasY,
    canvasWidth,
    canvasHeigth
  ) => {
    canvasElementRef.current.width = 1500;
    canvasElementRef.current.height = 500;
    canvasElementRef.current
      .getContext("2d")
      .drawImage(
        mediaElementRef.current,
        screenX,
        screenY,
        screenWidth,
        screenHeigth,
        canvasX,
        canvasY,
        canvasWidth,
        canvasHeigth
      );
  };

  const handleStartRecording = (
    screenX,
    screenY,
    screenWidth,
    screenHeigth,
    canvasX,
    canvasY,
    canvasWidth,
    canvasHeigth
  ) => {
    getScreenStream(screen => {
      var inited = false;
      mediaElementRef.current.ontimeupdate = function(ev) {
        if (!inited) {
          mediaElementRef.current.srcObject = screen;
          mediaElementRef.current.screen = screen;
          inited = true;
        }
        buildingCanvasFrame(
          screenX,
          screenY,
          screenWidth,
          screenHeigth,
          canvasX,
          canvasY,
          canvasWidth,
          canvasHeigth
        );
      };
      mediaElementRef.current.ontimeupdate();

      addStreamStopListener(screen, () => {
        handleStopRecording(null);
      });

      recorder = RecordRTC(canvasElementRef.current.captureStream(), {
        type: "video"
      });
      recorder.startRecording();
    });
  };

  const handleStopRecording = async (request) => {
    recorder.stopRecording(async function() {
      let blob = recorder.getBlob();

      const formData = new FormData();
      formData.append("video", blob);
      formData.append("title",request['title'])
      formData.append("description",request['description'])
      formData.append("urlImage",request['urlImage'])
      formData.append("urlVideo",request['urlVideo'])
      formData.append("urlEvent",request['urlEvent'])
      formData.append("professor",request['professor'])
      formData.append("releaseDate",request['releaseDate'])
      formData.append("category",request['category'])

      let response = await uploadVideo(formData);

      setBlobVideo(blob);
      mediaElementRef.current.srcObject = null;
      mediaElementRef.current.src = URL.createObjectURL(blob);
      if (
        mediaElementRef.current.screen &&
        mediaElementRef.current.screen.getVideoTracks
      ) {
        mediaElementRef.current.screen.stop();
        mediaElementRef.current.screen = null;
      }
    });
  };

  const ScreenRecording = () => {
    return (
      <Fragment>
        <canvas
          ref={canvasElementRef}
          style={{ display: "none" }}
        ></canvas>
        <video
          style={{ display: "none" }}
          ref={mediaElementRef}
          autoPlay
          playsInline
        ></video>
      </Fragment>
    );
  };

  return {
    blobVideoState,
    ScreenRecording,
    handleStartRecording,
    handleStopRecording
  };
};

export default useScreenRecording;
