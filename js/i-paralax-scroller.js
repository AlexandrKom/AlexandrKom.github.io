/* eslint-disable no-magic-numbers, no-new */
( function( $ ) {
    window.requestAnimFrame = ( function() {
        return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.oRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function( callback ) {
                window.setTimeout( callback, 1000 / 60 );
            };
    } )();

    function ParallaxScroller( o ) {
        var self = this;

        this.init =  function( opt ) {
            self.world = window;
            self.bounds = self._getBounds();
            self.busy = !1;
            self.holdersWrapper = $('<div>').addClass('i-parallax-scroller__holders-wrapper');
            self.items = $( '.i-parallax-scroller__section', self.sectionsWrapper ) || [];
            self.scrollDistance = 0;
            self.sectionsWrapper = $( opt.sectionsWrapper );
            self.speed = opt.speed;
            self.supportedFeatures = self.applyCssGetSupportedFeatures();
            self.tiles = [];
            self.items.each( function() {
                var $this = $( this ),
                    $scrollerHolder = $( '<div class="i-parallax-scroller__holder"><img src="'
                        + $this.data('image')
                        + '" class="i-parallax-scroller__tile" /></div>'
                    );

                var currentH = 0.75 * self.bounds.height,
                    extraH = $this.data('extra-height') || 0;

                currentH = ( 200 < currentH ? currentH : 200 ) + extraH;

                $this.height( currentH );

                self.holdersWrapper.prepend( $scrollerHolder );
                $this.data( 'holder', $scrollerHolder );
            } );
            self.sectionsWrapper.before( self.holdersWrapper );
            $( window ).on( 'load', function() {
                self._initTiles();
                self._updateTiles();
            } );
            $( window ).resize( function() {
                self._initTiles();
                self._requestTick();
            } );
            $( window ).scroll( function( e ) {
                self.scrollDistance = self._getScrollDistance( e );
                self._requestTick();
            } );
        };

        this.applyCssGetSupportedFeatures = function() {
            return window.Modernizr ? {
                csstransforms3d : Modernizr.csstransforms3d,
                csstransforms   : Modernizr.csstransforms,
            } : {
                csstransforms3d : !1,
                csstransforms   : !1,
            };
        };

        this._getBounds = function() {
            var $window = self.world;

            if ( !$window ) {
                return null;
            }

            if ( $window === window ) {
                $window = self.getWindowSize();

                return {
                    width  : $window.width,
                    height : $window.height,
                };
            }

            return {
                width  : $window.offsetWidth,
                height : $window.offsetHeight,
            };
        };

        this._initTiles = function() {
            var boundsW,
                boundsH;

            self.bounds = self._getBounds();

            boundsW = self.bounds.width;
            boundsH = self.bounds.height;

            self.items.each( function() {
                var currentH,
                    extraH,
                    itemW,
                    itemH,
                    currentBgW,
                    tile,
                    $item = $( this ),
                    $itemHolder = $item.data('holder');

                $itemHolder.width( boundsW );

                currentH = 0.75 * boundsH;
                extraH = $item.data('extra-height') || 0;
                currentH = ( 200 < currentH ? currentH : 200 ) + extraH;

                $item.height( currentH );

                itemW = $item.data('width');
                itemH = $item.data('height');
                extraH = boundsH - ( boundsH - currentH ) * self.speed;

                currentBgW = itemW * ( extraH / itemH );

                if ( currentBgW >= boundsW ) {
                    itemW = extraH;
                }
                else {
                    currentBgW = boundsW;
                    itemW = itemH * ( currentBgW / itemW );
                }

                tile = new self.Tile( {
                    main                  : $item[0],
                    holder                : $itemHolder[0],
                    holderWidth           : boundsW,
                    holderHeight          : currentH,
                    backgroundWidth       : currentBgW,
                    backgroundHeight      : itemW,
                    initBackgroundOffsetX : -( currentBgW - boundsW ) / 2,
                    initBackgroundOffsetY : -( itemW - extraH ) / 2,
                    visibility            : 'hidden',
                } );

                self.tiles.push( tile );
            } );
        };

        this._requestTick = function() {
            if ( !self.busy ) {
                self.busy = !0;
                window.requestAnimFrame( function() {
                    self._updateTiles();
                } );
            }
        };

        this._updateTiles = function() {
            var scrollTop = self.scrollDistance,
                scrollBottom = self.scrollDistance + ( self.bounds ? self.bounds.height : self._getBounds().height ),
                i,
                currentTile,
                tileOffset,
                tilesLength = self.tiles.length;

            for ( i = 0; i < tilesLength; i++ ) {
                currentTile = self.tiles[i];
                tileOffset = currentTile.initHolderLocation.y;

                if (
                    scrollTop < currentTile.initHolderLocation.y + currentTile.holderHeight
                    && scrollBottom > tileOffset
                ) {
                    currentTile.holderLocation.y = currentTile.initHolderLocation.y - self.scrollDistance;
                    currentTile.backgroundOffset.y = currentTile.initBackgroundOffset.y
                        - currentTile.holderLocation.y
                        + currentTile.holderLocation.y * self.speed;
                    currentTile.visibility = 'visible';
                }
                else {
                    currentTile.visibility = 'hidden';
                }

                if ( currentTile.visibility == 'visible' && i == tilesLength - 1 ) {
                    if ( scrollTop > currentTile.initHolderLocation.y ) {
                        currentTile.backgroundOffset.y = currentTile.initBackgroundOffset.y
                            - currentTile.holderLocation.y
                            - ( scrollTop - currentTile.initHolderLocation.y );
                    }
                }

            }

            for ( i = 0; i < tilesLength; i++ ) {
                self.tiles[i].draw();
            }

            self.busy = !1;
        };

        this._getScrollDistance = function( e ) {
            return e.target ? e.target.body.scrollTop || document.documentElement.scrollTop
                : e.srcElement ? e.srcElement.body.scrollTop || document.documentElement.scrollTop
                    : document.documentElement.scrollTop;
        };

        this.Tile = function( o ) {
            var tile = {
                init : function( o ) {
                    this.main = o.main;
                    this.holder = o.holder;
                    this.img = this.holder.firstChild;
                    this.initBackgroundOffset = {
                        x : o.initBackgroundOffsetX || 0,
                        y : o.initBackgroundOffsetY || 0,
                    };
                    this.backgroundOffset = {
                        x : this.initBackgroundOffset.x,
                        y : this.initBackgroundOffset.y,
                    };
                    this.backgroundWidth = o.backgroundWidth || 0;
                    this.backgroundHeight = o.backgroundHeight || 0;
                    this.initHolderLocation = {
                        x : $( this.main ).offset().left,
                        y : $( this.main ).offset().top,
                    };
                    this.holderLocation = {
                        x : this.initHolderLocation.x,
                        y : this.initHolderLocation.y,
                    };
                    this.holderWidth = o.holderWidth || 0;
                    this.holderHeight = o.holderHeight || 0;
                    this.visibility = o.visibility || 'visible';
                },
                draw : function() {
                    self.applyCss(
                        this.holder,
                        {
                            x          : this.holderLocation.x,
                            y          : this.holderLocation.y,
                            width      : this.holderWidth,
                            height     : this.holderHeight,
                            visibility : this.visibility,
                        }
                    );
                    self.applyCss(
                        this.img,
                        {
                            x          : this.backgroundOffset.x,
                            y          : this.backgroundOffset.y,
                            width      : this.backgroundWidth,
                            height     : this.backgroundHeight,
                            visibility : this.visibility,
                        }
                    );
                },
            };

            tile.init( o );

            return tile;
        };

        this.getWindowSize = function() {
            var size = {
                width  : !1,
                height : !1,
            };

            if ( 'undefined' !== typeof window.innerWidth ) {
                size.width = window.innerWidth;
            }
            else if (
                'undefined' !== typeof document.documentElement
                && 'undefined' !== typeof document.documentElement.clientWidth
            ) {
                size.width = document.documentElement.clientWidth;
            }
            else {
                'undefined' !== typeof document.body && ( size.width = document.body.clientWidth );
            }

            if ( 'undefined' !== typeof window.innerHeight ) {
                size.height = window.innerHeight;
            }
            else if (
                'undefined' !== typeof document.documentElement
                && 'undefined' !== typeof document.documentElement.clientHeight
            ) {
                size.height = document.documentElement.clientHeight;
            }
            else {
                'undefined' !== typeof document.body && ( size.height = document.body.clientHeight );
            }

            return size;
        };

        this.applyCss = function( node, nodeDimension ) {
            var cssStyles = [],
                translateX = ( nodeDimension.x || 0 ) | 0,
                translateY = ( nodeDimension.y || 0 ) | 0;

            if ( 0 != translateX || 0 != translateY ) {
                if ( self.supportedFeatures.csstransforms3d ) {
                    cssStyles = cssStyles.concat( [
                        '-webkit-transform: translate3d(' + translateX + 'px, ' + translateY + 'px, 0)',
                        '-moz-transform: translate3d(' + translateX + 'px, ' + translateY + 'px, 0)',
                        '-o-transform: translate3d(' + translateX + 'px, ' + translateY + 'px, 0)',
                        '-ms-transform: translate3d(' + translateX + 'px, ' + translateY + 'px, 0)',
                    ] );
                }
                else if ( self.supportedFeatures.csstransforms ) {
                    cssStyles = cssStyles.concat( [
                        '-webkit-transform: translateX(' + translateX + 'px) translateY(' + translateY + 'px)',
                        '-moz-transform: translateX(' + translateX + 'px) translateY(' + translateY + 'px)',
                        '-o-transform: translateX(' + translateX + 'px) translateY(' + translateY + 'px)',
                        '-ms-transform: translateX(' + translateX + 'px) translateY(' + translateY + 'px)',
                    ] );
                }
                else {
                    cssStyles = cssStyles.concat( [
                        'position: absolute',
                        'left: ' + translateX + 'px',
                        'top: ' + translateY + 'px',
                    ] );
                }
            }

            if ( nodeDimension.backgroundImageUrl ) {
                cssStyles.push( 'background-image: url("' + nodeDimension.backgroundImageUrl + '")' );
            }

            if ( nodeDimension.width ) {
                cssStyles.push( 'width: ' + ( nodeDimension.width | 0 ) + 'px' );
            }

            if ( nodeDimension.height ) {
                cssStyles.push( 'height: ' + ( nodeDimension.height | 0 ) + 'px' );
            }

            if ( nodeDimension.visibility ) {
                cssStyles.push( 'visibility: ' + nodeDimension.visibility );
            }

            node.style.cssText = cssStyles.join(';');
        };

        this.init( o );

        return this;
    }

    $.fn.parallaxScroller = function( opts ) {
        var o;

        if ( ( Modernizr.csstransforms || Modernizr.csstransforms ) && !Modernizr.touch ) {
            o = $.extend( {
                speed           : 0.1,
                sectionsWrapper : this,
            }, opts || {} );

            new ParallaxScroller( o );
        }
        else {
            $( this ).find('.i-parallax-scroller__section').each( function() {
                var $section = $( this );

                $section.css( {
                    backgroundImage    : 'url(' + $section.data('image') + ')',
                    backgroundSize     : 'cover',
                    backgroundPosition : 'center center',
                    height             : '540px',
                } );
            } );
        }

        return this;
    };
} )( jQuery );
