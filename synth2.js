
$(function () {
	
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
settings = {
                    id: 'keyboard',
                    width: 800,
                    height: 144,
                    startNote: 'c3',
                    whiteNotesColour: '#fff',
                    blackNotesColour: '#000',
                    borderColour: '#13324C',
                    activeColour: '#AB2FAB',
                    octaves: 3
             },
keyboard = new QwertyHancock(settings);

var VCO = (function(context) {
  function VCO(){
    this.oscillator = context.createOscillator();
    this.setWaveType('sine');
    this.setFrequency(440);
    this.oscillator.start(0);
    this.frequency = this.oscillator.frequency;
    this.detune = this.oscillator.detune;
    this.input = this.oscillator;
    this.output = this.oscillator;

    var that = this;
    $(document).bind('frequency', function (_, frequency) {
      that.setFrequency(frequency);
    });
    
  };
 
 
 //Setting wavetypes here. For multiple oscillators, use proper oscillator name
    
   $(document).bind('setWaveType1', function(_, w1) {
		vco.setWaveType(w1);
		});
   $(document).bind('setWaveType2', function(_, w2) {
		vco2.setWaveType(w2);
		});
  
   $(document).bind('Detune', function(_, cent) {
	
		vco.detune.value = Math.pow(2, 1/12) * cent;
		
		});
  
  VCO.prototype.setFrequency = function(frequency) {
    this.oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  };

  VCO.prototype.setWaveType = function(w) {
	  this.oscillator.type = w;
	 //alert(this.oscillator.type);
  };
	  
  VCO.prototype.connect = function(node) {
    if (node.hasOwnProperty('input')) {
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    };
  }

  return VCO;
})(context);

var VCA = (function(context) {
  function VCA() {
    this.gain = context.createGain();
    this.gain.gain.value = 0;
    this.input = this.gain;
    this.output = this.gain;
    this.amplitude = this.gain.gain;
  };
  VCA.prototype.disconnect = function(node)  {
	  this.gain.disconnect();
  };
  
  VCA.prototype.connect = function(node) {
    if (node.hasOwnProperty('input')) {
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    };
  }

  return VCA;
})(context);

var EnvelopeGenerator = (function(context) {
  function EnvelopeGenerator() {
    this.attackTime = 0.1;
    this.releaseTime = 0.1;

    var that = this;
    $(document).bind('gateOn', function (_) {
      that.trigger();
    });
   
    $(document).bind('gateOff', function (_) {
      that.triggerUp();
    });
   
  };

 $(document).bind('setAttack', function (_, value) {
      envelope.attackTime = value;
    });
    $(document).bind('setRelease', function (_, value) {
      envelope.releaseTime = value;
    });
    
   $(document).bind('setAttack2', function (_, value) {
      envelope2.attackTime = value;
    });
    $(document).bind('setRelease2', function (_, value) {
      envelope2.releaseTime = value;
    });
  EnvelopeGenerator.prototype.trigger = function() {
    now = context.currentTime;
    this.param.cancelScheduledValues(now);
    this.param.setValueAtTime(0, now);
    this.param.linearRampToValueAtTime(0.5, now + this.attackTime);
    //this.param.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
  };

 EnvelopeGenerator.prototype.triggerUp = function() {
    now = context.currentTime;
    //this.param.cancelScheduledValues(now);
    this.param.setValueAtTime(0.5, now);
    //this.param.linearRampToValueAtTime(0.5, now + this.attackTime);
    this.param.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
  };



  EnvelopeGenerator.prototype.connect = function(param) {
    this.param = param;
  };

  return EnvelopeGenerator;
})(context);

//LFO
lfo = context.createOscillator();
lfogain = context.createGain();
lfo.type = 'sine';
lfogain.gain.value = 0;
lfo.frequency.value = 0;
lfo.start(0);


//LFO function binds
 $(document).bind('setLfoDepth', function(_, val) {
		lfogain.gain.value = val;
		
	});
	
 $(document).bind('setLfoRate', function(_, val) {
		lfo.frequency.value = val;
	
	});

$(document).bind('setLfoShape', function(_, ls) {
		lfo.type = ls;
	
	});
	
//Filter


var Filter = (function(context) {
  function Filter() {
    this.filter = context.createBiquadFilter();
    this.filter.type = 0;
    this.input = this.filter;
    this.output = this.filter;
    this.frequency = this.filter.frequency;
    this.Q = this.filter.Q;
    this.gain = this.filter.gain;
  };
   
  Filter.prototype.cutoff = function(cutfreq) {
	  var minValue = 40;
      var maxValue = context.sampleRate / 2;
	  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
	  var multiplier = Math.pow(2, numberOfOctaves * (cutfreq - 1.0));
	  this.filter.frequency.value = maxValue * multiplier;
  };
  
  Filter.prototype.resonance = function(q) {
	  this.filter.Q.value = q * 25;
  };
  
  Filter.prototype.gain = function(g) {
	  this.filter.gain = g - 40;
  };
  Filter.prototype.disconnect = function(node)  {
	  this.filter.disconnect();
  };
  
  Filter.prototype.connect = function(node) {
    if (node.hasOwnProperty('input')) {
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    };
  }

  return Filter;
  
})(context);

//Filter binds
 $(document).bind('setCutoff', function(_, cut) {
		fil.cutoff(cut);
	});
	
 $(document).bind('setResonance', function(_, res) {
		fil.resonance(res);
	});

//Effects
//Delay
delay = context.createDelay();
feedback = context.createGain();
feedback.gain.value = 0;
wet = context.createGain();

 $(document).bind('setDelay', function(_, d) {
		delay.delayTime.value = d;
		
	});
	
 $(document).bind('setFeedback', function(_, fb) {
		feedback.gain.value = fb;
	
	});
	
$(document).bind('setWet', function(_, w) {
		wet.gain.value = w;
	
	});

//Reverb
//var reverbconvolver = context.createConvolver();

//var request = new XMLHttpRequest();
  //request.open("GET", "http://127.0.0.1:8000/test.mp3", true);
  //request.responseType = "arraybuffer";
  //alert('hiiii');
  //request.onload = function() {
	   //alert('hi');
   //context.decodeAudioData(request.response, function(buffer) {
      //reverbconvolver.buffer = buffer;
    //});
  //}
  //request.onload();
  //request.send();
//Component Variabless
var vco = new VCO;
var vco2 = new VCO;
var vca = new VCA;
var vca2 = new VCA;
var envelope = new EnvelopeGenerator;
var envelope2 = new EnvelopeGenerator;
var fil = new Filter;
compressor = context.createDynamicsCompressor();
volume = context.createGain();
volume.gain.value = 1;

//Connections
vco.connect(vca);
envelope.connect(vca.amplitude);

vco2.connect(vca2);
envelope2.connect(vca2.amplitude);

delay.connect(feedback);
feedback.connect(delay);

delay.connect(wet);
wet.connect(compressor);
compressor.connect(volume);
//reverbconvolver.connect(volume)
volume.connect(context.destination);

//default
vca.connect(delay);
vca2.connect(delay);
vca.connect(compressor);
vca2.connect(compressor);
//Filter connections
  $('input[name=filteron]').click(function(){
	  vca.disconnect(0);
	   vca2.disconnect(0);
	  fil.disconnect(0);
	  	  
	if($('input[name=filteron]').is(':checked')) {
			  vca.connect(fil);
			  vca2.connect(fil);
			  fil.connect(compressor);
			  fil.connect(delay);
} else {
    vca.connect(delay);
    vca2.connect(delay);
    vca.connect(compressor);
    vca2.connect(compressor);
   
}  
    
});


//LFO connections
lfo.connect(lfogain);
lfogain.connect(vco.frequency);
lfogain.connect(vco2.frequency);


keyboard.keyDown = function (note, frequency) {
    jQuery.event.trigger('frequency', [frequency] );
    jQuery.event.trigger('gateOn');
  };

keyboard.keyUp = function (_, _) {
	    jQuery.event.trigger('gateOff');

	 };

  $("#attack").knob({
    'release' : function (v) { jQuery.event.trigger('setAttack', v / 100); }
  });

  $("#release").knob({
    'release' : function (v) { jQuery.event.trigger('setRelease', v / 100); }
  });
  
   $("#detune").knob({
    'change' : function (v) { jQuery.event.trigger('Detune', v / 2); }
  });
  
    $("#attack2").knob({
    'release' : function (v) { jQuery.event.trigger('setAttack2', v / 100); }
  });

  $("#release2").knob({
    'release' : function (v) { jQuery.event.trigger('setRelease2', v / 100); }
  });

//LFO knobs

  $("#lfodep").knob({
    'change' : function (v) { jQuery.event.trigger('setLfoDepth', v / 2); }
  });
  
    $("#lforate").knob({
    'change' : function (v) { jQuery.event.trigger('setLfoRate', v / 5); }
  });

   $('input[name=lfotype]').change(function(){  
    ls = jQuery( 'input[name=lfotype]:checked' ).val() ;
    jQuery.event.trigger('setLfoShape', ls);

});
//WaveType input  
  $('input[name=wavetype1]').change(function(){  
    w1 = jQuery( 'input[name=wavetype1]:checked' ).val() ;
    jQuery.event.trigger('setWaveType1', w1);
   });
    
    $('input[name=wavetype2]').change(function(){  
    w2 = jQuery( 'input[name=wavetype2]:checked' ).val() ;
    jQuery.event.trigger('setWaveType2', w2);
});

//Filter inputs
  $("#cutoff").knob({
    'change' : function (v) { jQuery.event.trigger('setCutoff', v / 100); }
  });
  
    $("#resonance").knob({
    'change' : function (v) { jQuery.event.trigger('setResonance', v / 100); }
  });
  
//Delay inputs
  $("#delay").knob({
    'change' : function (v) { jQuery.event.trigger('setDelay', v / 100); }
  });
  
    $("#feedback").knob({
    'change' : function (v) { jQuery.event.trigger('setFeedback', v / 100); }
  });
  
      $("#wet").knob({
    'change' : function (v) { jQuery.event.trigger('setWet', v / 400); }
  });
});
