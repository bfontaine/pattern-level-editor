;(function(editorTable, body, undefined) {

    /**
     * Listeners for the 'click' event. The key is a selector of the
     * element, the value is the function.
     **/
    var clickListeners = {},

        sizeSelector   = document.getElementById( 'size' ),
        editor         = new Editor( editorTable ),

        FILLED         = 'filled',

        currentWidth, currentHeight;

    function Editor( el ) {
        
        this.table = el;
    
    }

    /**
     * A level.
     * @cells [Array]: a boolean array
     **/
    function Level( cells ) {
        
        this.cells = cells;
    
    }

    /**
     * Initialize the editor.
     **/
    Editor.prototype.init = function initEditor( width, height ) {

        var i, j, tr, td, el;

        this.width = width;
        this.height = height;

        while ( el = this.table.firstChild ) {

            this.table.removeChild( el );

        }

        for (i=0; i<height; i++) {

            tr = document.createElement( 'tr' );

            for (j=0; j<width; j++) {

                tr.appendChild(document.createElement( 'td' ));

            }

            this.table.appendChild( tr );

        }

    };

    /**
     * Return the current level
     **/
    Editor.prototype.getLevel = function editor2level() {

        var lines = [].slice.call(this.table.children);

        return new Level(lines.map(function( l ) {

            return [].map.call(l.children, function( cell ) {

                return cell.className === FILLED;

            });

        }));

    };

    Level.prototype.getGameId = function levelToGameId() {

        var indicators = [],
            level      = this.cells,
            height     = this.cells.length,
            width      = this.cells[0].length,
            indicator, count, i, j;

        // vertical indicators
        for (i=0; i<width; i++) {

            count      = 0;
            indicator  = [];

            for (j=0; j<height; j++) {
                
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
        for (i=0; i<height; i++) {

            count      = 0;
            indicator  = [];

            for (j=0; j<width; j++) {
                
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


        return '' + width + 'x' + height +
                    ':' + indicators.join( '/' );

    }

    /**
     * Return the currently selected size of the level (width, height)
     **/
    function getSelectedSize() {

        var size = sizeSelector.value.split( 'x' ),
            w = +size[0], h = +size[1];

        return [ w, h || w ];

    }

    clickListeners['#new'] = function newLevel() {

        return editor.init.apply( editor, getSelectedSize() );

    };

    clickListeners['#export'] = function exportLevel() {

        prompt('Level ID:', editor.getLevel().getGameId());

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
