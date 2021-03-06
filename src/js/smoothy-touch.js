if (!window.smoothyTouch) {
    window.smoothyTouch = (function () {
        var doc = window.document;
        var _elem,
            counter = 0,
            _activeId = null;

        function _injectCustomParams(dest, inp) {
            for(var key in dest) {
                if(dest.hasOwnProperty(key)) {
                    if(inp[key] !== undefined) {
                        dest[key] = inp[key];
                    }
                }
            }
        }

        function _toSize(size) {
            if(/(px)|%$/.test(size)) {
                return size;
            }
            size = parseFloat(size);
            if(!size) {
                return false;
            }
            return size + '%';
        }

        function sidebar(customParams) {
            var sidebar = _elem,
                currentId = counter++,
                _isOpened;

            var allParams = {
                side: 'left',
                width: '90%',
                maxOpacity: 0.5,
                shadow: true
            },
                timeout;

            if(customParams.width) {
                customParams.width = _toSize(customParams.width);
            }

            _injectCustomParams(allParams, customParams);
            if(allParams.side !== 'left' && allParams.side !== 'right') {
                allParams.side = 'left';
            }

            var content = sidebar.innerHTML,
                isLeft = allParams.side === 'left',
                initialPos = -100,
                bg = getComputedStyle(sidebar, null).getPropertyValue('background');

            if(!isLeft) {
                initialPos = 100;
            }

            //TODO: Support px also
            sidebar.style.zIndex = 1001;
            sidebar.style.position = 'absolute';
            sidebar.innerHTML = '<div class="wrapper" style="width:'+ allParams.width + ';transform: translate3d('+ initialPos +'%,0,0);-webkit-transform: translate3d('+ initialPos +'%,0,0);position: fixed;'+ allParams.side +':0;top: 0;z-index: 10;height: 100vh;will-change:transform,box-shadow;overflow-y: auto;-webkit-overflow-scrolling: touch;-webkit-backface-visibility: hidden;background:'+ bg +'">'
                + content
                + '</div><div class="backflip'+ currentId +'"style="position:fixed;top:0;left:0;right:0;bottom:0;background:black;opacity:0;visibility:hidden;will-change:opacity;transform:translate3d(0,0,0);-webkit-backface-visibility:hidden;"></div>';

            document.querySelector('.backflip' + currentId).addEventListener('click', function () {
                toggle();
            });

            function disableSidebar() {
                doc.removeEventListener('touchstart', touchstart);
                doc.removeEventListener('touchmove', touchmove);
                doc.removeEventListener('touchcancel', touchend);
                doc.removeEventListener('touchend', touchend);
            }
            function enableSidebar() {
                //TODO: optimize for old browsers
                doc.addEventListener('touchstart', touchstart);
                doc.addEventListener('touchmove', touchmove);
                doc.addEventListener('touchend', touchend);
                doc.addEventListener('touchcancel', touchend);
            }

            sidebar.changeTransform = function(coords, isEnd) {
                coords.posX = coords.posX || 0;
                coords.posY = coords.posY || 0;
                coords.posZ = coords.posZ || 0;
                var newVal = 'translate3d(' + coords.posX + ',' + coords.posY + ',' + coords.posZ + ')';

                if(isEnd) {
                    this.children[0].style.WebkitTransitionDuration = '0.2s';
                    this.children[0].style.WebkitTransitionProperty = 'transform, -webkit-transform';
                } else {
                    this.children[0].style.WebkitTransitionDuration = '0s';
                }
                return this.children[0].style.webkitTransform = newVal;
            };

            sidebar.changeOpacity = function (val, isEnd) {
                if(val !== 0)  {
                    this.children[1].style.visibility = 'visible';
                    if(timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                }
                if(isEnd) {
                    this.children[1].style.WebkitTransition = 'opacity 0.2s';
                    if(val === 0) {
                        var self = this;
                        timeout = setTimeout(function () {
                            self.children[1].style.visibility = 'hidden';
                        }, 200);
                    }
                } else {
                    this.children[1].style.WebkitTransition = 'none';
                }
                return this.children[1].style.opacity = val;
            };

            sidebar._getCurrentPosition = function() {
                var coords = this.children[0].style.webkitTransform.match(/-?\d(?!d)[\.\d]*/g);
                coords = coords || [];

                return {
                    x: parseFloat(coords[0]),
                    y: parseFloat(coords[1]),
                    z: parseFloat(coords[2])
                }
            };

            sidebar._toggleShadow = function (isShadowed) {
                if(allParams.shadow) {
                    var wrap = sidebar.children[0];

                    if(!isShadowed) {
                        return wrap.style.boxShadow = '0 0 24px rgba(0,0,0,0.5)';
                    }
                    return wrap.style.boxShadow = null;
                }
            };

            function _getMeasure() {
                if(~allParams.width.indexOf('%')) {
                    return screen.width * customWidth / 100;
                }
                else if(~allParams.width.indexOf('px')) {
                    return customWidth;
                }
            }

            enableSidebar();

            var startEvt = null,
                curPos,
                newPos = 0,
                inc = 0,
                touchId = null,
                customWidth = parseInt(allParams.width, 10),
                measure = 0,
                isStarted = false,
                bodyEdgeLimit = 15,
                edgeCase,
                isDown;

            function touchstart(evt) {
                if(!isLeft) {
                    edgeCase = evt.touches[0].clientX < screen.width - bodyEdgeLimit;
                } else {
                    edgeCase = evt.touches[0].clientX > bodyEdgeLimit;
                }
                curPos = sidebar._getCurrentPosition().x;
                if(isNaN(curPos)) curPos = initialPos;
                if(evt.touches.length !== 1 || touchId !== null) {
                    return;
                }
                if(edgeCase && curPos === initialPos) {
                    return;
                }
                if(_activeId === null) {
                    _activeId = currentId;
                }
                isStarted = true;

                touchId = evt.touches[0].identifier;
                startEvt = evt;
                measure = _getMeasure();
                newPos = curPos;
            }

            function touchmove(evt) {
                //TODO: consider swipe speed
                if(_activeId !== currentId) {
                    return;
                }
                var nmbOfTouches = evt.changedTouches.length;
                for(var i = 0; i < nmbOfTouches; i++) {
                    if(evt.changedTouches[i].identifier !== touchId) {
                        return;
                    }
                    var diffX = evt.changedTouches[i].clientX - startEvt.touches[0].clientX,
                        diffY = evt.changedTouches[i].clientY - startEvt.touches[0].clientY;
                    if(isDown === null) {
                        isDown = Math.abs(diffX) <= Math.abs(diffY);
                    }

                    if(isDown === false) {
                        evt.preventDefault();
                    }

                    if(isDown === true) {
                        return;
                    }

                    inc = diffX * 100 / measure;
                    newPos = inc + curPos;
                    if(isLeft && (newPos > 0 || newPos < initialPos)) {
                        return;
                    }
                    if(!isLeft && (newPos < 0 || newPos > initialPos)) {
                        return;
                    }

                    sidebar._toggleShadow();
                    sidebar.changeTransform({posX: newPos + '%'});
                    sidebar.changeOpacity(Math.abs(initialPos - newPos) * allParams.maxOpacity / 100);
                }
            }
            function touchend() {
                isDown = null;
                if(!isStarted) {
                    return;
                }
                touchId = null;
                if((isLeft && newPos > initialPos/2) || (!isLeft && newPos < initialPos/2)) {
                    newPos = 0;
                    _activeId = currentId;
                    _isOpened = true;
                } else {
                    newPos = initialPos;
                    _activeId = null;
                    _isOpened = false;
                    sidebar._toggleShadow(true);
                }
                sidebar.changeTransform({posX: newPos + '%'}, true);
                sidebar.changeOpacity(Math.abs(initialPos - newPos) * allParams.maxOpacity / 100, true);
                curPos = newPos;
                isStarted = false;
            }

            function toggle() {
                var posX = sidebar._getCurrentPosition().x,
                    pos;

                if(posX === 0) {
                    pos = initialPos;
                    sidebar._toggleShadow(true);
                    _isOpened = false;
                } else {
                    pos = 0;
                    sidebar._toggleShadow();
                    _isOpened = true;
                }

                sidebar.changeTransform({posX: pos + '%'}, true);
                sidebar.changeOpacity(Math.abs(initialPos - pos) * allParams.maxOpacity / 100, true);
            }

            function isOpened() {
                return _isOpened;
            }

            return {
                toggle: toggle,
                disable: disableSidebar,
                enable: enableSidebar,
                isOpened: isOpened
            };
        }

        function getElement(elem) {
            if(typeof elem === 'string') {
                _elem = document.querySelector(elem);
            } else {
                _elem = elem;
            }

            return {
                sidebar: sidebar
            };
        }

        return getElement;
    })();
} else {
    console.log('SmoothyTouch variable already exist');
    window.smoothyTouch = {};
}