const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');
const positionService = require('./position.service');

// Routes
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), createSchema, create);
router.put('/:id', authorize(Role.Admin), updateSchema, update);
router.delete('/:id', authorize(Role.Admin), _delete);

module.exports = router;

// Controller functions

function getAll(req, res, next) {
    positionService.getAll()
        .then(positions => res.json(positions))
        .catch(next);
}

function getById(req, res, next) {
    positionService.getById(req.params.id)
        .then(position => res.json(position))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow('', null),
        department: Joi.string().allow('', null),
        employeeCount: Joi.number().default(0)
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    positionService.create(req.body)
        .then(position => res.json(position))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().empty(''),
        description: Joi.string().allow('', null),
        department: Joi.string().allow('', null),
        employeeCount: Joi.number()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    positionService.update(req.params.id, req.body)
        .then(position => res.json(position))
        .catch(next);
}

function _delete(req, res, next) {
    positionService.delete(req.params.id)
        .then(() => res.json({ message: 'Position deleted successfully' }))
        .catch(next);
}
