/**
 * Created by sk on 2016/6/28.
 */

    "use strict";

    function rotateAnimation (userConfig) {
        var config = {
            data: [
                [0,1,2,3,4,5,6,7,8,9],
                [0,1,2,3,4,5,6,7,8,9],
                [0,1,2,3,4,5,6,7,8,9],
                [0,1,2,3,4,5,6,7,8,9],
                ['天']
            ],
            delay:600
        };

        config = $.extend(config,userConfig);

        console.log(config)

        var cardNumber = config.data.length;
        var nodeUlArr = [];
        var nodeLiArr = [];
        function creatrCardList () {
            var nodeUl,nodeLi;
            console.log(config.parentNode);
            for(var i = 0; i < cardNumber; i++) {
                nodeUl = document.createElement('ul');
                nodeUl.className = 'card_content_list';
                nodeLiArr = [];
                for(var j = 0,len = config.data[i].length; j < len; j++) {
                    nodeLi = document.createElement('li');
                    nodeLi.className = 'chirld_page';
                    nodeLi.innerHTML = '<i>' + config.data[i][j] + '</i><p class="is_back"><p>';
                    nodeUl.appendChild(nodeLi);
                    nodeLiArr[j] = nodeLi;

                    if(i == cardNumber - 1) {
                        nodeLi.className = 'chirld_page unit';
                    }
                }
                nodeUlArr[i] = {
                    nodeUl: nodeUl,
                    child: nodeLiArr
                    };
                config.parentNode.appendChild(nodeUl);
            }

            console.log(nodeUlArr)
        }

        function rotate (node) {
            if(node) {
                node.style.webkitTransform = 'rotateX(359deg) rotateZ(-360deg)';
            setTimeout(function () {
                node.style.opacity = '0'
            },config.delay)
            } 
        }

        function move (number) {
            var numArr = number.toString().split('');
            var x = numArr.length - 1, y = 9;

            var dingshiqi = setInterval(function () {
                if(x == 0 && y == numArr[x]) {
                    clearInterval(dingshiqi);
                } else {
                    if(y == numArr[x]) {
                    y = 9;
                    x--;
                    } else {
                         y--;
                    }
                } 
                rotate(nodeUlArr[x].child[y+1]);
            },config.delay)
        }

        var init = function () {
            creatrCardList();
        }.call(this);

        return {
            move:move
        }

    }

