(function() {
  var ALPHA, AudioAnalyser, COLORS, DIRECTION, MP3_PATH, NUM_BANDS, NUM_PARTICLES, Particle, RADIUS, SCALE, SIZE, SMOOTHING, SPEED, SPIN;

  NUM_PARTICLES = 100;

  NUM_BANDS = 90;

  SMOOTHING = 0.5;

  MP3_PATH = 'https://api.soundcloud.com/tracks/42328219/stream?client_id=b1495e39071bd7081a74093816f77ddb';

  SCALE = {
    MIN: 10.0,
    MAX: 15.0
  };

  SPEED = {
    MIN: 0.2,
    MAX: 1.0
  };

  ALPHA = {
    MIN: 1,
    MAX: 2
  };

  SPIN = {
    MIN: 0.001,
    MAX: 0.005
  };

  SIZE = {
    MIN: 2,
    MAX: 2.25
  };

  RADIUS = {
    MIN: 1,
    MAX: 1.5
  };

  DIRECTION = {
    MIN: 10,
    MAX: 30
  };

  COLORS = ['#ccffff'];

  AudioAnalyser = (function() {
    AudioAnalyser.AudioContext = self.AudioContext || self.webkitAudioContext;

    AudioAnalyser.enabled = AudioAnalyser.AudioContext != null;

    function AudioAnalyser(audio, numBands, smoothing) {
      var src;
      this.audio = audio != null ? audio : new Audio();
      this.numBands = numBands != null ? numBands : 256;
      this.smoothing = smoothing != null ? smoothing : 0.3;
      if (typeof this.audio === 'string') {
        src = this.audio;
        this.audio = new Audio();
        this.audio.crossOrigin = "anonymous";
        this.audio.controls = true;
        this.audio.src = src;
      }
      this.context = new AudioAnalyser.AudioContext();
      this.jsNode = this.context.createScriptProcessor(2048, 1, 1);
      this.analyser = this.context.createAnalyser();
      this.analyser.smoothingTimeConstant = this.smoothing;
      this.analyser.fftSize = this.numBands * 2;
      this.bands = new Uint8Array(this.analyser.frequencyBinCount);
      this.audio.addEventListener('canplay', (function(_this) {
        return function() {
          _this.source = _this.context.createMediaElementSource(_this.audio);
          _this.source.connect(_this.analyser);
          _this.analyser.connect(_this.jsNode);
          _this.jsNode.connect(_this.context.destination);
          _this.source.connect(_this.context.destination);
          return _this.jsNode.onaudioprocess = function() {
            _this.analyser.getByteFrequencyData(_this.bands);
            if (!_this.audio.paused) {
              return typeof _this.onUpdate === "function" ? _this.onUpdate(_this.bands) : void 0;
            }
          };
        };
      })(this));
    }

    AudioAnalyser.prototype.start = function() {
      return this.audio.play();
    };

    AudioAnalyser.prototype.stop = function() {
      return this.audio.pause();
    };

    return AudioAnalyser;

  })();

  Particle = (function() {
    function Particle(x1, y1) {
      this.x = x1 != null ? x1 : 0;
      this.y = y1 != null ? y1 : 0;
      this.reset();
    }

    Particle.prototype.reset = function() {
      this.level = 1 + floor(random(4));
      this.scale = random(SCALE.MIN, SCALE.MAX);
      this.alpha = random(ALPHA.MIN, ALPHA.MAX);
      this.speed = random(SPEED.MIN, SPEED.MAX);
      this.color = random(COLORS);
      this.size = random(SIZE.MIN, SIZE.MAX);
      this.spin = random(SPIN.MAX, SPIN.MAX);
      this.radius = random(RADIUS.MAX, RADIUS.MAX);
      this.band = floor(random(NUM_BANDS));
      this.direction = random(DIRECTION.MIN, DIRECTION.MAX);
      if (random() < 0.5) {
        this.spin = -this.spin;
      }
      this.smoothedScale = 0.0;
      this.smoothedAlpha = 0.0;
      this.decayScale = 0.0;
      this.decayAlpha = 1;
      this.rotation = random(TWO_PI);
      return this.energy = 0.0;
    };

    Particle.prototype.move = function() {
      return this.rotation += this.spin;
    };

    Particle.prototype.draw = function(ctx) {
      var alpha, power, scale;
      power = exp(this.energy);
      scale = this.scale * power;
      alpha = this.alpha * this.energy * 1.5;
      this.decayScale = max(this.decayScale, scale);
      this.decayAlpha = max(this.decayAlpha, alpha);
      this.smoothedScale += (this.decayScale - this.smoothedScale) * 0.3;
      this.smoothedAlpha += (this.decayAlpha - this.smoothedAlpha) * 0.3;
      this.decayScale *= 0.985;
      ctx.save();
      ctx.beginPath();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.smoothedScale * this.level, this.smoothedScale * this.level);
      ctx.moveTo(this.x, this.y - (this.direction * this.size));
      ctx.arc(this.radius * cos(this.x), this.radius * sin(this.y), this.radius, 0, 2 * Math.PI, false);
      ctx.globalAlpha = this.level;
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      this.vsize = this.size * 10;
      this.hsize = this.vsize / Math.cos(0.166666667 * Math.PI);
      ctx.translate(this.x + cos(this.rotation * this.speed) * 250, this.y);
      ctx.rotate(this.rotation);
      ctx.moveTo(this.x, this.y - this.vsize);
      ctx.lineWidth = this.vsize;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineTo(this.x - this.hsize, this.y + this.vsize);
      ctx.lineTo(this.x + this.hsize, this.y + this.vsize);
      ctx.lineTo(this.x, this.y - this.vsize);
      ctx.closePath();
      ctx.globalAlpha = this.level;
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.stroke();
      return ctx.restore();
    };

    return Particle;

  })();

  Sketch.create({
    particles: [],
    setup: function() {
      var analyser, error, i, intro, j, particle, ref, warning, x, y;
      for (i = j = 0, ref = NUM_PARTICLES - 1; j <= ref; i = j += 1) {
        x = random(this.width);
        y = random(this.height * 2);
        particle = new Particle(x, y);
        particle.energy = random(particle.band / 256);
        this.particles.push(particle);
      }


      if (AudioAnalyser.enabled) {
        try {
          analyser = new AudioAnalyser(MP3_PATH, NUM_BANDS, SMOOTHING);
          analyser.onUpdate = (function(_this) {
            return function(bands) {
              var k, len, ref1, results;
              ref1 = _this.particles;
              results = [];
              for (k = 0, len = ref1.length; k < len; k++) {
                particle = ref1[k];
                results.push(particle.energy = bands[particle.band] / 256);
              }


              return results;
            };
          })(this);
          analyser.start();
          document.body.appendChild(analyser.audio);
          intro = document.getElementById('intro');
          intro.style.display = 'none';
          if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
            warning = document.getElementById('warning2');
            return warning.style.display = 'block';
          }
        } catch (error1) {
          error = error1;
        }
      } else {
        warning = document.getElementById('warning1');
        return warning.style.display = 'block';
      }
    },
    draw: function() {
      var j, len, particle, ref, results;
      this.globalCompositeOperation = 'lighter';
      ref = this.particles;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        particle = ref[j];
        if (particle.y < -particle.size * particle.level * particle.scale * 2) {
          particle.reset();
          particle.x = random(this.width);
          particle.y = this.height + particle.size * particle.scale * particle.level;
        }
        particle.move();
        results.push(particle.draw(this));
      }


      return results;
    }
  });

}).call(this);
