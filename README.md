# rb-table

Declarative React table component with highly customizable scroll and layout feature

## Festures
- Declarative react table component.
- Advanced table layout with width / minWidth / maxWidth support.
- Fixed header and columns support.
- Seamingless scroll behaviour on fixed header/columns mode.  
- Customized scrollbar style.
- Less and Sass with variables defined.

## Getting started
For npm:
```
npm install --save rb-table
```
Add the default stylesheet, you can choose css/sass/less version by just change the suffix.
```shell
import 'rb-table/dist/rb-table.css';
```
For cdn version

```html
<script src="https://unpkg.com/rb-table@1/dist/rb-table.bundle.min.js" crossorigin></script>
```
Put `<RBTable/>` in your page with props and you are good to go.

```javascript
<RBTable 
	columns={[
		{ header: () => 'header 1', cell: i => i },
		{ header: 'header 2', cell: i => i },
		{ header: <span>header 3</span>, cell: i => i }
	]}
    data={[1,2,3]}
/>
```

## Api

### RBTable Props
| Property  | Description  | Type  | Default  |
| ------------ | ------------ | ------------ | ------------ |
| columns | Columns of table  | Array<[ColumnProps](#ColumnProps)>  | - |
|  data | Data to be displayed  | Array	&#60;any&#62;  | - |
| onRowClick  | Event callback on row click, if provided an extra class 'rb-table-row--clickable' will append to each body row    | function  | - |
| prefixCls  | Classname prefix, if specified must use with less/sass style and override  variable `@prefix-rb-table` with the same value | string  | 'rb-table' |

### ColumnProps

| Property  | Description  | Type  |
| ------------ | ------------ | ------------ |
| header | Render column header  | string &#124; number &#124; element &#124; function(data, column)  |
|  cell | Render column cell  | string &#124; number &#124; element &#124; function(rowData, data, column)  |
|  width | Specify column width in `px`, if not specify the width will be auto calculate to fit content in one row, when the total width of table is exceed a horizontal scrollbar will be show | number |
|  minWidth | Specify column minimum  width in `px` only when width is not set | number |
|  maxWidth | Specify column maximum width in `px` only when width is not set | number |
|  fixed | Specify column to be fixed on left or right, if not specified will scroll when it is neccessary  | 'left' &#124; 'right' |
|  cellClassName | Additional cell class | string |
|  cellStyle | Additional cell style | object |
|  headerClassName | Additional header class | string |
|  headerStyle | Additional header style | object |


## Customize Theme
`rb-table` provide the less/scss style file with predefined theme variables, so you can easily customize the look by modifying these variable as well as override the default style. if you are useing wepack, bellow is an example as well as a complete list of variables:
```less
// my-rb-table.less
@import "~rb-table"
@prefix-rb-table: rb-table;
@rb-table-scroll-bar-color: ; @your-primary-color // default #777
@rb-table-cell-border-color: #f0f0f0;
@rb-table-scroll-bar-background: #eee;
@rb-table-scroll-bar-width: 10px;
@rb-table-scroll-bar-padding: 1px;
@rb-table-scroll-bar-right-offset: 2px;
@prefix-rb-table-padding: (@rb-table-scroll-bar-width + 5px);
@rb-table-background: #FFF;
@rb-table-color: #333;
@rb-table-row-hover-background: lighten(@rb-table-scroll-bar-color, 55%);
```

Browser Support
------------

| Chrome        | Firefox           | IE  | Safari 
--- | --- | --- | --- |
| Latest | Latest | 11+ | Latest |

Contributions
------------

Use [GitHub issues](https://github.com/sijiecai/rb-table/issues) for requests.

Pull requests are most welcome; 

Changelog
---------

Changes are tracked as [GitHub releases](https://github.com/sijiecai/rb-table/releases).


License
-------

`rb-table` is [MIT-licensed](https://github.com/SijieCai/rb-table/blob/master/LICENSE).