import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class PomodoroClock extends React.Component{
    constructor(props){
        super(props);
        this.state={
            currentName:'Session',
            currentTimer:'Session',
            currentLabel : 'Session',
            currentLength: 25,
            sessionLength: 25,
            breakLength: 5,
            isTimerStopped:true,
        }
    }
    handleChangeLength = (name, length)=>{
        this.setState({currentLabel:name});
        
        name === "Session"
           ?this.setState({sessionLength:length})
           :this.setState({breakLength  :length,});    
        this.changeCurrentLength(name, length);   
    }

    handleTimerStopped = (isStopped, name, length)=>{
      this.changeCurrentLength(name, length); 
      // inform the state if the timer has stopped
      this.setState({isTimerStopped:isStopped});
    }

    changeCurrentLength = (name, length)=>{
       // if this timer is the running timer, any changes happens to the current length
       // will affect and be seen on the timer
       if(this.isRunningTimer(name)) this.setState({currentLength: length});
    }

    isRunningTimer= (name)=>{
      // to be able to make seen changes to the running timer
      // it has to be stopped and its name must be equal to
      // the state's currentLabel and currentTimer  
      return this.state.isTimerStopped && 
             this.state.currentLabel === name && 
             this.state.currentTimer === name
    }

    handleReachingZeroTime = (name)=>{   
       // When the running length reaches zero 
       // change the current timer to be the other length
       name==="Session"?
          this.setState({currentName:'Break', 
                        currentTimer:'Break', 
                        currentLabel: 'Break',
                        currentLength:this.state.breakLength})
       
       :this.setState({currentName:'Session', 
                      currentTimer:'Session',
                      currentLabel:'Session',
                      currentLength:this.state.sessionLength});
       
  }

  handleReset = ()=>{
      let newState = {currentName:'Session',
                     currentTimer:'Session',
                     currentLabel:'Session',
                     currentLength: 25,
                     sessionLength: 25,
                     breakLength: 5,
                     isTimerStopped:true,};
      this.setState(newState);
  }
 
    render(){
        const sessionBreaks = SESSIONBREAKS.map(item => 
          <SessionBreak
              name = {item.name}
              id   = {item.id}
              key  = {item.id}
              incrementId = {item.incrementId}
              decremetId = {item.decremetId}
              lengthId = {item.lengthId}
              length = {this.state[item.length]}
              onChangeLength = {this.handleChangeLength}
              isTimerStopped = {this.state.isTimerStopped}
          />
          );

        return(
            <div className="p-clock">
                <div className="session-break">
                 {sessionBreaks}
                </div>
                <Timer
                    name={this.state.currentName}
                    currentLength = {this.state.currentLength}
                    OnReachingZeroTime = {this.handleReachingZeroTime}
                    onStopTimer = {this.handleTimerStopped}
                    onReset = {this.handleReset}
                    isTimerStopped = {this.state.isTimerStopped}
                />
                <audio src="https://www.soundjay.com/misc/censor-beep-5.wav"
                       id="beep"/>
            </div>
        );
    }
}

class Timer extends React.Component{
  handleTimerStopped = (isStopped)=>{
      this.props.onStopTimer(isStopped, this.props.name, this.props.currentLength);
  }
  handlePeepSound = (isAudio)=>{
    let audio = document.getElementById("beep");  
    audio.currentTime = 0;
    if(isAudio){ 
    audio.volume = 0.4;
            let interval = setInterval(()=>audio.play());
        setTimeout(() => {
            clearInterval(interval);
        }, 1000);
    }
    else{
        audio.load();
    }
}
  render(){
      return(
          <div>
              <Clock 
                 name  = {this.props.name}
                 length= {this.props.currentLength}
                 onStopTimer = {this.handleTimerStopped}
                 OnReachingZeroTime = {this.props.OnReachingZeroTime}  
                 onReset = {this.props.onReset}
                 isTimerStopped = {this.props.isTimerStopped}
                 playPeepSound = {this.handlePeepSound}
              />
          </div>
      );
  }
}

class Clock extends React.Component{
  constructor(props){
      super(props);
      this.state={
          currentTime: formatLength(this.props.length*60),
          initialTime: (this.props.length*60)-1,
          toggleText:"Start",
          interval:"",
      }
  }


