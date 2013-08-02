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
    }
};

datatableSelection.prototype = {
    _cellsSelectedCSS: 'yui3-datatable-cells-selected',
    _colsSelectedCSS: 'yui3-datatable-cols-selected',
    _rowsSelectedCSS: 'yui3-datatable-rows-selected',
        
    //append the column id to this
    _colSelector: '.yui3-datatable-data .yui3-datatable-col-',
   
    _colNameRegex: /yui3-datatable-col-(\S*)/,
   
    _currentRowsDelegate: null,
    _currentColsDelegate: null,
    _currentCellsDelegate: null,
    
    _selectedCells: [],

    getSelectedCells: function() {
        return _selectedCells;
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

    _selectCellsClick: function(e) {
        var target = e.currentTarget,
            colIndex = target.get('cellIndex'),
            rowIndex = target.get('parentNode.rowIndex'),
            numCols = this.get('columns').length;
            cellIndex = numCols*(rowIndex-2) + colIndex;
        
        target.toggleClass(this._cellsSelectedCSS);
        
        if (this._selectedCells[cellIndex]) {
            delete this._selectedCells[cellIndex];
        } else {
            this._selectedCells[cellIndex] = target;
        }
    },

    _selectColsClick: function(e) {
        var colName = this._colNameRegex.exec(e.currentTarget.getAttribute('class')),
            selector = this._colSelector + colName[1];

        this.view.tableNode.all(selector).toggleClass(this._colsSelectedCSS);
    },
    
    _selectRowsClick: function(e) {
        e.currentTarget.all('td').toggleClass(this._rowsSelectedCSS);
    }
};

Y.DataTable.select = datatableSelection;

Y.Base.mix(Y.DataTable, [Y.DataTable.select]);
