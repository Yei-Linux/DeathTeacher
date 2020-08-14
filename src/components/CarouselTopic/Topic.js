import React, {
  useState,
  useEffect,
  Fragment,
  useContext,
  useRef
} from "react";
import ReactDOM from "react-dom";
import Slider from "react-slick";
import { speechTextSlider } from "../../helpers/speechHelper";
import { separateSlider } from "../../helpers/sliderHelper";
import Stream from "../Stream/Stream";
import messageBotContext from "../../context/messageBot/messageBotContext";
import profesorContext from "../../context/professor/profesorContext";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./TopicStyle.scss";

const Topic = ({ topic, handleStartRecordingEvent, handleStopRecording,categorySelected }) => {
  var slider;
  const classContainer = useRef();
  const [carouselSubTopics, setSubTopics] = useState([]);
  const [beginClass, setBeginClass] = useState("aboveOfSliders");
  const { finishClass , setFinishClass, classText } = useContext(messageBotContext);
  const { professor } = useContext(profesorContext);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  useEffect(() => {
    if (classText !== null) {
      buildingCarousel(classText);
    }
  }, [classText]);

  useEffect(() => {
    !finishClass && handleSliders();
  }, [beginClass]);

  function next() {
    slider.slickNext();
  }

  function previous() {
    slider.slickPrev();
  }

  function handleSpeech() {
    handleStartRecordingEvent(
      classContainer.current.getBoundingClientRect().x,
      classContainer.current.getBoundingClientRect().y + 70,
      classContainer.current.getBoundingClientRect().width,
      classContainer.current.getBoundingClientRect().height,
      0,
      0,
      1500,
      500
    );
    setBeginClass("belowOfSliders");
  }

  const handleBuildingRequest = () => {
    return {title:topic,description:topic,category:categorySelected,professor:professor['_id'],urlImage: '',urlVideo:'',urlEvent:'',releaseDate:''};
  }

  const buildingCarousel = text => {
    let subTopics = [];
    let topicJson = text;
    Object.keys(topicJson).map(slider => {
      let tempArray = separateSlider(topicJson[slider]);
      tempArray.length > 0
        ? tempArray.map(text => {
            subTopics.push({ title: slider, content: text });
          })
        : subTopics.push({ title: slider, content: topicJson[slider] });
    });
    setSubTopics(subTopics);
  };

  const handleSliders = async () => {
    let c = 0;
    for (let subtopic of carouselSubTopics) {
      await speechTextSlider(subtopic.content);
      window.speechSynthesis.cancel();
      next();
      if (carouselSubTopics.length === c + 1) {
        setFinishClass(true);
      }
      c++;
    }
  };

  const handlerPauseClass = () => {
    window.speechSynthesis.pause();
  };
  const handlerContinuoClass = () => {
    window.speechSynthesis.resume();
  };

  const handlerFinishClass = () => {
    window.speechSynthesis.pause();
    handleStopRecording(handleBuildingRequest());
    setFinishClass(true);
  };

  return (
    <Fragment>
      <div ref={classContainer}>
        <h3 className="topicTitle">La clase de hoy es sobre : {topic}</h3>
        {classText !== null && (
          <div className="box-slider" id="classContainer">
            <Fragment>
              <div className="leftContainer">
                <Slider ref={c => (slider = c)} {...settings}>
                  {carouselSubTopics &&
                    carouselSubTopics.map(slider => (
                      <div className="subTopic">
                        <h3 className="subTopicTitle">{slider.title}</h3>
                        <p className="sutbopicContent">{slider.content}</p>
                      </div>
                    ))}
                </Slider>
                <div className="boxClass">
                  <button
                    className="beginClassButton boxButton"
                    onClick={handlerContinuoClass}
                  >
                    Continuar con la Clase
                  </button>
                  <button
                    className="beginClassButton boxButton"
                    onClick={handlerPauseClass}
                  >
                    Pausar Clase
                  </button>
                  <button
                    className="beginClassButton"
                    onClick={handlerFinishClass}
                  >
                    Terminar Clase
                  </button>
                </div>
              </div>
              <div className="rigthContainer">
                <Stream />
              </div>
            </Fragment>
          </div>
        )}
      </div>

      <div className={`customSlider box-slider ${beginClass}`}>
        <button className="beginClassButton" onClick={handleSpeech}>
          Empezar clase
        </button>
      </div>
    </Fragment>
  );
};

export default Topic;
