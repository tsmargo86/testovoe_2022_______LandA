var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    mousePos = {
        x: 400,
        y: 300
    },
    canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    particles = [],
    rockets = [],
    MAX_PARTICLES = 400,
    colorCode = 0;
jQuery(document).ready(function () {
    jQuery(".trigger_fworks").click(function () {
        jQuery(".fireworks").toggle();
        jQuery(".fireworks").append(canvas);
        canvas.width = SCREEN_WIDTH;
        canvas.height = SCREEN_HEIGHT;
        setInterval(launch, 800);
        setInterval(loop, 1000 / 50);
    });
});
jQuery(document).mousemove(function (e) {
    e.preventDefault();
    mousePos = {
        x: e.clientX,
        y: e.clientY
    };
});
jQuery(document).mousedown(function (e) {
    for (var i = 0; i < 5; i++) {
        launchFrom(Math.random() * SCREEN_WIDTH * 2 / 3 + SCREEN_WIDTH / 6);
    }
});

function launch() {
    launchFrom(mousePos.x);
}

function launchFrom(x) {
    if (rockets.length < 10) {
        var rocket = new Rocket(x);
        rocket.explosionColor = Math.floor(Math.random() * 360 / 10) * 10;
        rocket.vel.y = Math.random() * -3 - 4;
        rocket.vel.x = Math.random() * 6 - 3;
        rocket.size = 8;
        rocket.shrink = 0.999;
        rocket.gravity = 0.01;
        rockets.push(rocket);
    }
}

function loop() {
    if (SCREEN_WIDTH != window.innerWidth) {
        canvas.width = SCREEN_WIDTH = window.innerWidth;
    }
    if (SCREEN_HEIGHT != window.innerHeight) {
        canvas.height = SCREEN_HEIGHT = window.innerHeight;
    }
    context.fillStyle = "rgba(0, 0, 0, 0.05)";
    context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    var existingRockets = [];
    for (var i = 0; i < rockets.length; i++) {
        rockets[i].update();
        rockets[i].render(context);
        var distance = Math.sqrt(Math.pow(mousePos.x - rockets[i].pos.x, 2) + Math.pow(mousePos.y - rockets[i].pos.y, 2));
        var randomChance = rockets[i].pos.y < (SCREEN_HEIGHT * 2 / 3) ? (Math.random() * 100 <= 1) : false;
        if (rockets[i].pos.y < SCREEN_HEIGHT / 5 || rockets[i].vel.y >= 0 || distance < 50 || randomChance) {
            rockets[i].explode();
        } else {
            existingRockets.push(rockets[i]);
        }
    }
    rockets = existingRockets;
    var existingParticles = [];
    for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        if (particles[i].exists()) {
            particles[i].render(context);
            existingParticles.push(particles[i]);
        }
    }
    particles = existingParticles;
    while (particles.length > MAX_PARTICLES) {
        particles.shift();
    }
}

