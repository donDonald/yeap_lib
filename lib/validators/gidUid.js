'use strict';

const assert = require('assert');
const { check } = require('express-validator');

module.exports = function(api) {
    assert(api);

    const rules = () => {
        return [
            check('gid').matches(api.model.types.Gid),
            check('uid').matches(api.model.types.Uid),
        ];
    }

    const validate = require('./validate')(api);

    return {
        rules,
        validate,
    }
}