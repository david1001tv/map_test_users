const express = require('express');

const router = express.Router();
const {
    insertRow,
    deleteRow,
    updateRow
} = require('../../controllers/IDU');

const {
    selectRow,
} = require('../../controllers/select')

/*
 /api/db/
 */

router.post('/insert', insertRow);
router.post('/delete', deleteRow);
router.post('/update', updateRow);
router.get('/select', selectRow);

module.exports = router;