function Particle(pos) {
    this.pos = {
        x: pos ? pos.x : 0,
        y: pos ? pos.y : 0
    };
    this.vel = {
        x: 0,
        y: 0
    };
    this.shrink = .97;
    this.size = 2;
    this.resistance = 1;
    this.gravity = 0;
    this.flick = false;
    this.alpha = 1;
    this.fade = 0;
    this.color = 0;
}
Particle.prototype.update = function () {
    this.vel.x *= this.resistance;
    this.vel.y *= this.resistance;
    this.vel.y += this.gravity;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.size *= this.shrink;
    this.alpha -= this.fade;
};
Particle.prototype.render = function (c) {
    if (!this.exists()) {
        return;
    }
    c.save();
    c.globalCompositeOperation = 'lighter';
    var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;
    var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(255,255,255," + this.alpha + ")");
    gradient.addColorStop(0.8, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
    gradient.addColorStop(1, "hsla(" + this.color + ", 100%, 50%, 0.1)");
    c.fillStyle = gradient;
    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size : this.size, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();
    c.restore();
};
Particle.prototype.exists = function () {
    return this.alpha >= 0.1 && this.size >= 1;
};

function Rocket(x) {
    Particle.apply(this, [{
        x: x,
        y: SCREEN_HEIGHT
    }]);
    this.explosionColor = 0;
}
Rocket.prototype = new Particle();
Rocket.prototype.constructor = Rocket;
Rocket.prototype.explode = function () {
    var count = Math.random() * 10 + 80;
    for (var i = 0; i < count; i++) {
        var particle = new Particle(this.pos);
        var angle = Math.random() * Math.PI * 2;
        var speed = Math.cos(Math.random() * Math.PI / 2) * 15;
        particle.vel.x = Math.cos(angle) * speed;
        particle.vel.y = Math.sin(angle) * speed;
        particle.size = 10;
        particle.gravity = 0.2;
        particle.resistance = 0.92;
        particle.shrink = Math.random() * 0.05 + 0.93;
        particle.flick = true;
        particle.color = this.explosionColor;
        particles.push(particle);
    }
};
Rocket.prototype.render = function (c) {
    if (!this.exists()) {
        return;
    }
    c.save();
    c.globalCompositeOperation = 'lighter';
    var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;
    var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(255, 255, 255 ," + this.alpha + ")");
    gradient.addColorStop(1, "rgba(0, 0, 0, " + this.alpha + ")");
    c.fillStyle = gradient;
    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size / 2 + this.size / 2 : this.size, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();
    c.restore();
};

var resultWrapper = document.querySelector('.spin-result-wrapper');
var wheel = document.querySelector('.wheel-img');

function spin() {
    if (!wheel.classList.contains('rotated')) {
        wheel.classList.add('super-rotation');
        setTimeout(function () {
            resultWrapper.style.display = "block";
            jQuery(".fireworks").toggle();
            jQuery(".fireworks").append(canvas);
            canvas.width = SCREEN_WIDTH;
            canvas.height = SCREEN_HEIGHT;
            setInterval(launch, 400);
            setInterval(loop, 500 / 50);
        }, 8000);
        setTimeout(function () {
            $('.spin-wrapper').slideUp();
            $('.order_block').slideDown();
            start_timer();
        }, 10000);
        wheel.classList.add('rotated');
    }
}
var closePopup = document.querySelector('.close-popup');
$('.close-popup, .pop-up-button').click(function (e) {
    e.preventDefault();
    $('.spin-result-wrapper').fadeOut();
    $(".wrapper_2").css({
        'display': 'flex'
    })
});
$(".pop-up-button, .spin-result-wrapper, .close-popup").click(function () {
    $(".fireworks, .wrapper_F").hide();
    $(".wrapper_2").slideDown(0, function () {
        $('html, body').animate({
            scrollTop: $("#wrp2").offset().top,
        }, 0);
    });
});
var time = 600;
var intr;

function start_timer() {
    intr = setInterval(tick, 1000);
}

function tick() {
    time = time - 1;
    var mins = Math.floor(time / 60);
    var secs = time - mins * 60;
    if (mins == 0 && secs == 0) {
        clearInterval(intr);
    }
    secs = secs >= 10 ? secs : "0" + secs;
    $("#min").html("0" + mins);
    $("#sec").html(secs);
}
//$('.slider').addClass('owl-carousel'); $('.slider').owlCarousel({items:1, loop:true, margin:0, });
var resultWrapper = document.querySelector('.spin-result-wrapper');
var wheel = document.querySelector('.wheel-img');

function spin() {
    if (!wheel.classList.contains('rotated')) {
        wheel.classList.add('super-rotation');
        setTimeout(function () {
            resultWrapper.style.display = "block";
            jQuery(".fireworks").toggle();
            jQuery(".fireworks").append(canvas);
            canvas.width = SCREEN_WIDTH;
            canvas.height = SCREEN_HEIGHT;
            setInterval(launch, 400);
            setInterval(loop, 500 / 50);
        }, 8000);
        setTimeout(function () {
            $('.spin-wrapper').slideUp();
            $('.order_block').slideDown();
            start_timer();
        }, 10000);
        wheel.classList.add('rotated');
    }
}
var closePopup = document.querySelector('.close-popup');
$('.close-popup, .pop-up-button').click(function (e) {
    e.preventDefault();
    $('.spin-result-wrapper').fadeOut();
    $(".wrapper_2").css({
        'display': 'flex'
    })
});
$(".pop-up-button, .spin-result-wrapper, .close-popup").click(function () {
    $(".fireworks, .wrapper_F").hide();
    $(".wrapper_2").slideDown(0, function () {
        $('html, body').animate({
            scrollTop: $("#wrp2").offset().top,
        }, 0);
    });
});
var time = 600;
var intr;

function start_timer() {
    intr = setInterval(tick, 1000);
}

function tick() {
    time = time - 1;
    var mins = Math.floor(time / 60);
    var secs = time - mins * 60;
    if (mins == 0 && secs == 0) {
        clearInterval(intr);
    }
    secs = secs >= 10 ? secs : "0" + secs;
    $("#min").html("0" + mins);
    $("#sec").html(secs);
}
