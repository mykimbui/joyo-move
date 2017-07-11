var elems = []

$(document).ready(function() {
  var count = 2;
  var counting = 25;
  for (var i=0; i<count; i++) {
    for (var j = 0; j<11; j++) {
      var ele = $('<div class="' + String.fromCharCode(97+j)+' fixed"><img class="imgsize" src="img/IMG'+j+'.png"></div>')
      elems.push(ele)
      newImg(ele)
    }
  }
  for (var i=0; i<counting; i++) {
    newDiv();
    // newImg($('<div class="e fixed"><img class="imgsize" src="img/IMG5.png"></div>'));
  }
  elems.map(function (item){
    TweenMax.to(item, 2 + 5 * Math.random(), {scale: 0.05 + 2 * Math.random(), rotation: Math.random()< .5? '+=360' : '-=360', repeat: -1, yoyo:true, ease: Linear.easeNone})
  })
});


function newDiv() {
  var $div = $("<div class='circles'>");
  $(".animatedDivs").append($div);

  animateDiv();

  function animateDiv() {
    var newq = makeNewPosition();
    var oldq = $div.offset();
    var speed = calcSpeed([oldq.top, oldq.left], newq);

    $div.animate({
      top: newq[0],
      left: newq[1]
    }, speed, function () {
      animateDiv();
    });

  };
}

function newImg($target) {
  $(".animatedDivs").append($target);

  animateDiv();

  function animateDiv() {
    var newq = makeNewPosition();
    var oldq = $target.offset();
    var speed = calcSpeed([oldq.top, oldq.left], newq);

    $target.animate({
      top: newq[0],
      left: newq[1]
    }, speed, function () {
      animateDiv();
    });

  };
}


function makeNewPosition() {

  var h = $(window).height() - 50;
  var w = $(window).width() - 50;

  var nh = Math.floor(Math.random() * h);
  var nw = Math.floor(Math.random() * w);

  return [nh, nw];

}



function calcSpeed(prev, next) {

  var x = Math.abs(prev[1] - next[1]);
  var y = Math.abs(prev[0] - next[0]);

  var greatest = x > y ? x : y;

  var speedModifier = 0.1;

  var speed = Math.ceil(greatest / speedModifier);

  return speed;

}





