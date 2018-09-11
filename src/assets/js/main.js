/**
 * Laravel Routes
 * @type {{route}}
 */
var LaravelRoutes = new function() {

    var routes = null;

    /**
     * Load JSON
     * @param path
     * @param success
     * @param error
     */
    var loadJSON = function( path, success, error )
    {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function()
        {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (success)
                        success(JSON.parse(xhr.responseText));
                } else {
                    if (error)
                        error(xhr);
                }
            }
        };
        xhr.open( "GET", path, false );
        xhr.send();
    };

    /**
     * Get Router
     * @param name
     * @param callback
     * @returns {*}
     */
    var getRouter = function( name, callback )
    {
        if( typeof routes[ name ] !== 'undefined' ) {
            return callback( routes[ name ] );
        } else {
            console.log( 'route [' + name + '] does not exist' );
        }
    };

    /**
     * Generate Route Uri
     * @param router
     * @param _parameters
     * @returns {string}
     */
    var generateRouteUri = function( router, _parameters )
    {
        var parameters = _parameters || [];
        router.uri = router.path;
        router.uri_variables.forEach( function( variable ) {
            var replaceWith = parameters.shift() || null;
            var rExpression = new RegExp( "{" + variable + "\\??}", "g" );
            router.uri = router.uri.replace( rExpression, replaceWith );
        });
        return '/' + router.uri;
    };

    loadJSON( window.routesUrl ? window.routesUrl : '/routes.json', function( data ) {
        routes = data;
    });

    return {
        route : function( name, parameters )
        {
            return getRouter( name, function ( router ) {
                return generateRouteUri( router, parameters );
            });
        }
    }

};


/**
 * Ensphere Container
 */
$.fn.ensphere = new function() {

    /**
     *
     * @type {embargo}
     */
    this.embargo = new function() {

        /**
         * GUID
         * @returns {string}
         */
        var guid = function()
        {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        };

        /**
         * S4
         * @returns {string}
         */
        var s4 = function()
        {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };

        /**
         * Remove Page Loader
         */
        var removePageLoader = function()
        {
            var loader = $('#loader');
            if( loader.length ) {
                loader.fadeOut( 200, function(){
                    $(this).remove();
                });
            }
        };

        /**
         * Distribute Api Requests
         */
        var distributeApiRequests = function()
        {
            var methods = [];
            $('[data-api]').each( function(){
                var _guid = guid();
                $(this).attr( 'data-guid', _guid );
                var _data = {
                    method : $(this).attr( 'data-api' ),
                    callback : $(this).attr( 'data-api-callback' ),
                    modelId : $(this).attr( 'data-model-id' ),
                    guid : _guid
                };
                if( $(this).attr( 'data-api-data' ) ) {
                    _data.data = $(this).attr( 'data-api-data' );
                }
                methods.push( _data );
            });
            if( ! methods.length ) return;
            $.get( '/api/render', { actions : methods, from : window.location.href }, function( responses ) {
                for( var i in responses ) {
                    if( typeof window[responses[i].callback] !== 'undefined' ) {
                        window[responses[i].callback](responses[i].response, $('[data-guid="' + responses[i].guid + '"]') );
                    } else {
                        console.log( '[API Renderer] ' + responses[i].callback + ' is not a valid api callback' );
                    }
                }
            });
        };

        /**
         * Responsive Images
         */
        var responsiveImages = function()
        {

            var parser = document.createElement('a');
            var width = $(window).width();
            var onLoadBreakPoint = 0;
            var selectedBreakPoints = [ 1500, 1200, 992, 768, 480 ];

            /**
             * Get Break Point
             * @returns {number}
             */
            var getBreakPoint = function()
            {
                var breakPoint = 0;
                selectedBreakPoints.forEach( function ( point ) {
                    if( width >= point && ! breakPoint ) {
                        breakPoint = point;
                    }
                });
                return breakPoint;
            };

            /**
             * Reload THe Images
             */
            window.reloadImages = function()
            {
                $('[data-responsive]').each( function() {
                    if( $( this ).prop( 'tagName' ).toLowerCase() === 'img' ) {
                        parser.href = $( this ).attr( 'src' );
                        $( this ).attr( 'src', parser.pathname + ( onLoadBreakPoint ? '?r=' + onLoadBreakPoint : '' ) );
                    } else {

                        var img = $( this ).get(0);
                        var style = img.currentStyle || window.getComputedStyle( img, false );
                        img = style.backgroundImage.slice( 4, -1 ).replace( /"/g, "" ).replace( /'/g, "" );
                        if( img ) {
                            parser.href = img;
                            var url = String( parser.pathname + ( onLoadBreakPoint ? '?r=' + onLoadBreakPoint : '' ) );
                            $( this ).css( 'background-image', 'url("' + url + '")' );
                        }
                    }
                });
            };

            /**
             * Resize Handler
             */
            window.onWindowResizeHandleImageSizes = function()
            {
                width = $(window).width();
                var newBreakPoint = parseInt( getBreakPoint() );
                if( newBreakPoint !== onLoadBreakPoint ) {
                    onLoadBreakPoint = newBreakPoint;
                    reloadImages();
                }
            };

            $(window).on( 'resize.responsive', onWindowResizeHandleImageSizes );
            window.onWindowResizeHandleImageSizes();

        };

        /**
         * Sets up ajax calls
         */
        var ajaxSetup = function()
        {
            var _token = $('[name="csrf-token"]');
            if( _token.length ) {
                $.ajaxSetup({
                    headers: {
                        'X-CSRF-Token': _token.attr( 'content' )
                    }
                });
            }
        };

        /**
         * On Document Ready
         */
        var onDocumentReady = function()
        {
            distributeApiRequests();
            responsiveImages();
            ajaxSetup();
        };

        /**
         * On Window Load
         */
        var onWindowLoad = function()
        {
            removePageLoader();
        };

        $(document).ready( onDocumentReady );
        $(window).load( onWindowLoad );

        return {

            route : function( name, parameters )
            {
                return LaravelRoutes.route( name, parameters );
            }

        }

    };
};
