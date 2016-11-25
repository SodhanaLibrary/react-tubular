import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Tubular extends React.Component {

   constructor(props) {
      super(props);
      this.state = {
        tubularStyle:{
          position: 'absolute'
        }
      }
      var tag = document.createElement('script');
      tag.src = "//www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      this.resize = this.resize.bind(this);
      this._renderLayer = this._renderLayer.bind(this);
   }

   componentDidUpdate() {
    this._renderLayer();
   }

   componentWillUnmount() {
      React.unmountComponentAtNode(this.popup);
      document.body.removeChild(this.popup);
   }

   _renderLayer() {
     ReactDOM.render(<div>
      <div style={{overflow: 'hidden', position: 'fixed', zIndex: this.props.wrapperZIndex, width: '100%', height: '100%', top:0, left:0}}>
          <div ref={(ref)=>{this.tubularPlayer = ref}} id="tubular-player" style={this.state.tubularStyle}></div>
      </div>
      <div style={{width: '100%', height: '100%', zIndex: this.props.wrapperZIndex, position: 'absolute', left: 0, top: 0}}>
      </div>
    </div>, this.popup);
   }


   componentDidMount() {
     console.log('**** componentDidMount ****');

     this.popup = document.createElement("div");
     document.body.appendChild(this.popup);
     this._renderLayer();

     let self = this;
     // set up iframe player, use global scope so YT api can talk
     window.onYouTubeIframeAPIReady = function() {
         window.player = new YT.Player('tubular-player', {
             width: self.props.width,
             height: Math.ceil(self.props.width / self.props.ratio),
             videoId: self.props.videoId,
             playerVars: {
                 controls: 0,
                 showinfo: 0,
                 modestbranding: 1,
                 wmode: 'transparent'
             },
             events: {
                 'onReady': onPlayerReady,
                 'onStateChange': onPlayerStateChange
             }
         });
     }

     window.onPlayerReady = function(e) {
         self.resize();
         if (self.props.mute) e.target.mute();
         e.target.seekTo(self.props.start);
         e.target.playVideo();
     }

     window.onPlayerStateChange = function(state) {
         if (state.data === 0 && self.props.repeat) { // video ended and repeat option is set true
              window.player.seekTo(self.props.start); // restart
         }
     }
   }

   resize() {
          let width = window.innerWidth,
             pWidth, // player width, to be defined
             height = window.innerHeight,
             pHeight; // player height, tbd

         // when screen aspect ratio differs from video, video must center and underlay one dimension

         if (width / this.props.ratio < height) { // if new video height < window height (gap underneath)
             pWidth = Math.ceil(height * this.props.ratio); // get new player width
             this.setState({
               tubularStyle:{
                 position:'absolute',
                 width:pWidth,
                 height,
                 left: (width - pWidth) / 2,
                 top: 0
              }
             }); // player width is greater, offset left; reset top
         } else { // new video width < window width (gap to right)
             pHeight = Math.ceil(width / this.props.ratio); // get new player height
             this.setState({
               tubularStyle:{
                 position:'absolute',
                 width,
                 height:pHeight,
                 left: 0,
                 top: (height - pHeight) / 2
              }
             });// player height is greater, offset top; reset left
         }
   }

   playVideo() {
     window.player.playVideo();
   }

   pauseVideo() {
     window.player.pauseVideo();
   }

   mute() {
     (window.player.isMuted()) ? window.player.unMute() : window.player.mute();
   }

   decreaseVolume() {
     let currentVolume = window.player.getVolume();
     if (currentVolume < this.props.increaseVolumeBy)
        currentVolume = this.props.increaseVolumeBy;
     window.player.setVolume(currentVolume - this.props.increaseVolumeBy);
   }

   increaseVolume() {
     if (window.player.isMuted()) window.player.unMute(); // if mute is on, unmute
     var currentVolume = window.player.getVolume();
     if (currentVolume > 100 - this.props.increaseVolumeBy) currentVolume = 100 - this.props.increaseVolumeBy;
     window.player.setVolume(currentVolume + this.props.increaseVolumeBy);
   }

   render() {
     return (
      <div></div>
    );
   }
}

Tubular.defaultProps = {
  ratio: 16/9, // usually either 4/3 or 16/9 -- tweak as needed
  videoId: 'ZCAnLxRvNNc', // toy robot in space is a good default, no?
  mute: true,
  repeat: true,
  width: window.innerWidth,
  wrapperZIndex: -1,
  increaseVolumeBy: 10,
  start: 0
};

export default Tubular;
