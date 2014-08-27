// .video-wrapper is used to translateX the video.
// .video is scaled (with transition). 
//translateX and scale cannot be applied to the same element because only one needs transition.

var mainVideoOn = false;
var firstTime = true;
var waitForTranslation = true;

Template.hello.rendered = function() {
  video = document.getElementById("video"); 
  videoSlow = document.getElementById("video-slow"); 
  canvas = document.getElementById("canvas");

  // fc = new frameConverter(video,canvas);

  // // Change the image effect applied to the video
  // fc.setEffect('circlesmear'); //diffusion
};

Template.hello.events({
    'mouseover .border' : function() {
      continueVideo();
    },
    'mouseleave .border' : function() {
      pauseVideo();
    },
    'mouseover .video' : function(e) {
      pauseVideo();
    },
    'mousemove .video' : function(e) {

      if(e.pageY < 120) {
        $('.border').addClass("border-scale");
      } else if($(window).height()-e.pageY < 120) {
        $('.border').addClass("border-scale");
      } else {
        $('.border').removeClass("border-scale");
      }
      if (mainVideoOn) return;
      translateVideo(e, firstTime);
      firstTime = false;
    },
    'mousemove body' : function(e) {
      console.log("pausing video");
      if (!$('.video').is(':hover')) {
        pauseVideo();
      }
    }

});

function setMainVideo() {
  $(".video-normal").css( "opacity", 1 );
  mainVideoOn = true; 
}
function setSlowVideo() {
  $(".video-normal").css( "opacity", 0 );
  mainVideoOn = false;
  firstTime = true;
}

function pauseVideo() {
  video.pause();
  $(".video").addClass("scale");

  var videoTime = video.currentTime;
  var videoDuration = video.duration;
  var percentage = videoTime / videoDuration;

  var videoSlowDuration = videoSlow.duration;

  //set currentTime for slow.
  videoSlow.currentTime = (videoSlowDuration * percentage);
  videoSlow.play();

  // setTimeout(setSlowVideo, 500);
  $(".video-effects").css( "opacity", 1 );
  $(".video-normal").css( "opacity", 0 );
  mainVideoOn = false;
  firstTime = true;
}

function continueVideo() {
  videoSlow.pause();
  var percentage = videoSlow.currentTime / videoSlow.duration;
  video.currentTime = (video.duration * percentage);

  // setTimeout(setMainVideo, 500);
$(".video-effects").css( "opacity", 0 );
  $(".video-normal").css( "opacity", 1 );
  mainVideoOn = true; 


  $(".video").removeClass("scale");
  $('.video-wrapper').css({"-webkit-transform":"translateX("+0+"px)"});
  video.play();
  canvas.fillStyle="#FF0000";
}

function translateVideo(e, withAnimation){
  var videoWidth = $('.video').width() * 1.5; //1.5 = scale factor.
  var windowWidth = $(window).width();
  var halfWindowWidth = windowWidth /2;
  var maxOffset = (videoWidth - windowWidth)/2;
  var mouse = e.pageX;

  if(mouse < halfWindowWidth){
    var videoOffset = ((halfWindowWidth - mouse) / halfWindowWidth ) * maxOffset;

    
  }else if (mouse > halfWindowWidth) {
     var videoOffset = - (((mouse - windowWidth ) + halfWindowWidth) / halfWindowWidth ) * maxOffset;
  } else {
    //exactly in center.
    var videoOffset = 0;
  }

  if(withAnimation) {
    $('.video-wrapper').css({"-webkit-transform":"translateX("+videoOffset+"px)", "transition": "all 1s ease"});
    waitForTranslation = true;
    setTimeout(function(){
      console.log("transition WITH animation "+ videoOffset);
      waitForTranslation = false;
    }, 1000);
  } else { 
    if(!waitForTranslation) {
      console.log("transition WITHOUT animation " + videoOffset);
      $('.video-wrapper').css({"-webkit-transform":"translateX("+videoOffset+"px)", "transition": "none"});
    }
  }
}

function frameConverter(video,canvas) {

    // Set up our frame converter
    this.video = videoSlow;
    this.viewport = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    // Create the frame-buffer canvas
    this.framebuffer = document.createElement("canvas");
    this.framebuffer.width = this.width;
    this.framebuffer.height = this.height;
    this.ctx = this.framebuffer.getContext("2d");
    // Default video effect is blur
    this.effect = JSManipulate.blur;
    // This variable used to pass ourself to event call-backs
    var self = this;
    // Start rendering when the video is playing
    this.video.addEventListener("play", function() {
        self.render();
      }, false);
      
    // Change the image effect to be applied  
    this.setEffect = function(effect){
      if(effect in JSManipulate){
          this.effect = JSManipulate[effect];
      }
    }

    // Rendering call-back
    this.render = function() {
        if (this.video.paused || this.video.ended) {
          return;
        }
        this.renderFrame();
        var self = this;
        // Render every 10 ms
        setTimeout(function () {
            self.render();
          }, 10);
    };

    // Compute and display the next frame 
    this.renderFrame = function() {
        // Acquire a video frame from the video element
        this.ctx.drawImage(this.video, 0, 0, this.video.videoWidth,
                    this.video.videoHeight,0,0,this.width, this.height);
        var data = this.ctx.getImageData(0, 0, this.width, this.height);
        // Apply image effect
        this.effect.filter(data,this.effect.defaultValues);
        // Render to viewport
        this.viewport.putImageData(data, 0, 0);
    return;
    };
};



