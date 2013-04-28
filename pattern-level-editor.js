;(function(editor, body, undefined) {

    /**
     * Listeners for the 'click' event. The key is the id of the
     * element, the value is the function.
     **/
    var clickListeners = {},

        sizeSelector   = document.getElementById( 'size' ),

        FILLED         = 'filled',

        currentWidth, currentHeight;

    function initEditor( width, height ) {

        var i, j, tr, td, el;

        currentWidth = width;
        currentHeight = height;

        while ( el = editor.firstChild ) {

            editor.removeChild( el );

        }

        for (i=0; i<height; i++) {

            tr = document.createElement( 'tr' );

            for (j=0; j<width; j++) {

                tr.appendChild(document.createElement( 'td' ));

            }

            editor.appendChild( tr );

        }

    }

    function getSelectedSize() {

        var size = sizeSelector.value.split( 'x' );

        return [ +size[0], size[1] ? +size[1] : +size[0] ];

    }

    /**
     * Return the current level as a boolean array:
     *
     *  [
     *      [  true, false, ... ],
     *      [ false, false, ... ],
     *      ...
     *  ]
     *
     **/
    function levelToArray() {

        var lines = [].slice.call(editor.children);

        return lines.map(function( l ) {

            return [].map.call(l.children, function( cell ) {

                return cell.className === FILLED;

            });

        });

    }

    function levelToString() {

        var indicators = [],
            level      = levelToArray(),
            indicator, count, i, j;

        // vertical indicators
        for (i=0; i<currentWidth; i++) {

            count      = 0;
            indicator  = [];

            for (j=0; j<currentHeight; j++) {
                
                if (!level[j][i]) {
                    
                    if (count > 0) {

                        indicator.push(count);
                        count = 0;

                    }
                
                } else {

                    count++;

                }

            } 
            if (count > 0) { indicator.push(count); }

            indicators.push( indicator.join( '.' ) );

        }

        // horizontal indicators
        for (i=0; i<currentHeight; i++) {

            count      = 0;
            indicator  = [];

            for (j=0; j<currentWidth; j++) {
                
                if (!level[i][j]) {
                    
                    if (count > 0) {

                        indicator.push(count);
                        count = 0;

                    }
                
                } else {

                    count++;

                }

            }
            if (count > 0) { indicator.push(count); }

            indicators.push( indicator.join( '.' ) );

        }


        return '' + currentWidth + 'x' + currentHeight +
                    ':' + indicators.join( '/' );

    }

    clickListeners['#new'] = function newLevel() {

        return initEditor.apply( null, getSelectedSize() );

    };

    clickListeners['#export'] = function exportLevel() {

        prompt('Level ID:', levelToString());

    }

    clickListeners['td'] = function toggleCellState() {

        this.className = this.className.length ? '' : FILLED;

    };

    body.addEventListener( 'click', function( ev ) {

        var target = ev.target, selectors;

        if (!target || !target.nodeName) { return; }
        
        return [ '#' + target.id,
                 target.nodeName.toLowerCase() ].forEach(function( sel ) {

            if ( clickListeners.hasOwnProperty( sel ) ) {

                return clickListeners[ sel ].call( target, ev );

            }

        });

    }, false);

})(document.getElementById('editor'), document.getElementsByTagName('body')[0]);
