/**
 * @file controller for routing from /v1
 * @link https://github.com/datarhei/restreamer
 * @copyright 2015 datarhei.org
 * @license Apache-2.0
 */
'use strict';

const express = require('express');
const router = new express.Router();
const version = require(require('path').join(global.__base, 'package.json')).version;

// TODO: solve the circular dependency problem and place Restreamer require here

router.get('/version', (req, res) => {
    res.json({
        'version': version,
        'update': require.main.require('./classes/Restreamer').data.updateAvailable
    });
});
router.get('/ip', (req, res) => {
    res.end(require.main.require('./classes/Restreamer').data.publicIp);
});
router.get('/states', (req, res) => {
    const states = require.main.require('./classes/Restreamer').data.states;

    const response = {
        'repeat_to_local_nginx': {
            type: states.repeatToLocalNginx.type,
            message: states.repeatToLocalNginx.message.replace(/\?token=[^\s]+/, '?token=***'),
        },
        'repeat_to_optional_output': {
            type: states.repeatToOptionalOutput.type,
            message: states.repeatToOptionalOutput.message.replace(/\?token=[^\s]+/, '?token=***'),
        },
    };

    res.json(response);
});
router.get('/progresses', (req, res) => {
    const progresses = require.main.require('./classes/Restreamer').data.progresses;

    res.json({
        'repeat_to_local_nginx': {
            'frames': progresses.repeatToLocalNginx.frames,
            'current_fps': progresses.repeatToLocalNginx.currentFps,
            'current_kbps': progresses.repeatToLocalNginx.currentKbps,
            'target_size': progresses.repeatToLocalNginx.targetSize,
            'timemark': progresses.repeatToLocalNginx.timemark
        },
        'repeat_to_optional_output': {
            'frames': progresses.repeatToOptionalOutput.frames,
            'current_fps': progresses.repeatToOptionalOutput.currentFps,
            'current_kbps': progresses.repeatToOptionalOutput.currentKbps,
            'target_size': progresses.repeatToOptionalOutput.targetSize,
            'timemark': progresses.repeatToOptionalOutput.timemark
        }
    });
});

router.post('/stopLocal', function (req, res) {
    // update the last submitted user action & write to DB & update the data on Gui
    require.main.require('./classes/Restreamer').updateUserAction('repeatToLocalNginx', 'stop');
    //update the state and stop the signal
    res.end(require.main.require('./classes/Restreamer').stopStream('repeatToLocalNginx'));
});

router.post('/startLocal', function (req, res) {
    // update the last submitted user action & write to DB & update the data on Gui
    require.main.require('./classes/Restreamer').updateUserAction('repeatToLocalNginx', 'start');
    res.end(
        require.main.require('./classes/Restreamer').startStream(
            require.main.require('./classes/Restreamer').data.addresses.srcAddress,
            'repeatToLocalNginx',
            true
        )
    );
});

router.get('/stateLocal', function (req, res) {
    const state = require.main.require('./classes/Restreamer').getState('repeatToLocalNginx');

    res.json({
        'state': state
    });
});

router.post('/stopExternal', function (req, res) {
    // update the last submitted user action & write to DB & update the data on Gui
    require.main.require('./classes/Restreamer').updateUserAction('repeatToOptionalOutput', 'stop');
    //update the state and stop the signal
    res.end(require.main.require('./classes/Restreamer').stopStream('repeatToOptionalOutput'));
});

router.post('/startExternal', function (req, res) {
    // update the last submitted user action & write to DB & update the data on Gui
    require.main.require('./classes/Restreamer').updateUserAction('repeatToOptionalOutput', 'start');
    res.end(
        require.main.require('./classes/Restreamer').startStream(
            require.main.require('./classes/Restreamer').data.addresses.optionalOutputAddress,
            'repeatToOptionalOutput',
            true
        )
    );
});

router.get('/stateExternal', function (req, res) {
    const state = require.main.require('./classes/Restreamer').getState('repeatToOptionalOutput');

    res.json({
        'state': state
    });
});

router.get('/fetchsnapshot', function (req, res) {
    const snapshotPath = require.main.require('./classes/Restreamer').getSnapshotPath();

    res.download(snapshotPath, 'snapshot.jpg');
});

module.exports = router;
