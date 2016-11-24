import React from 'react'
import { DragSource } from 'react-dnd'

const IMAGE_EXTENSIONS = [
  'jpg',
  'png',
  'bmp',
];

const BaseFile = React.createClass({
  getInitialState: function() {
    return {
      newName: this.getName(),
    };
  },

  componentDidUpdate: function(oldProps, oldState) {
    var reactClass = this;
    if (!oldProps.isRenaming && this.props.isRenaming) {
      window.requestAnimationFrame(function() {
        var currentName = reactClass.refs.newName.value;
        var pointIndex = currentName.lastIndexOf('.');
        reactClass.refs.newName.setSelectionRange(0, pointIndex || currentName.length);
        reactClass.refs.newName.focus();
      });
    }
  },

  handleFileClick: function(event) {
    if (event)
      event.preventDefault();
    this.props.browserProps.preview({
      url: this.props.url,
      name: this.getName(),
      key: this.props.fileKey,
      extension: this.getExtension(),
    });
  },
  handleItemClick: function(event) {
    event.stopPropagation();
    this.props.browserProps.select(this.props.fileKey);
  },
  handleItemDoubleClick: function(event) {
    event.stopPropagation();
    this.handleFileClick();
  },
  handleRenameClick: function(event) {
    if (!this.props.browserProps.renameFile)
      return;
    this.props.browserProps.beginAction('rename', this.props.fileKey);
  },
  handleRenameConfirm: function(event) {
    if (!this.props.browserProps.renameFile)
      return;
    var newKey = this.props.key.substr(0, this.props.key.lastIndexOf('/') + 1);
    newKey += this.state.newName;
    this.props.browserProps.renameFile(this.props.key, newKey);
  },
  handleDeleteClick: function(event) {
    if (!this.props.browserProps.delete)
      return;
    this.props.browserProps.beginAction('delete', this.props.fileKey);
  },
  handleDeleteConfirm: function(event) {
    if (!this.props.browserProps.delete)
      return;
    this.props.browserProps.delete(this.props.key);
  },
  handleCancelEdit: function(event) {
    this.props.browserProps.endAction();
  },
  handleNewNameChange: function(event) {
    var newName = this.refs.newName.value;
    this.setState(state => {
      state.newName = newName;
      return state;
    });
  },
  handleRenameSubmit: function(event) {
    event.preventDefault();
    var newName = this.state.newName.trim();
    if (newName.length == 0) {
      window.notify({
        style: 'error',
        title: 'Invalid new file name',
        body: 'File name cannot be blank',
      });
      return;
    }
    if (newName.indexOf('/') != -1) {
      window.notify({
        style: 'error',
        title: 'Invalid new file name',
        body: 'File names cannot contain forward slashes.',
      });
      return;
    }
    var newKey = this.props.fileKey.substr(0, this.props.fileKey.lastIndexOf('/'));
    newKey += '/';
    newKey += newName;
    this.props.browserProps.renameFile(this.props.fileKey, newKey);
  },
  handleDeleteSubmit: function(event) {
    event.preventDefault();
    this.props.browserProps.delete(this.props.fileKey);
  },

  getName: function() {
    var name = this.props.newKey || this.props.fileKey;
    var slashIndex = name.lastIndexOf('/');
    if (slashIndex != -1)
      name = name.substr(slashIndex + 1);
    return name;
  },
  getExtension: function() {
    var blobs = this.props.fileKey.split('.');
    return blobs[blobs.length - 1].toLowerCase().trim();
  },
  isImage: function() {
    var extension = this.getExtension();
    for (var extensionIndex = 0; extensionIndex < IMAGE_EXTENSIONS.length; extensionIndex++) {
      var imageExtension = IMAGE_EXTENSIONS[extensionIndex];
      if (extension == imageExtension)
        return true;
    }
    return false;
  },
  isPdf: function() {
    var extension = this.getExtension();
    return (extension == 'pdf');
  },

  render: function() {
    return null;
  },
});

const dragSource = {
  beginDrag(props) {
    props.browserProps.select(props.fileKey);
    return {
      key: props.fileKey,
    };
  },

  endDrag(props, monitor, component) {
    if (!monitor.didDrop())
      return;

    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    var fileNameParts = props.fileKey.split('/');
    var fileName = fileNameParts[fileNameParts.length - 1];
    var newKey = dropResult.path + '/' + fileName;
    if (newKey != props.fileKey && props.browserProps.renameFile) {
      props.browserProps.openFolder(dropResult.path + '/');
      props.browserProps.renameFile(props.fileKey, newKey);
    }
  },
};

function dragCollect(connect, monitor) {
  return {
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
};

const targetSource = {
  drop(props, monitor) {
    if (monitor.didDrop())
      return;
    var key = props.newKey || props.fileKey;
    var path = key.substr(0, key.lastIndexOf('/') || key.length);
    var item = monitor.getItem();
    if (item.files && props.browserProps.upload) {
      props.browserProps.openFolder(path + '/');
      props.browserProps.upload(item.files, path + '/');
    }
    return {
      path: path,
    };
  },
};

function targetCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({shallow: true}),
  };
};

module.exports = {
  component: BaseFile,
  dragSource: dragSource,
  dragCollect: dragCollect,
  targetSource: targetSource,
  targetCollect: targetCollect,
};