function datatableSelection() {}

datatableSelection.ATTRS = {
    selectableRows: {
        value: false,
        setter: '_setSelectableRows',
        validator: Y.Lang.isBoolean
    },
    selectableCols: {
        value: false,
        setter: '_setSelectableCols',
        validator: Y.Lang.isBoolean
    },
    selectableCells: {
        value: false,
        setter: '_setSelectableCells',
        validator: Y.Lang.isBoolean
    },
    selectionType: {
        value: 'single',
        setter: '_setSelectionType',
        validator: Y.Lang.isString
    }
};

datatableSelection.prototype = {
    _cellsSelectedCSS: 'yui3-datatable-cells-selected',
    _colsSelectedCSS: 'yui3-datatable-cols-selected',
    _rowsSelectedCSS: 'yui3-datatable-rows-selected',
        
    //append the column id to this
    _colSelector: '.yui3-datatable-data .yui3-datatable-col-',
   
    _colNameRegex: /yui3-datatable-col-(\S*)/,
   
    _selectionType: 'single',

    _currentRowsDelegate: null,
    _currentColsDelegate: null,
    _currentCellsDelegate: null,
    
    _selectedCells: {},

    getSelectedCells: function() {
        var numCols = this.get('columns').length,
            selectedCells = [];

        for (var cellIndex in this._selectedCells) {
            row = Math.floor(cellIndex / numCols);
            selectedCells.push(this.getCell([row, cellIndex - row*numCols]));
        }
        return selectedCells;
    },

    _setSelectionType: function (type) {
        this._selectionType = type;
    },

    _setSelectableRows: function (selectingRows) {
        if (selectingRows) {
            if (this._currentRowsDelegate) {
                this._currentRowsDelegate.detach();
            }
            
            this._currentRowsDelegate = this.delegate('click', 
                Y.bind(this._selectRowsClick, this),
            "tr");
        }
    },

    _setSelectableCols: function (selectingCols) {
        if (selectingCols) {
            if (this._currentColsDelegate) {
                this._currentColsDelegate.detach();
            }

            this._currentColsDelegate = this.delegate('click', 
                Y.bind(this._selectColsClick, this),
            "tr td");
        }
    },

    _setSelectableCells: function (selectingCells) {
        if (selectingCells) {
            if (this._currentCellsDelegate) {
                this._currentCellsDelegate.detach();
            }

            this._currentCellsDelegate = this.delegate('click', 
                Y.bind(this._selectCellsClick, this), 
            "tr td");
        }
    },

    _lastCellIndex: -1, 

    _selectCellsClick: function(e) {
        var target = e.currentTarget,
            colIndex = target.get('cellIndex'),
            rowIndex = target.get('parentNode.rowIndex') - 2,
            numCols = this.get('columns').length,
            cellIndex = numCols*rowIndex + colIndex;
        
        //clear selection that happens on shift-click
        window.getSelection().removeAllRanges();

        if (!e.altKey) {
            this.view.tableNode.all('tr td').removeClass(this._cellsSelectedCSS);
            this._selectedCells = {};
        }

        target.toggleClass(this._cellsSelectedCSS);

        if (e.shiftKey && this._lastCellIndex > -1 && 
                (this._selectionType === "range" || this._selectionType === "block")) {

            if (this._selectionType === "range") {
                var direction = this._lastCellIndex > cellIndex,
                    start = direction ? cellIndex : this._lastCellIndex,
                    end = direction ? this._lastCellIndex : cellIndex,
                    rows = 0,
                    i = 0;

                for (i = start;i <= end;i++) {
                    rows = Math.floor(i/numCols);
                    curRecord = this.getCell([rows, i - rows*numCols]);
                    this._selectedCells[numCols*rows + (i - rows*numCols)] = curRecord;
                    curRecord.addClass(this._cellsSelectedCSS);
                }
            } else if (this._selectionType === "block") {
                var row = 0,
                    col = 0,
                    startRow = Math.floor(cellIndex/numCols),
                    endRow = Math.floor(this._lastCellIndex/numCols),
                    startCol = cellIndex - startRow*numCols,
                    endCol = this._lastCellIndex - endRow*numCols,
                    temp = null;
                
                //switch the starts and ends for the for loop if needed.
                if (startRow > endRow) {
                    temp = startRow;
                    startRow = endRow;
                    endRow = temp;
                }
                if (startCol > endCol) {
                    temp = startCol;
                    startCol = endCol;
                    endCol = temp; 
                }

                for (col = startCol;col <= endCol;col++) {
                    for (row = startRow;row <= endRow;row++) {
                        curRecord = this.getCell([row, col]);
                        this._selectedCells[numCols*row + col] = curRecord;
                        curRecord.addClass(this._cellsSelectedCSS);
                    }
                }
            }
        } else {
            if (this._selectedCells[cellIndex]) {
                delete this._selectedCells[cellIndex];
            } else {
                this._selectedCells[cellIndex] = target;
            }

            this._lastCellIndex = cellIndex;
        }

        this.fire('cellSelectionChange');
    },

    _selectedCols: [],
    _lastColIndex: -1,

    _selectColsClick: function(e) {
        var target = e.currentTarget,
            colIndex = target.get('cellIndex'),
            rowIndex = target.get('parentNode.rowIndex') - 2,
            colName = this._colNameRegex.exec(e.currentTarget.getAttribute('class')),
            selector = this._colSelector + colName[1],
            i = 0;

        if (!e.altKey) {
            this.view.tableNode.all('tr td').removeClass(this._colsSelectedCSS);
            this._selectedCols = [];
        }

        //clear selection that happens on shift-click
        window.getSelection().removeAllRanges();

        if (e.shiftKey && this._lastColIndex > -1) {
            var start = colIndex > this._lastColIndex ? this._lastColIndex : colIndex,
                end = colIndex > this._lastColIndex ? colIndex : this._lastColIndex;

            for (i = start;i <= end;i++) {
                this.view.tableNode.all(this._colSelector + this.getColumn(i)._id).addClass(this._colsSelectedCSS);
                this._selectedCols[colIndex] = true;
            }
        } else {
            this.view.tableNode.all(selector).toggleClass(this._colsSelectedCSS);

            if (this._selectedCols[colIndex]) {
                delete this._selectedCols[colIndex];
            } else {
                this._selectedCols[colIndex] = true;
            }
            this._lastColIndex = colIndex;
        }

        this.fire('colSelectionChange');
    },
    
    _selectedRows: [],
    _lastRowIndex: -1,

    _selectRowsClick: function(e) {
        var target = e.currentTarget,
            rowIndex = target.get('rowIndex') - 2;

        if (!e.altKey) {
            this.view.tableNode.all('td').removeClass(this._rowsSelectedCSS);
            this._selectedCols = [];
        }

        //clear selection that happens on shift-click
        window.getSelection().removeAllRanges();
        
        if (e.shiftKey && this._lastRowIndex > -1) {
            var start = rowIndex > this._lastRowIndex ? this._lastRowIndex : rowIndex,
                end = rowIndex > this._lastRowIndex ? rowIndex : this._lastRowIndex;

            for (i = start;i <= end;i++) {
                this.getRow(i).all('td').addClass(this._rowsSelectedCSS);
                this._selectedRows[rowIndex] = true;
            }
        } else {
            target.all('td').toggleClass(this._rowsSelectedCSS);

            if (this._selectedRows[rowIndex]) {
                delete this._selectedRows[rowIndex];
            } else {
                this._selectedRows[rowIndex] = true;
            }
            this._lastRowIndex = rowIndex;
        }

        this.fire('rowSelectionChange');
    }
};

Y.DataTable.Selection = datatableSelection;

Y.Base.mix(Y.DataTable, [Y.DataTable.Selection]);