  componentDidUpdate= (prevProps, state)=>{
    // inform this state if any changes happens to the length
    // that's passed to the clock and accourdingly change
    // the state's currentTime and initialTime  
    if(prevProps.length !== this.props.length){
        this.setState({
                     currentTime:formatLength(this.props.length*60), 
                     initialTime:this.props.length*60-1
                   });
    }
}

  handleStartButton = ()=>{
      if(this.state.toggleText==="Start"){ 
         let interval = setInterval(this.startInterval, 1000);
         this.setState({interval:interval, toggleText:"Stop"});
         this.props.onStopTimer(false);           
      }
      else{
          clearInterval(this.state.interval);
          this.setState({toggleText:"Start"}); 
          this.props.onStopTimer(true);
      }
  }

  startInterval = ()=>{
      let seconds = this.state.initialTime;
      let time = formatLength(seconds);
      seconds = seconds-1;
      if(seconds >= 0) {
          this.setState({currentTime:time, initialTime:seconds});
      }
     
     if(this.state.initialTime ===0){
        this.props.playPeepSound(true);
        this.props.OnReachingZeroTime(this.props.name);
        this.setState({ currentTime:"00:00",
                        initialTime:this.props.length*60});
    }

  }
  handleReset = ()=>{
      clearInterval(this.state.interval);
      this.setState({
          currentTime: "25:00",
          initialTime: 25*60-1,
          toggleText:"Start",
          interval:""
      }); 
      this.props.playPeepSound(false);
      this.props.onReset();
  }
  render(){
      return(
          <div className="clock">
              <div className="digi-clock">
                   <div className="lenght-name"
                        id="timer-label">
                   {this.props.name}
                   </div>
                   <div className="time" 
                        id="time-left">
                        {this.state.currentTime}
                       
                  </div>
              </div>

              <div className="reset-start-btns">
                <button onClick={this.handleStartButton} 
                      id="start_stop"
                      className="start-stop">
                      {this.state.toggleText}
                 </button>
                 <Reset onReset={this.handleReset}/>
              </div>
          </div>
      );
  }
}

class Reset extends React.Component{
  render(){
      return(
          <div>
              <button id="reset" 
                      onClick={this.props.onReset} 
                      className="reset">
                Reset
              </button>
          </div>
      );
  }
}

class SessionBreak extends React.Component{
  constructor(props){
      super(props);
      this.state = {
          length: '',
          name:   this.props.name.split(" ")[0],
      }
  }
   handleIncrementClick = ()=>{ 
    let newLen = this.props.length;
    if(this.props.isTimerStopped) {
        if(newLen < 60) this.setState({length:++newLen});
        this.passChanges(this.state.name, newLen);
    }
  }
  handleDecrementClick = ()=>{
      let newLen = this.props.length;
      if(this.props.isTimerStopped){
          if(newLen > 1) this.setState({length:--newLen});
          this.passChanges(this.state.name, newLen);
      } 
  }
  passChanges = (name, len)=>{
      this.props.onChangeLength(name, len);
  }
  render(){
      return(
          <div>
              <label id={this.props.id}>
                 {this.props.name}
              </label>
              <div className="under-length-label">
              <div onClick={this.handleIncrementClick} 
                   id={this.props.incrementId}
                   className="inc">
                   ↑
              </div>

              <div className="inc-dec" id={this.props.lengthId}>
                {this.props.length}
              </div>

              <div onClick={this.handleDecrementClick} 
                   id={this.props.decremetId} className="dec">
                   ↓
             </div>
             </div>
          </div>
      );
  }
}

let formatLength = (length)=>{
  let minutes = Math.floor(length / 60);
  let seconds = length % 60;
  // add a leading zero before seconds and minutes less than 10
  return `${minutes<10?0:''}${minutes}:${seconds<10?0:''}${seconds}`;  
}
const SESSIONBREAKS = [
  { 
    name:"Session Length",
    id: "session-label", 
    length:"sessionLength",
    lengthId:"session-length",
    incrementId:"session-increment", 
    decremetId:"session-decrement"
  },
  { 
      name:"Break Length",
      id: "break-label", 
      length:"breakLength",
      lengthId:"break-length",
      incrementId:"break-increment", 
      decremetId:"break-decrement"            
    },
];
ReactDOM.render(<PomodoroClock/>, document.getElementById('root'));