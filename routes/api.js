var express = require('express');
var router = express.Router();
var Game = require('../models/Game');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(io) {
  // NORMAL API ENDPOINTS
  router.get('/toggle/1', function(req, res) {
    io.sockets.emit('toggle-1');
    res.json({success: true});
  });

  router.get('/toggle/2', function(req, res) {
    io.sockets.emit('toggle-2');
    res.json({success: true});
  });

  router.post('/game/reset', function(req, res) {
    // reset everything
    // create game if not exists
    res.json({success: false, message: 'not impl'});
  });

  router.post('/game/start', function(req, res) {
    // call /game/reset first!!
    // sets isStarted = true
    res.json({success: false, message: 'not impl'});
  });

  router.post('/game/digital/reset', function(req, res) {
    /*
    if digitalIsSet
      do nothing
    else
      clear all the digital path stuff
    */
    res.json({success: false, message: 'not impl'});
  });

  router.post('/game/digital/set/done', function(req, res) {
    /*
    if !isStarted || digitalIsSet || path.length == 0
      do nothing
    else
      digitalIsSet = true
      check for all-are-set condition
    */
    res.json({success: false, message: 'not impl'});
  });

  router.post('/game/digital/set/:id', function(req, res) {
    /*
    if !isStarted || digitalIsSet
      do nothing
    else
      set the next part of this path; must be unique
    */
    res.json({success: false, message: 'not impl'});
  });

  router.get('/game/physical/reset', function(req, res) {
    /*
    if !isStarted || physicalIsSet
      do nothing
    else
      reset the correct grid state for physical
    */
    res.json({success: false, message: 'not impl'});
  });

  router.get('/game/physical/set/:id', function(req, res) {
    /*
    if !isStarted || physicalIsSet
      do nothing
    else
      set the next subsequent component of the correct grid
    */
    res.json({success: false, message: 'not impl'});
  });

  return router;
};
