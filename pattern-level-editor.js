;(function(editorTable, body, undefined) {

    /**
     * Listeners for the 'click' event. The key is a selector of the
     * element, the value is the function.
     **/
    var clickListeners = {},

        sizeSelector   = document.getElementById( 'size' ),
        editor         = new Editor( editorTable ),
        loader         = document.getElementById( 'load' ),

        FILLED         = 'filled',

        currentWidth, currentHeight;

    // helper
    function removeChildren( el, e ) {

        while ( e = el.firstChild ) { el.removeChild( e ); }

    }

    function Editor( el ) {
        
        this.table = el;
    
    }

    /**
     * A level.
     * @cells [Array]: a boolean array
     **/
    function Level( cells ) {
        
        this.title = '';
        this.cells = cells;
        this.height = cells.length;
        this.width = this.height ? cells[ 0 ].length : 0;
    
    }

    /**
     * Initialize the editor.
     **/
    Editor.prototype.init = function initEditor( width, height ) {

        var i, j, tr, td, el;

        this.width = width;
        this.height = height;

        removeChildren( this.table );

        for (i=0; i<height; i++) {

            tr = document.createElement( 'tr' );

            for (j=0; j<width; j++) {

                var td = document.createElement( 'td' );

                if ( this.level && this.level.cells[i][j] ) {

                    td.className = FILLED;

                }

                tr.appendChild( td );

            }

            this.table.appendChild( tr );

        }

    };

    Editor.prototype.reset = function() {

        var size   = getSelectedSize(),
            width  = size[ 0 ],
            height = size[ 1 ],
            cells  = [],
            line, i, j;

        for ( i=0; i<height; i++ ) {

            line = [];

            for ( j=0; j<width; j++ ) {

                line.push( false );

            }

            cells.push( line );

        }

        this.level = new Level( cells );
        this.init( width, height );

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

    /**
     * Return the Game ID for a level
     **/
    Level.prototype.getGameId = function levelToGameId() {

        var indicators = [],
            level      = this.cells,
            height     = this.height,
            width      = this.width,
            indicator, count, i, j;

        // vertical indicators
        for (i=0; i<width; i++) {

            count      = 0;
            indicator  = [];

            for (j=0; j<height; j++) {
                
                if (level[j][i]) { count++; continue; }
                    
                if (count > 0) {

                    indicator.push(count);
                    count = 0;

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
                
                if (level[i][j]) { count++; continue; }
                    
                if (count > 0) {

                    indicator.push(count);
                    count = 0;

                }

            }

            if (count > 0) { indicator.push(count); }

            indicators.push( indicator.join( '.' ) );

        }

        return '' + width + 'x' + height +
                    ':' + indicators.join( '/' );

    }

    /**
     * Serialize a level
     **/
    Level.prototype.toString = function serializeLevel() {

        return this.cells.map(function( line ) {

            return line.map(function( cell ) {

                return cell ? '1' : '0';

            }).join('');

        }).join(',');

    };

    /**
     * Unserialize a level
     **/
    Level.unserialize = function unserializeLevel( str ) {

        var cells = str.split( ',' ).map(function( line ) {

            return line.split( '' ).map(function( chr ) {

                return chr === '1';

            });

        });

        return new Level(cells);

    };
    
    /**
     * Return a list of saved levels' titles.
     **/
    Editor.listSavedLevels = function listSavedLevels() {

        var titles = [], title;

        for ( title in localStorage ) {
            if ( !localStorage.hasOwnProperty( title ) ) {

                continue;

            }

            titles.push( title );

        }

        return titles;

    };

    Editor.prototype.loadLevel = function loadLevel( title ) {

        var serialized = localStorage.getItem( title );

        if ( !serialized ) { alert( 'No such level!' ); }

        this.level = Level.unserialize( serialized );

        this.level.title = title;

        this.init( this.level.width, this.level.height );

    };

    /**
     * Return the currently selected size of the level (width, height)
     **/
    function getSelectedSize() {

        var size = sizeSelector.value.split( 'x' ),
            w = +size[0], h = +size[1];

        return [ w, h || w ];

    }

    function updateSavedLevelsList() {

        removeChildren( loader );

        // list saved levels
        Editor.listSavedLevels().forEach(function( title ) {

            var opt = document.createElement( 'option' );

            opt.value = opt.innerText = title;

            loader.appendChild( opt );

        });

    }

    clickListeners['#new'] = function newLevel() {

        return editor.reset();

    };

    clickListeners['#export'] = function exportLevel() {

        if ( !editor.height || !editor.width ) { return; }

        prompt('Level ID:', editor.getLevel().getGameId());

    }

    clickListeners['#save'] = function saveLevel() {

        var level = editor.getLevel(),
            title = prompt( 'Title?', level.title );

        localStorage.setItem( title, level.toString() );

        updateSavedLevelsList();

    };

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
    
    loader.addEventListener( 'change', function( ev ) {

        var v = loader.selectedOptions[0].value;

        if ( v === '-' ) { return; }

        editor.loadLevel( v );

    });

    updateSavedLevelsList();

})(document.getElementById('editor'), document.getElementsByTagName('body')[0]);
