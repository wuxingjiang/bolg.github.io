(function() {
    "use strict";

    var ctx = null;

    (function() {
        // return window.requestAnimationFrame ||
        //     window.webkitRequestAnimationFrame ||
        //     window.mozRequestAnimationFrame ||
        //     window.oRequestAnimationFrame ||
        //     window.msRequestAnimationFrame ||
        //     function(callback) {
        //         setTimeout(callback, 1000 / 60);
        //     };

        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // Webkit中此取消方法的名字变了
                window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }

    })();

    var Game = {
        canvas: document.getElementById('myCanvas'),

        init: function() {
            Background.init();
            Hud.init();
            Bricks.init();
            Ball.init();
            Paddle.init();
        },

        runGame: function() {
            Game.canvas.removeEventListener('click', Game.runGame, false);
            // console.log('start');
            Game.init();
            Game.animate();
        },

        restartGame: function() {
            Game.canvas.removeEventListener('click', Game.restartGame, false);
            Game.runGame();
        },

        overGame: function() {
            cancelAnimationFrame(Game.paly);
            Screen.gameover();
            Game.canvas.addEventListener('click', Game.restartGame, false);
            return;
        },

        setup: function() {
            if (this.canvas.getContext) {
                ctx = this.canvas.getContext('2d');

                this.width = this.canvas.width;
                this.height = this.canvas.height;

                Screen.welcome();
                this.canvas.addEventListener('click', this.runGame, false);
                Ctrl.init();
            }
        },
        animate: function() {
            Game.paly = requestAnimationFrame(Game.animate);
    
            Game.draw();
        },


        draw: function() {
            ctx.clearRect(0, 0, this.width, this.height);

            Background.draw();
            Bricks.draw();
            Hud.draw();
            Paddle.draw();
            Ball.draw();
            
        },

        // Leveling
        levelUp: function() {
            Hud.lv += 1;
            Bricks.init();
            Ball.init();
            Paddle.init();
        },

        levelLimit: function(lv) {
            return lv > 5 ? 5 : lv;
        }
    };

    var Hud = {
        init: function() {
            this.lv = 1;
            this.score = 0;
        },
        draw: function() {
            ctx.font = '12px helvetica, arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.fillText('Score: ' + this.score, 5, Game.height - 5);
            ctx.textAlign = 'right';
            ctx.fillText('Lv: ' + this.lv, Game.width - 5, Game.height - 5);
        }
    };


    var Background = {
        init: function() {

            this.ready = false;
            this.img = new Image();
            this.img.src = 'html5-ia-master/ch6/background.jpg';

            this.img.onload = function() {
                Background.ready = true;
            };

        },
        draw: function() {
            if (this.ready) {
                ctx.drawImage(this.img, 0, 0);
            }
        }
    };

    var Bricks = {
        gap: 2, // 间隙
        col: 5, // 行数
        w: 80, // 宽带
        h: 15, // 高度
        init: function() {
            this.row = 2 + Game.levelLimit(Hud.lv);
            this.total = 0;

            this.count = [this.row];
            for (var i = this.row; i--;) {
                this.count[i] = [this.col];
            }
        },
        draw: function() {
            var i, j;

            for (i = this.row; i--;) {
                for (j = this.col; j--;) {
                    if (this.count[i][j] !== false) {
                        if (Ball.x > this.x(j) && Ball.x <= (this.x(j) + this.w) && Ball.y >= this.y(i) && Ball.y <= (this.y(i) + this.h)) {
                            this.collide(i, j);
                            continue;
                        }
                        ctx.fillStyle = this.gradient(i);
                        ctx.fillRect(this.x(j), this.y(i), this.w, this.h);
                    }

                    if (this.total === (this.row * this.col)) {
                        Game.levelUp();
                    }
                }

            }
        },
        x: function(row) {
            return (row * this.w) + (row + this.gap);
        },
        y: function(col) {
            return (col * this.h) + (col + this.col);
        },
        gradient: function(row) {
            switch (row) {
                case 0: // purple
                    return this.gradientPurple ?
                        this.gradientPurple :
                        this.gradientPurple = this.makeGradient(row, '#bd06f9', '#9604c7');
                case 1: // red
                    return this.gradientRed ?
                        this.gradientRed :
                        this.gradientRed = this.makeGradient(row, '#F9064A', '#c7043b');
                case 2: // green
                    return this.gradientGreen ?
                        this.gradientGreen :
                        this.gradientGreen = this.makeGradient(row, '#05fa15', '#04c711');
                default: // orange
                    return this.gradientOrange ?
                        this.gradientOrange :
                        this.gradientOrange = this.makeGradient(row, '#faa105', '#c77f04');
            }
        },
        makeGradient: function(row, color1, color2) {
            var y = this.y(row);
            var grad = ctx.createLinearGradient(0, y, 0, y + this.h);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);

            return grad;
        },
        collide: function(i, j) {
            this.count[i][j] = false;
            Ball.sy = -Ball.sy;

            Hud.score += 1;
            this.total += 1;
        }
    };

    var Ball = {
        r: 10,
        init: function() {
            var uplv = Game.levelLimit(Hud.lv * 0.4);
            this.x = 120;
            this.y = 120;
            this.sx = 1 + uplv;
            this.sy = -1.5 - uplv;
        },
        draw: function() {
            this.edges();
            this.collide();
            this.move();

            var grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2);
            grd.addColorStop(0, "yellow");
            grd.addColorStop(1, "black");

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = grd;
            ctx.fill();
        },
        edges: function() {
            var ty = this.y + this.r;
            if (ty < 1) {
                this.y = 1;
                this.sy = -this.sy;
            } else if (ty > Game.height) {
                this.y = this.x = 1000;
                this.sy = this.sx = 0;
                // 游戏结束页面
                // 
                Game.overGame();
                return;
            }

            if (this.x < 1) {
                this.x = 1;
                this.sx = -this.sx;
            } else if (this.x > Game.width) {
                this.x = Game.width;
                this.sx = -this.sx;
            }

        },
        collide: function() {
            var ty = this.y + this.r;
            if (this.x >= Paddle.x && this.x <= (Paddle.x + Paddle.w) && ty > Paddle.y && ty >= (Paddle.y + Paddle.h)) {
                this.sx = 7 * ((this.x - (Paddle.x + Paddle.w / 2)) / Paddle.w);
                this.sy = -this.sy;
            }
        },
        move: function() {
            this.x += this.sx;
            this.y += this.sy;
        }
    };

    var Paddle = {
        w: 90,
        h: 20,
        r: 9,
        init: function() {
            this.x = 100;
            this.y = 210;
            this.speed = 4;
        },

        draw: function() {
            this.move();
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.arcTo(this.x + this.w, this.y, this.x + this.w, this.y + this.r, this.r);
            ctx.lineTo(this.x + this.w, this.y + this.h - this.r);
            ctx.arcTo(this.x + this.w, this.y + this.h, this.x + this.w - this.r, this.y + this.h, this.r);
            ctx.lineTo(this.x + this.r, this.y + this.h);
            ctx.arcTo(this.x, this.y + this.h, this.x, this.y + this.h - this.r, this.r);
            ctx.lineTo(this.x, this.y + this.r);
            ctx.arcTo(this.x, this.y, this.x + this.r, this.y, this.r);
            ctx.closePath();

            ctx.fillStyle = this.gradient();
            ctx.fill();
        },

        move: function() {
            if (Ctrl.left && (this.x < Game.width - (this.w / 2))) {
                this.x += this.speed;
            } else if (Ctrl.right && this.x > -this.w / 2) {
                this.x += -this.speed;
            }
        },

        gradient: function() {
            if (this.gradientCache) {
                return this.gradientCache;
            }

            this.gradientCache = ctx.createLinearGradient(this.x, this.y, this.x, this.y + 20);
            this.gradientCache.addColorStop(0, '#eee');
            this.gradientCache.addColorStop(1, '#999');

            return this.gradientCache;
        }
    };

    var Ctrl = {
        init: function() {
            window.addEventListener('keydown', this.keydown, true);
            window.addEventListener('keyup', this.keyup, true);
            window.addEventListener('mousemove', this.mouseMove, true);
        },
        keydown: function(event) {
            switch (event.keyCode) {
                case 39:
                    Ctrl.left = true;
                    break;
                case 37:
                    Ctrl.right = true;
                    break;
                default:
                    break;
            }
        },
        keyup: function() {
            switch (event.keyCode) {
                case 39:
                    Ctrl.left = false;
                    break;
                case 37:
                    Ctrl.right = false;
                    break;
                default:
                    break;
            }
        },
        mouseMove: function(event) {
            var mouseX = event.pageX;
            var canvasL = Game.canvas.offsetLeft; // canvas距离浏览器窗口左边的距离

            var paddleMid = Paddle.w / 2;

            if (mouseX > canvasL && mouseX < (canvasL + Game.width)) {
                var newX = mouseX - canvasL;

                newX -= paddleMid;

                Paddle.x = newX;
            }
        }
    };

    var Screen = {
        welcome: function() {
            this.text = 'welcome to Ricochet';
            this.textSub = 'Click to Play';
            this.textColor = 'white';

            this.create();
        },

        gameover: function() {
            this.text = 'Game Over';
            this.textSub = 'Click to retry';
            this.textColor = 'blue';

            this.create();
        },

        create: function() {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, Game.width, Game.height);
            ctx.fillStyle = this.textColor;
            ctx.textAlign = 'center';
            ctx.font = '40px helvetica, arial';
            ctx.fillText(this.text, Game.width / 2, Game.height / 2);

            ctx.fillStyle = 'red';
            ctx.font = "20px helvetica, arial";
            ctx.fillText(this.textSub, Game.width / 2, Game.height / 2 + 30);
        }
    };

    window.onload = function() {
        Game.setup();
    };

}());