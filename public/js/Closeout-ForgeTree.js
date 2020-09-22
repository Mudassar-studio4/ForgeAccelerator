/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  // first, check if current visitor is signed in
  jQuery.ajax({
    url: '/api/forge/oauth/token',
    success: function (res) {
      // yes, it is signed in...
      $('#signOut').show();
      $('#refreshHubs').show();

      // prepare sign out
      $('#signOut').click(function () {
        $('#hiddenFrame').on('load', function (event) {
          location.href = '/api/forge/oauth/signout';
        });
        $('#hiddenFrame').attr('src', 'https://accounts.autodesk.com/Authentication/LogOut');
        // learn more about this signout iframe at
        // https://forge.autodesk.com/blog/log-out-forge
      })

      // and refresh button
      $('#refreshHubs').click(function () {
        $('#userHubs').jstree(true).refresh();
      });

      // finally:
      prepareUserHubsTree();
      showUser();
    }
  });


  jQuery.ajax({
    url: '/api/forge/clientId',
    success: function (res) {
      $('#clientId').val(res.clientId);
      $("#provisionAccountSave").click(function () {
        $('#provisionAccountModal').modal('toggle');
        $('#userHubs').jstree(true).refresh();
      });
    }
  });

  $('#autodeskSigninButton').click(function () {
    jQuery.ajax({
      url: '/api/forge/oauth/url',
      success: function (url) {
        location.href = url;
      }
    });
  })
});
var haveBIM360Hub = false;
var previousUrn = 0;
var baseurn = '';
var urns = [];
function prepareUserHubsTree() {
  $('#userHubs').jstree({
    'core': {
      'themes': { "icons": true },
      'multiple': false,
      'data': {
        "url": '/api/forge/datamanagement',
        "dataType": "json",
        'cache': false,
        'data': function (node) {
          $('#userHubs').jstree(true).toggle_node(node);
          return { "id": node.id };
        }
      }
    },
    'checkbox' : {
      'tie_selection': false,
      "three_state": false,
      'whole_node': false
    },
    'types':
        {
      'default': { 'icon': 'glyphicon glyphicon-question-sign' },
      '#': { 'icon': 'glyphicon glyphicon-user' },
      'hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
      'personalHub': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
      'bim360Hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360hub.png' },
      'bim360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360project.png' },
      'a360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360project.png' },
      'folders': { 'icon': 'glyphicon glyphicon-folder-open' },
      'items': { 'icon': 'glyphicon glyphicon-file' },
      'bim360documents': { 'icon': 'glyphicon glyphicon-file' },
      'versions': { 'icon': 'glyphicon glyphicon-time' },
      'unsupported': { 'icon': 'glyphicon glyphicon-ban-circle' }
    },
    
    "sort": function (a, b) {
      var a1 = this.get_node(a);
      var b1 = this.get_node(b);
      var parent = this.get_node(a1.parent);
      if (parent.type === 'items') { // sort by version number
        var id1 = Number.parseInt(a1.text.substring(a1.text.indexOf('v') + 1, a1.text.indexOf(':')))
        var id2 = Number.parseInt(b1.text.substring(b1.text.indexOf('v') + 1, b1.text.indexOf(':')));
        return id1 > id2 ? 1 : -1;
      }
      else if (a1.type !== b1.type) return a1.icon < b1.icon ? 1 : -1; // types are different inside folder, so sort by icon (files/folders)
      else return a1.text > b1.text ? 1 : -1; // basic name/text sort
    },
    "plugins": ["types", "checkbox", "state", "sort"],
    "state": { "key": "autodeskHubs" }// key restore tree state

}).bind("select_node.jstree", function (evt, data) {
  if (!data || !data.node) return;
  if (data.node.type == 'items')
    data.node = $('#userHubs').jstree(true).get_node(data.node.children[0]);

  if (data.node.type == 'versions') {
    if (data.node.id === 'not_available') { alert('No viewable available for this version'); return; }

    baseurn  = data.node.id;
    var filename = $('#userHubs').jstree(true).get_node(data.node.parent).text;
    var fileType = data.node.original.fileType;

    if (fileType == null || baseurn == null || previousUrn == baseurn) return;
    launchViewer(baseurn, filename, fileType);
    previousUrn = baseurn;
    $.notify("loading... " + filename, { className: "info", position:"bottom right" });
  }
}).bind("check_node.jstree", function (evt, data) {
  console.log('check_node.jstree')
    console.log(data)
    var urn = data.node.id;
    urns.push(urn)
    
}).bind("uncheck_node.jstree", function (evt, data) {
  launchViewer(baseurn)
  console.log('check_node.jstree')
    console.log(data)
    var urn = data.node.id;
    for( var i = 0; i < urns.length; i++){ 
      if ( urns[i] === urn) {
        urns.splice(i, 1); 
      }
    }
    for( var i = 0; i < urns.length; i++){ 
      var timer = 100;
      if (i !== 0) {
        timer = timer*i
      }
     
    }
  });
}

function showUser() {
  jQuery.ajax({
    url: '/api/forge/user/profile',
    success: function (profile) {
      var img = '<img src="' + profile.picture + '" height="30px">';
      $('#userInfo').html(img + profile.name);
    }
  });
}