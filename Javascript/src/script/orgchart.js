import { Keys, DiagramTools, SelectorConstraints, SnapConstraints, NodeConstraints, KeyModifiers, DiagramConstraints, cloneObject, ConnectorConstraints } from '@syncfusion/ej2-diagrams';
import { DataManager } from '@syncfusion/ej2-data';
import { MindMapUtilityMethods } from './mindmap';
import { CustomProperties } from './customproperties';
import { CommonKeyboardCommands } from './commoncommands';
export class OrgChartData {
    constructor(selectedItem1) {
        this.selectedItem = selectedItem1;
    }
    getCommandSettings() {
        const commandManager = {
            commands: [{
                    gesture: { key: Keys.Tab }, canExecute: this.canExecute,
                    execute: this.addChild.bind(this), name: 'SubChild'
                },
                {
                    gesture: { key: Keys.Enter }, canExecute: this.canExecute,
                    execute: this.addRightChild.bind(this), name: 'SameLevelSubChild'
                },
                {
                    gesture: { key: Keys.Tab, keyModifiers: KeyModifiers.Shift }, canExecute: this.canExecute,
                    execute: this.changeChildParent.bind(this), name: 'sibilingChildTop'
                },
                {
                    gesture: { key: Keys.Delete }, canExecute: this.canExecute,
                    execute: this.removeChild.bind(this), name: 'deleteChid'
                },
                {
                    gesture: { key: Keys.Down }, canExecute: this.canExecute,
                    execute: this.navigateBottomChild.bind(this), name: 'navigationDown'
                },
                {
                    gesture: { key: Keys.Up }, canExecute: this.canExecute,
                    execute: this.navigateTopChild.bind(this), name: 'navigationUp'
                },
                {
                    gesture: { key: Keys.Left }, canExecute: this.canExecute,
                    execute: this.navigateLeftChild.bind(this), name: 'navigationLeft'
                },
                {
                    gesture: { key: Keys.Right }, canExecute: this.canExecute,
                    execute: this.navigateRightChild.bind(this), name: 'navigationRight'
                },
                {
                    gesture: { key: Keys.F2 }, canExecute: this.canExecute,
                    execute: this.editChild.bind(this), name: 'editChild'
                },
                {
                    gesture: { key: Keys.F1 }, canExecute: this.canExecute,
                    execute: OrgChartUtilityMethods.onHideNodeClick.bind(OrgChartUtilityMethods), name: 'showShortCut'
                },
                {
                    gesture: { key: Keys.Z, keyModifiers: KeyModifiers.Control }, canExecute: this.canExecute,
                    execute: this.undoOrgChart.bind(this), name: 'undo'
                },
                {
                    gesture: { key: Keys.Y, keyModifiers: KeyModifiers.Control }, canExecute: this.canExecute,
                    execute: this.redoOrgChart.bind(this), name: 'redo'
                },
                {
                    gesture: { key: Keys.Space }, canExecute: this.canExecute,
                    execute: this.spaceOrgChart.bind(this), name: 'expandcollapse'
                },
                {
                    gesture: { key: Keys.X, keyModifiers: KeyModifiers.Control }, canExecute: this.canExecute,
                    execute: this.cutOrgChart.bind(this), name: 'cutObject'
                },
                {
                    gesture: { key: Keys.C, keyModifiers: KeyModifiers.Control }, canExecute: this.canExecute,
                    execute: this.copyOrgChart.bind(this), name: 'copyObject'
                },
                {
                    gesture: { key: Keys.V, keyModifiers: KeyModifiers.Control }, canExecute: this.canExecute,
                    execute: this.pasteOrgChart.bind(this), name: 'pasteObject'
                }
            ]
        };
        commandManager.commands = CommonKeyboardCommands.addCommonCommands(commandManager.commands);
        return commandManager;
    }
    createOrgChart(isNew) {
        const diagram = this.selectedItem.selectedDiagram;
        this.selectedItem.utilityMethods.currentDiagramVisibility('orgchart-diagram', this.selectedItem);
        diagram.updateViewPort();
        if (isNew) {
            diagram.clear();
            OrgChartUtilityMethods.createEmptyOrgChart();
            this.doLayoutSettings(diagram);
        }
        else {
            diagram.commandManager = this.getCommandSettings();
        }
        diagram.contextMenuSettings.show = false;
        diagram.dataBind();
    }
    doLayoutSettings(diagram) {
        diagram.layout = {
            type: 'OrganizationalChart',
            horizontalSpacing: 50, verticalSpacing: 50,
            getLayoutInfo: OrgChartUtilityMethods.getLayoutInfo.bind(OrgChartUtilityMethods)
        };
        diagram.selectedItems = { userHandles: OrgChartUtilityMethods.handle, constraints: SelectorConstraints.UserHandle };
        diagram.tool = DiagramTools.SingleSelect | DiagramTools.ZoomPan;
        diagram.pageSettings = {};
        diagram.commandManager = this.getCommandSettings();
        diagram.snapSettings.constraints = diagram.snapSettings.constraints & ~SnapConstraints.ShowLines;
        diagram.selectedItems.constraints = SelectorConstraints.UserHandle;
        diagram.dataBind();
    }
    copyOrgChart() {
        this.selectedItem.utilityMethods.copyLayout(this.selectedItem);
    }
    pasteOrgChart() {
        this.selectedItem.utilityMethods.pasteLayout(this.selectedItem);
    }
    changeChildParent() {
        this.selectedItem.preventPropertyChange = true;
        const diagram = this.selectedItem.selectedDiagram;
        const selectedNode = diagram.selectedItems.nodes[0];
        if (selectedNode.inEdges.length > 0) {
            const connector1 = this.getConnector(diagram.connectors, selectedNode.inEdges[0]);
            const parentNode = this.getNode(diagram.nodes, connector1.sourceID);
            if (parentNode.inEdges.length > 0) {
                const connector2 = this.getConnector(diagram.connectors, parentNode.inEdges[0]);
                connector1.sourceID = connector2.sourceID;
                diagram.dataBind();
            }
            else {
                diagram.remove(connector1);
            }
            diagram.doLayout();
            diagram.select([selectedNode]);
        }
        this.selectedItem.preventPropertyChange = false;
        this.selectedItem.isModified = true;
    }
    spaceOrgChart() {
        // const diagram: Diagram = this.selectedItem.selectedDiagram;
        // const selectedNode: Node = diagram.selectedItems.nodes[0] as Node;
        // selectedNode.isExpanded = !selectedNode.isExpanded;
        // diagram.dataBind();
    }
    undoOrgChart() {
        this.selectedItem.utilityMethods.undoRedoLayout(true, this.selectedItem);
    }
    redoOrgChart() {
        this.selectedItem.utilityMethods.undoRedoLayout(false, this.selectedItem);
    }
    cutOrgChart() {
        this.selectedItem.utilityMethods.cutLayout(this.selectedItem);
    }
    addChild(args) {
        const diagram = this.selectedItem.selectedDiagram;
        OrgChartUtilityMethods.addChild(diagram.selectedItems.nodes[0].id);
    }
    editChild(args) {
        // const diagram: Diagram = this.selectedItem.selectedDiagram;
        OrgChartUtilityMethods.showCustomProperty();
    }
    addRightChild(args) {
        const diagram = this.selectedItem.selectedDiagram;
        if (diagram.selectedItems.nodes.length > 0) {
            const node = diagram.selectedItems.nodes[0];
            if (node.inEdges.length > 0) {
                const connector1 = this.getConnector(diagram.connectors, node.inEdges[0]);
                OrgChartUtilityMethods.addChild(connector1.sourceID);
            }
        }
    }
    removeChild(args) {
        this.selectedItem.utilityMethods.removeChild(this.selectedItem);
    }
    navigateLeftChild() {
        this.navigateChild('left');
    }
    navigateRightChild() {
        this.navigateChild('right');
    }
    navigateTopChild() {
        this.navigateChild('up');
    }
    navigateBottomChild() {
        this.navigateChild('down');
    }
    navigateChild(direction) {
        const diagram = this.selectedItem.selectedDiagram;
        let node;
        if (direction === 'left' || direction === 'right') {
            const sameLevelNodes = this.getSameLevelNodes();
            const index = sameLevelNodes.indexOf(diagram.selectedItems.nodes[0]);
            node = direction === 'left' ? sameLevelNodes[index - 1] : sameLevelNodes[index + 1];
        }
        else {
            node = this.getMinDistanceNode(diagram, direction);
        }
        if (node) {
            diagram.clearSelection();
            diagram.select([node]);
            diagram.bringIntoView(node.wrapper.bounds);
        }
    }
    getMinDistanceNode(diagram, direction) {
        const node = diagram.selectedItems.nodes[0];
        const selectedNodeBounds = node.wrapper.bounds;
        let lastChildNode = null;
        if (direction === 'up') {
            const edges = node.inEdges;
            if (edges.length > 0) {
                let connector = this.getConnector(diagram.connectors, edges[0]);
                const parentNode = this.getNode(diagram.nodes, connector.sourceID);
                const childNodes = [];
                for (const parentvalue of parentNode.outEdges) {
                    connector = this.getConnector(diagram.connectors, parentvalue);
                    const childNode = this.getNode(diagram.nodes, connector.targetID);
                    if (childNode) {
                        childNodes.push(childNode);
                    }
                }
                if (childNodes.length > 0) {
                    for (const childValue of childNodes) {
                        const childNodeBounds = childValue.wrapper.bounds;
                        if (childNodeBounds.top < selectedNodeBounds.top && childNodeBounds.left === selectedNodeBounds.left) {
                            lastChildNode = childValue;
                        }
                    }
                }
                if (!lastChildNode) {
                    lastChildNode = parentNode;
                }
            }
        }
        else {
            const oldChildBoundsLeft = 0;
            const edges = node.outEdges;
            for (const edge of edges) {
                const connector = this.getConnector(diagram.connectors, edge);
                const childNode = this.getNode(diagram.nodes, connector.targetID);
                if (childNode) {
                    const childNodeBounds = childNode.wrapper.bounds;
                    if (selectedNodeBounds.left >= childNodeBounds.left &&
                        (childNodeBounds.left >= oldChildBoundsLeft || oldChildBoundsLeft === 0)) {
                        if (lastChildNode) {
                            if (childNodeBounds.top <= lastChildNode.wrapper.bounds.top) {
                                lastChildNode = childNode;
                            }
                        }
                        else {
                            lastChildNode = childNode;
                        }
                    }
                }
                if (!lastChildNode) {
                    lastChildNode = childNode;
                }
            }
        }
        return lastChildNode;
    }
    getSameLevelNodes() {
        const sameLevelNodes = [];
        const diagram = this.selectedItem.selectedDiagram;
        if (diagram.selectedItems.nodes.length > 0) {
            const node = diagram.selectedItems.nodes[0];
            let connector = this.getConnector(diagram.connectors, node.inEdges[0]);
            const parentNode = this.getNode(diagram.nodes, connector.sourceID);
            for (const parentvalue of parentNode.outEdges) {
                connector = this.getConnector(diagram.connectors, parentvalue);
                const childNode = this.getNode(diagram.nodes, connector.targetID);
                if (childNode) {
                    sameLevelNodes.push(childNode);
                }
            }
        }
        return sameLevelNodes;
    }
    getConnector(connectors, name) {
        const connector = null;
        for (const value of connectors) {
            if (value.id === name) {
                return value;
            }
        }
        return connector;
    }
    getNode(nodes, name) {
        const node = null;
        for (const value of nodes) {
            if (value.id === name) {
                return value;
            }
        }
        return node;
    }
    canExecute() {
        return true;
    }
}
export class OrgChartUtilityMethods {
    static orgchartPaste() {
        const diagram = this.selectedItem.selectedDiagram;
        const selectedNode = diagram.selectedItems.nodes[0];
        let selectedelement;
        // const mindmapData: { [key: string]: any };
        // const orientation: string;
        diagram.startGroupAction();
        if (this.selectedItem.pasteData.length > 0) {
            diagram.paste(this.selectedItem.pasteData);
            selectedelement = this.selectedItem.pastedFirstItem;
            const connector = {
                id: 'connector' + this.selectedItem.randomIdGenerator(), sourceID: selectedNode.id,
                targetID: selectedelement.id, type: 'Orthogonal',
                style: { strokeColor: 'black', strokeWidth: 2 }
            };
            connector.constraints = ConnectorConstraints.PointerEvents | ConnectorConstraints.Select | ConnectorConstraints.Delete;
            diagram.add(connector);
            diagram.clearSelection();
            diagram.select([selectedelement]);
            diagram.doLayout();
            diagram.bringIntoView(diagram.nodes[diagram.nodes.length - 1].wrapper.bounds);
        }
        this.selectedItem.isModified = true;
        diagram.endGroupAction();
    }
    static showUploadDialog() {
        this.uploadDialog.show();
    }
    static readFile(event) {
        this.orgChart = new OrgChartData(this.selectedItem);
        this.columnsList = [];
        const resultString = event.target.result.toString();
        if (this.fileType === 'csv') {
            this.orgDataSource = OrgChartUtilityMethods.convertCsvToJson(resultString);
        }
        else if (this.fileType === 'json') {
            this.orgDataSource = JSON.parse(resultString);
            for (const dataSource of this.orgDataSource) {
                const attr = dataSource;
                for (const prop in attr) {
                    if (this.columnsList.indexOf(prop) === -1) {
                        this.columnsList.push(prop);
                    }
                }
            }
        }
        else {
            const parser = new DOMParser();
            const xmlDom = parser.parseFromString(resultString, 'text/xml');
            const element = xmlDom.children[0];
            this.orgDataSource = this.convertXmlToJson(element);
        }
        const columns = this.getDataSourceColumns();
        this.selectedItem.orgDataSettings.dataSourceColumns = columns;
    }
    static validateParentChildRelation() {
        let isParentChild = false;
        const ss1 = this.getParentChildValues();
        for (const child of ss1.childValues) {
            if (ss1.parentValues.indexOf(child) !== -1) {
                isParentChild = true;
            }
        }
        return isParentChild;
    }
    static showCustomProperty() {
        const node = this.selectedItem.selectedDiagram.selectedItems.nodes[0];
        this.customProperty = new CustomProperties(this.selectedItem, this.customPropertyDialog);
        this.customProperty.getPropertyDialogContent(node.addInfo);
        this.customPropertyDialog.cssClass = 'db-org-diagram';
        this.customPropertyDialog.dataBind();
        this.customPropertyDialog.show();
    }
    static getParentChildValues() {
        const parentValues = [];
        const childValues = [];
        for (const source of this.orgDataSource) {
            const data = source;
            const childValue = data[this.selectedItem.orgDataSettings.id] ? data[this.selectedItem.orgDataSettings.id].toString() : '';
            const parentValue = data[this.selectedItem.orgDataSettings.parent] ? data[this.selectedItem.orgDataSettings.parent].toString() : '';
            if (childValue) {
                childValues.push(childValue);
            }
            if (parentValue) {
                parentValues.push(parentValue);
            }
        }
        return { "parentValues": parentValues, "childValues": childValues };
    }
    static addChild(sourceId) {
        const diagram = this.selectedItem.selectedDiagram;
        const parentNode = this.getNode(diagram.nodes, sourceId);
        diagram.startGroupAction();
        const node = {
            id: 'node' + this.selectedItem.randomIdGenerator(),
            minWidth: parentNode.minWidth, minHeight: parentNode.minHeight, maxHeight: parentNode.maxHeight,
            annotations: [{ content: 'Name', style: { bold: true, fontSize: 14 } }],
            style: { fill: parentNode.style.fill, strokeColor: parentNode.style.strokeColor, strokeWidth: parentNode.style.strokeWidth },
            offsetX: 200, offsetY: 200
        };
        node.constraints = NodeConstraints.Default | NodeConstraints.AllowDrop;
        if (parentNode.shape && parentNode.shape.type === 'Image') {
            node.shape = { type: 'Image', source: './orgchart_images/blank-male.jpg', align: 'XMinYMin', scale: 'Meet' };
        }
        else {
            node.shape = { type: 'Basic', shape: 'Rectangle', cornerRadius: 5 };
        }
        const keys = Object.keys(parentNode.addInfo);
        const addInfo = {};
        for (const value of keys) {
            const key = value;
            const keyValue = cloneObject(parentNode.addInfo[key]);
            addInfo[key] = keyValue;
            if (key !== 'Name') {
                addInfo[key].value = '';
            }
            else {
                addInfo[key].value = 'Name';
            }
        }
        node.addInfo = cloneObject(addInfo);
        diagram.add(node);
        const connector = {
            id: 'connector' + this.selectedItem.randomIdGenerator(), sourceID: sourceId,
            targetID: node.id, type: 'Orthogonal',
            style: { strokeColor: 'black', strokeWidth: 2 }
        };
        connector.constraints = ConnectorConstraints.PointerEvents | ConnectorConstraints.Select | ConnectorConstraints.Delete;
        diagram.add(connector);
        const node1 = this.getNode(diagram.nodes, node.id);
        diagram.doLayout();
        diagram.endGroupAction();
        this.selectedItem.preventPropertyChange = true;
        diagram.select([node1]);
        this.selectedItem.preventPropertyChange = false;
        diagram.bringIntoView(node1.wrapper.bounds);
        this.selectedItem.isModified = true;
    }
    static createEmptyOrgChart() {
        const diagram = this.selectedItem.selectedDiagram;
        diagram.constraints = diagram.constraints & ~DiagramConstraints.UndoRedo;
        const node = {
            id: 'rootNode', minWidth: 150, minHeight: 50, maxHeight: 50,
            annotations: [{ content: 'Name', style: { fontSize: 14, bold: true } }],
            shape: { type: 'Basic', shape: 'Rectangle', cornerRadius: 5 },
            style: { fill: '#C4F2E8', strokeColor: '#8BC1B7', strokeWidth: 2 },
            addInfo: {
                'Name': { value: 'Name', type: 'nameField', checked: true },
                'Image URL': { value: '', type: 'imageField', checked: false }
            },
        };
        node.constraints = NodeConstraints.Default & ~NodeConstraints.Delete;
        node.constraints |= NodeConstraints.AllowDrop;
        diagram.add(node);
        const node1 = {
            id: 'textNode', width: 400, height: 300,
            offsetX: diagram.scrollSettings.viewPortWidth - 200,
            offsetY: 150, shape: { type: 'HTML', content: this.getShortCutString() }, style: { strokeWidth: 0 },
            excludeFromLayout: true, constraints: NodeConstraints.Default & ~NodeConstraints.Delete
        };
        diagram.add(node1);
        document.getElementById('diagram').querySelector('#closeIconDiv').onclick = this.onHideNodeClick.bind(this);
        diagram.constraints = diagram.constraints | DiagramConstraints.UndoRedo;
    }
    static onHideNodeClick() {
        const node1 = MindMapUtilityMethods.getNode(this.selectedItem.selectedDiagram.nodes, 'textNode');
        node1.visible = !node1.visible;
        this.selectedItem.selectedDiagram.dataBind();
    }
    static getShortCutString() {
        return '<div style="width: 400px; height: 300px; padding: 10px; background-color: #FFF7B5; border: 1px solid #FFF7B5">' +
            '<div id="closeIconDiv" style="float: right; width: 22px; height: 22px; border: 1px solid #FFF7B5">' +
            '<span class="sf-icon-Close" style="font-size:14px;cursor:pointer;"></span>' +
            '</div>' +
            '<div>' +
            '<span class="db-html-font-medium">Quick shortcuts</span>' +
            '</div>' +
            '<div style="padding-top:10px">' +
            '<ul>' +
            '<li>' +
            '<span class="db-html-font-medium">Tab : </span>' +
            '<span class="db-html-font-normal">Add a child to parent</span>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div>' +
            '<ul>' +
            '<li>' +
            '<span class="db-html-font-medium">Enter : </span>' +
            '<span class="db-html-font-normal">Add a child to the same level</span>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div>' +
            '<ul>' +
            '<li>' +
            '<span class="db-html-font-medium">Shift + Tab : </span>' +
            '<span class="db-html-font-normal">Move the child parent to the next level</span>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div>' +
            '<ul>' +
            '<li>' +
            '<span class="db-html-font-medium">Delete : </span>' +
            '<span class="db-html-font-normal">Delete a topic</span>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div>' +
            '<ul>' +
            '<li>' +
            '<span class="db-html-font-medium">F2 : </span>' +
            '<span class="db-html-font-normal">Edit a topic</span>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div>' +
            '<ul>' +
            '<li>' +
            '<span class="db-html-font-medium">Esc : </span>' +
            '<span class="db-html-font-normal">End text editing</span>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div>' +
            '<ul>' +
            '<li>' +
            '<span class="db-html-font-medium">Arrow(Up, Down, Left, Right) : </span>' +
            '<span class="db-html-font-normal">Navigate between child</span>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div>' +
            '<ul>' +
            '<li>' +
            '<span class="db-html-font-medium">Spacebar : </span>' +
            '<span class="db-html-font-normal">Expand/Collapse a shape</span>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div>' +
            '<ul>' +
            '<li>' +
            '<span class="db-html-font-medium">F1 : </span>' +
            '<span class="db-html-font-normal">Show/Hide shortcut Key</span>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '</div>';
    }
    static applyDataSource() {
        document.getElementsByClassName('db-property-editor-container')[0].classList.add('orgchart-diagram');
        const diagram = this.selectedItem.selectedDiagram;
        diagram.clear();
        diagram.updateViewPort();
        diagram.getNodeDefaults = this.setNodeDefaults;
        diagram.getConnectorDefaults = this.setConnectorDefaults;
        const items = new DataManager(this.bindFields());
        if (this.fileType === 'xml') {
            diagram.dataSourceSettings = {
                id: 'id', parentId: 'parentId', dataManager: items
            };
        }
        else {
            diagram.dataSourceSettings = {
                id: this.selectedItem.orgDataSettings.id.toString(), parentId: this.selectedItem.orgDataSettings.parent.toString(),
                dataManager: items
            };
        }
        diagram.layout = {
            type: 'OrganizationalChart',
            getLayoutInfo: this.getLayoutInfo.bind(this)
        };
        diagram.selectedItems = { userHandles: OrgChartUtilityMethods.handle, constraints: SelectorConstraints.UserHandle };
        diagram.pageSettings = {};
        // diagram.tool = DiagramTools.SingleSelect | DiagramTools.ZoomPan;
        diagram.commandManager = this.orgChart.getCommandSettings();
        diagram.snapSettings.constraints = diagram.snapSettings.constraints & ~SnapConstraints.ShowLines;
        diagram.selectedItems.constraints = SelectorConstraints.UserHandle;
        diagram.dataBind();
        diagram.dataBind();
        this.uploadDialog.hide();
    }
    static getLayoutInfo(node, options) {
        if (!options.hasSubTree) {
            options.orientation = this.subTreeOrientation;
            options.type = this.subTreeAlignments;
        }
    }
    static convertCsvToJson(csvText) {
        const allTextLines = csvText.split(/\r\n|\n/);
        this.columnsList = allTextLines[0].split(',');
        const lines = [];
        for (let i = 1; i < allTextLines.length; i++) {
            if (allTextLines[i]) {
                const data = allTextLines[i].split(',');
                // if (data.length === headers.length) {
                const tarr = {};
                for (let j = 0; j < this.columnsList.length; j++) {
                    if (data[j].trim().startsWith('"') && !data[j].trim().endsWith('"')) {
                        while (!data[j].trim().endsWith('"')) {
                            data[j] = data[j] + ',' + data[j + 1];
                            data.splice(j + 1, 1);
                        }
                    }
                    tarr[this.columnsList[j]] = data[j];
                }
                lines.push(tarr);
                // }
            }
        }
        return lines;
    }
    static convertXmlToJson(element) {
        const dataSource = [];
        const children = [].slice.call(element.children);
        for (const child of children) {
            const childElement = child;
            const rowData = this.generateRowData(childElement, dataSource.length.toString());
            if (Object.keys(rowData).length > 0) {
                dataSource.push(rowData);
            }
            if (childElement.children.length > 0) {
                const key = 'id';
                this.convertChildXmlToJson(childElement, rowData[key].toString(), dataSource);
            }
        }
        return dataSource;
    }
    static convertChildXmlToJson(element, parentId, dataSource) {
        const children = [].slice.call(element.children);
        for (const item of children) {
            const childElement = item;
            const rowData = this.generateRowData(childElement, dataSource.length.toString(), parentId.toString());
            if (Object.keys(rowData).length > 0) {
                dataSource.push(rowData);
            }
            if (childElement.children.length > 0) {
                const key = 'id';
                this.convertChildXmlToJson(childElement, rowData[key].toString(), dataSource);
            }
        }
    }
    static generateRowData(element, id, parentId) {
        const rowData = {};
        const child = [].slice.call(element.attributes);
        for (const item of child) {
            const attr = item;
            rowData[attr.name] = attr.value;
            if (this.columnsList.indexOf(attr.name) === -1) {
                this.columnsList.push(attr.name);
            }
        }
        let key = 'id';
        rowData[key] = id;
        if (parentId) {
            key = 'parentId';
            rowData[key] = parentId;
        }
        return rowData;
    }
    static getNode(nodes, name) {
        const node = undefined;
        for (const item of nodes) {
            if (item.id === name) {
                return item;
            }
        }
        return node;
    }
    static bindFields() {
        let addInfo = {};
        for (const source of this.orgDataSource) {
            addInfo = {};
            addInfo.nameField = this.selectedItem.orgDataSettings.nameField;
            addInfo.bindingFields = this.selectedItem.orgDataSettings.bindingFields;
            addInfo.imageField = this.selectedItem.orgDataSettings.imageField;
            addInfo.additionalFields = this.selectedItem.orgDataSettings.additionalFields;
            source.addInfo = cloneObject(addInfo);
        }
        return this.orgDataSource;
    }
    static getDataSourceColumns() {
        const columns = [];
        for (const list of this.columnsList) {
            if (list) {
                columns.push({
                    'text': list, 'value': list
                });
            }
        }
        return columns;
    }
    static setConnectorDefaults(connector, diagram) {
        const connector1 = { type: 'Orthogonal', style: { strokeWidth: 2 } };
        return connector1;
    }
    static setNodeDefaults(node, diagram) {
        node.minWidth = node.minWidth || 150;
        node.minHeight = node.minHeight || 100;
        node.maxHeight = node.maxHeight || 100;
        if (node.data) {
            const data = node.data;
            const addInfo = data.addInfo;
            const addInfo1 = {};
            let propName1 = 'Name';
            addInfo1[propName1] = { 'value': data[addInfo.nameField.toString()], 'type': 'nameField', 'checked': true };
            let propertyFields = [addInfo.nameField.toString()];
            if (addInfo.imageField) {
                propName1 = 'Image URL';
                node.shape = {
                    type: 'Image', source: data[addInfo.imageField.toString()].toString(),
                    align: 'XMinYMin', scale: 'Meet'
                };
                node.minWidth = 250;
                addInfo1[propName1] = { 'value': data[addInfo.imageField.toString()], 'type': 'imageField', 'checked': true };
            }
            if (addInfo.bindingFields) {
                const bindingFields = addInfo.bindingFields;
                for (const field of bindingFields) {
                    addInfo1[field] = { 'value': data[field], 'type': 'bindingField', 'checked': true };
                }
                propertyFields = propertyFields.concat(bindingFields);
            }
            const annotations = [];
            let startY = 0.5 - ((propertyFields.length - 1) / 10);
            for (let i = 0; i < propertyFields.length; i++) {
                const content = data[propertyFields[i]];
                const annotation1 = { content: content ? content : '' };
                const offset = { x: 0.5, y: startY };
                if (node.shape && node.shape.type === 'Image') {
                    offset.x = 0;
                    annotation1.margin = { left: 110 };
                    annotation1.horizontalAlignment = 'Left';
                }
                if (i === 0) {
                    annotation1.style = { fontSize: 14, bold: true };
                }
                startY += 0.2;
                annotation1.offset = offset;
                annotations.push(annotation1);
            }
            if (annotations.length > 0) {
                node.annotations = annotations;
            }
            if (addInfo.additionalFields) {
                const additionalFields = addInfo.additionalFields;
                let content = '';
                for (const field of additionalFields) {
                    content = content + field + ':' + data[field] + '\n';
                    addInfo1[field] = { 'value': data[field], 'type': 'bindingField', 'checked': false };
                }
                node.tooltip = { "content": content, "position": 'BottomCenter', "relativeMode": 'Object' };
                node.constraints = NodeConstraints.Default | NodeConstraints.Tooltip;
            }
            node.style.fill = '#88C65C';
            node.style.strokeColor = '#88C65C';
            node.addInfo = addInfo1;
        }
        return node;
    }
}
OrgChartUtilityMethods.subTreeOrientation = 'Vertical';
OrgChartUtilityMethods.subTreeAlignments = 'Alternate';
OrgChartUtilityMethods.shortCutkeys = [
    { 'key': 'Tab', 'value': 'Add a child to parent' },
    { 'key': 'Enter', 'value': 'Add a child to same level' },
    { 'key': 'Shift + Tab', 'value': 'Move the child parent to next level' },
    { 'key': 'Delete', 'value': 'Delete a child' },
    { 'key': 'Spacebar', 'value': 'Expand/Collapse a shape' },
    { 'key': 'F2', 'value': 'Edit a shape' },
    { 'key': 'Esc', 'value': 'End Editing' },
    { 'key': 'Arrow(Up, Down, Left, Right)', 'value': 'Navigate between child' },
];
OrgChartUtilityMethods.handle = [
    {
        name: 'orgAddHandle', pathColor: 'white', backgroundColor: '#7d7d7d', borderColor: 'white',
        pathData: 'M 30.05 15.03 L 30.05 30.05 L 15.02 30.05 L 15.02 39.9 L 30.05 39.9 L 30.05 54.93 L 39.9 54.93 L 39.9 39.9 L 54.93 39.9 L 54.93 30.05 L 39.9 30.05 L 39.9 15.03 z',
        side: 'Left', offset: 0, horizontalAlignment: 'Center', verticalAlignment: 'Center'
    },
    {
        name: 'orgRemoveHandle', pathColor: 'white', backgroundColor: '#7d7d7d', borderColor: 'white',
        pathData: 'M 7.04 22.13 L 92.95 22.13 L 92.95 88.8 C 92.95 91.92 91.55 94.58 88.76 96.74 C 85.97 98.91 82.55 100 78.52 100 L 21.48 100 C 17.45 100 14.03 98.91 11.24 96.74 C 8.45 94.58 7.04 91.92 7.04 88.8 z M 32.22 0 L 67.78 0 L 75.17 5.47 L 100 5.47 L 100 16.67 L 0 16.67 L 0 5.47 L 24.83 5.47 z',
        visible: true, offset: 1, side: 'Right', horizontalAlignment: 'Center', verticalAlignment: 'Center'
    }, {
        name: 'orgEditHandle', pathColor: 'white', backgroundColor: '#7d7d7d', borderColor: 'white',
        pathData: 'M 42.65 30.41 L 67.5 53.99 L 41.2 78.73 C 39.41 80.42 37.34 81.27 34.99 81.27 C 32.65 81.27 30.57 80.49 28.78 78.93 L 25.05 82.44 L 0 82.44 L 16.36 67.05 C 14.57 65.36 13.67 63.41 13.67 61.2 C 13.67 58.99 14.57 56.98 16.36 55.16 z M 78.42 25.49 C 78.57 0 78.73 0.01 78.88 0.01 C 81.09 -0.12 83.09 0.66 84.88 2.35 L 97.52 14.04 C 99.17 15.86 100 17.87 100 20.09 C 100 22.29 99.17 24.24 97.52 25.93 L 71.84 50.09 L 46.79 26.51 L 72.47 2.35 C 74.15 0.77 76.13 -0.02 78.42 25.49 z',
        side: 'Right', offset: 0, horizontalAlignment: 'Center', verticalAlignment: 'Center'
    },
];
OrgChartUtilityMethods.columnsList = [];
OrgChartUtilityMethods.orgDataSource = [];